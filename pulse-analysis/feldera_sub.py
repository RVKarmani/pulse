import asyncio
import json
import logging
import os
from typing import List

import pandas
import requests
from dotenv import load_dotenv
from feldera import FelderaClient, Pipeline
from feldera.enums import PipelineStatus
from langchain_core.documents import Document
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_neo4j import Neo4jGraph
from pymilvus import MilvusClient
from sentence_transformers import SentenceTransformer
from ulid import ulid

from openai import OpenAI
# Setup
load_dotenv()
logging.basicConfig(level=logging.INFO)

GOOGLE_API_KEY = os.getenv("GOOGLE_GEMINI_APIKEY")
FELDERA_HOST = os.getenv("FELDERA_HOST")
PIPELINE_NAME = os.getenv("FELDERA_PIPELINE_NAME")
LLM_MODEL = os.getenv("LLM_MODEL")

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")

ZILLIZ_URI = os.getenv("ZILLIZ_URI")
ZILLIZ_TOKEN = os.getenv("ZILLIZ_TOKEN")
ZILLIZ_COLLECTION = os.getenv("ZILLIZ_COLLECTION")
NOVITA_APIKEY = os.getenv("NOVITA_APIKEY")

# LLM Model
llm_client = OpenAI(
    base_url="https://api.novita.ai/v3/openai",
    api_key=NOVITA_APIKEY,
)

# NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

# Vector store
milvus_client = MilvusClient(uri=ZILLIZ_URI, token=ZILLIZ_TOKEN)
print(f"Connected to DB: {ZILLIZ_URI} successfully")
encoder = SentenceTransformer("all-distilroberta-v1")

check_collection = milvus_client.has_collection(ZILLIZ_COLLECTION)
if check_collection:
    logging.info(f"ℹ️ {ZILLIZ_COLLECTION} exists....")
    collection_property = milvus_client.describe_collection(ZILLIZ_COLLECTION)
    logging.info("ℹ️ Collection details: %s" % collection_property)
else:
    logging.error(f"‼️ {ZILLIZ_COLLECTION} doesn't exist")


graph = Neo4jGraph(url=NEO4J_URI, username=NEO4J_USERNAME, refresh_schema=False)

if not all([GOOGLE_API_KEY, FELDERA_HOST, PIPELINE_NAME, LLM_MODEL]):
    logging.error("‼️ One or more required environment variables are not set.")

# LLM
llm = ChatGoogleGenerativeAI(
    model=LLM_MODEL,
    temperature=0,
    google_api_key=GOOGLE_API_KEY,
)
llm_transformer = LLMGraphTransformer(llm=llm)

# Feldera
feldera_client = FelderaClient(FELDERA_HOST)
feldera_pipeline = Pipeline.get(PIPELINE_NAME, feldera_client)
feldera_url = f"{FELDERA_HOST}/v0/pipelines/{PIPELINE_NAME}/ingress"

change_queue: pandas.DataFrame = (
    asyncio.Queue()
)  # LLM takes time for generating graph, use this for queueing articles and returning from foreach_chunk immediately

vec_embed_model = "baai/bge-m3"

def get_embeddings(texts, model=vec_embed_model, encoding_format="float"):
    result = llm_client.embeddings.create(
        model=model,
        input=texts,
        encoding_format=encoding_format
    )

    embeddings = []

    for query_idx in range(len(result.data)):
        embeddings.append(result.data[query_idx].embedding)

    return embeddings



def make_callback(loop):
    def on_chunk(df: pandas.DataFrame, seq_no: int):
        if df.empty:
            return
        logging.info(f"🚶‍♂️ Received {df}, adding to queue")
        # Use main loop from outer scope
        asyncio.run_coroutine_threadsafe(change_queue.put(df), loop)

    return on_chunk


def to_json_lines(data: List[dict]) -> str:
    return "\n".join([json.dumps({"insert": entry}) for entry in data])


def insert_into_table(data, table_name):
    payload = to_json_lines(data)
    response = requests.post(
        f"{feldera_url}/{table_name}?format=json",
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    if response.ok:
        logging.info(
            f"✅ Inserted {len(data)} {table_name} (HTTP {response.status_code})"
        )
    else:
        logging.error(
            f"❌ Failed to insert {table_name} (HTTP {response.status_code}): {response.text}"
        )


async def process_chunks():
    while True:
        df = await change_queue.get()
        changes = df.to_dict(orient="records")
        logging.info(f"📥 Received {len(changes)} new changes")

        content_arr = []
        documents = []

        for change in changes:
            page_content = f"{change['item_title']}\n{change['item_description']}"
            change_doc = Document(
                page_content=page_content,
                metadata={
                    "title": change["item_title"],
                    "description": change["item_description"],
                    "source_shortcode": change["source_shortcode"],
                },
            )

            content_arr.append(page_content)
            documents.append(change_doc)

        num_content = len(content_arr)
        # Generate embeddings
        embeddings = get_embeddings(content_arr)

        # Insert into vector database
        if len(embeddings) != num_content:
            logging.error(
                f"‼️ Embedding length {len(embeddings)} don't match content length {num_content}"
            )
        else:
            zilliz_insert_arr = []
            for i in range(len(content_arr)):
                zilliz_item = {
                    "content": content_arr[i],
                    "vector": embeddings[i],
                }
                zilliz_insert_arr.append(zilliz_item)
            milvus_client.insert(ZILLIZ_COLLECTION, zilliz_insert_arr)
            logging.info(f"🍽️ Ingested {num_content} articles into vectordb")

        graph_docs = await llm_transformer.aconvert_to_graph_documents(documents)
        # graph.add_graph_documents(graph_docs, baseEntityLabel=True, include_source=True)

        for doc in graph_docs:
            doc_ulid = str(ulid())
            logging.info(f"🧠 Processing graph document: {doc_ulid}")

            # Insert nodes
            nodes = [
                {"id": n.id, "node_type": n.type, "data_ulid": doc_ulid}
                for n in doc.nodes
            ]

            insert_into_table(nodes, "nodes")

            # Insert relationships
            relationships = [
                {
                    "source_node_id": r.source.id,
                    "target_node_id": r.target.id,
                    "rel_type": r.type,
                    "data_ulid": doc_ulid,
                }
                for r in doc.relationships
            ]
            insert_into_table(relationships, "relationships")


async def main():
    # Main thread
    loop = asyncio.get_running_loop()

    logging.info("🏁 Starting Feldera Consumer")

    feldera_pipeline.foreach_chunk("source_data", make_callback(loop))

    if feldera_pipeline.status() != PipelineStatus.RUNNING:
        logging.info(f"🏁 Starting Pipeline {PIPELINE_NAME}")
        feldera_pipeline.start()

    await process_chunks()


if __name__ == "__main__":
    asyncio.run(main())
