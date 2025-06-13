import os
import json
import asyncio
import logging
import ulid
from typing import List
from dotenv import load_dotenv
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.documents import Document
from feldera import FelderaClient, Pipeline
import requests
from feldera.enums import PipelineStatus
import pandas

from langchain_neo4j import Neo4jGraph

# Setup

load_dotenv()
logging.basicConfig(level=logging.INFO)

GOOGLE_API_KEY = os.getenv("GOOGLE_GEMINI_APIKEY")
FELDERA_HOST = os.getenv("FELDERA_HOST")
PIPELINE_NAME = os.getenv("FELDERA_PIPELINE_NAME")
LLM_MODEL = os.getenv("LLM_MODEL")

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
# NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

graph = Neo4jGraph(url=NEO4J_URI, username=NEO4J_USERNAME, refresh_schema=False)

if not all([GOOGLE_API_KEY, FELDERA_HOST, PIPELINE_NAME, LLM_MODEL]):
    raise EnvironmentError("One or more required environment variables are not set.")

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
)  # LLM takes time for generating graph, use this for queueing articles and returning from foreach_chunk


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
        documents = [
            Document(
                page_content=f"{change['item_title']} {change['item_description']}",
                metadata={
                    "title": change["item_title"],
                    "description": change["item_description"],
                    "source_shortcode": change["source_shortcode"],
                },
            )
            for change in changes
        ]

        graph_docs = await llm_transformer.aconvert_to_graph_documents(documents)
        graph.add_graph_documents(graph_docs, baseEntityLabel=True, include_source=True)

        for doc in graph_docs:
            doc_ulid = str(ulid.new())
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

    feldera_pipeline.foreach_chunk("source_data", make_callback(loop))

    if feldera_pipeline.status() != PipelineStatus.RUNNING:
        logging.info(f"🏁 Starting Pipeline {PIPELINE_NAME}")
        feldera_pipeline.start()

    await process_chunks()


if __name__ == "__main__":
    asyncio.run(main())
