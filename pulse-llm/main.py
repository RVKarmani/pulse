from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from fastapi.responses import StreamingResponse
import asyncio
import json
import os
from dotenv import load_dotenv
from pymilvus import MilvusClient
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import re

def clean_thinking_text(text: str) -> str:
    # Remove any <think>...</think> tags
    return re.sub(r"</?think>", "", text)


# Load environment variables
load_dotenv()

ZILLIZ_URI = os.getenv("ZILLIZ_URI")
ZILLIZ_TOKEN = os.getenv("ZILLIZ_TOKEN")
ZILLIZ_COLLECTION = os.getenv("ZILLIZ_COLLECTION")
NOVITA_APIKEY = os.getenv("NOVITA_APIKEY")

# Milvus setup
milvus_client = MilvusClient(uri=ZILLIZ_URI, token=ZILLIZ_TOKEN)
print(f"Connected to DB: {ZILLIZ_URI} successfully")
search_params = {"metric_type": "COSINE", "params": {"level": 2}}

# FastAPI app
app = FastAPI(
    title="Pulse LLM API", description="API for Pulse LLM services", version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:3000",
        "https://deep-needlessly-sawfly.ngrok-free.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# LLM client setup
llm_client = OpenAI(
    base_url="https://api.novita.ai/v3/openai",
    api_key=NOVITA_APIKEY,
)

vec_embed_model = "baai/bge-m3"


def get_embeddings(texts, model=vec_embed_model, encoding_format="float"):
    result = llm_client.embeddings.create(
        model=model, input=texts, encoding_format=encoding_format
    )
    return [item.embedding for item in result.data]


# Prompts
system_prompt = """
You are a helpful assistant that answers questions based strictly on provided news articles.
Do not make up any information. Only use the content from provided articles. If the content is missing or unclear, say so.
If the articles are not relevant to the user's question, respond with: "The provided articles do not contain relevant information to answer this question."
Otherwise, use only the relevant articles to generate a factual, concise, and insightful summary.
"""


# Schemas
class HealthResponse(BaseModel):
    status: str
    version: str


class SearchRequest(BaseModel):
    query: str


class SearchResultItem(BaseModel):
    primary_key: int
    distance: float
    content: str


class SearchQueryResponse(BaseModel):
    results: List[SearchResultItem]
    rag_response: str


# LLM Call wrapper
def llm_call(system_prompt, user_prompt, stream=True):
    return llm_client.chat.completions.create(
        model="deepseek/deepseek-r1-0528-qwen3-8b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        stream=stream,
        max_tokens=16000,
        temperature=0.2,
        top_p=0.8,
        presence_penalty=0,
        frequency_penalty=0,
        response_format={"type": "text"},
        extra_body={"top_k": 30, "repetition_penalty": 1.05, "min_p": 0},
    )


# Routes
@app.get("/llm/")
async def root():
    return {"message": "Welcome to Pulse LLM API"}


@app.get("/llm/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="healthy", version="1.0.0")


@app.post("/llm/query", response_model=SearchQueryResponse)
async def stream_rag_process(request: SearchRequest):
    try:
        query = request.query
        embedding = get_embeddings(query)
        search_result = milvus_client.search(
            collection_name=ZILLIZ_COLLECTION,
            data=embedding,
            limit=5,
            output_fields=["content"],
            search_params=search_params,
        )

        results = []
        relevant_articles = ""
        for match in search_result[0]:
            if match.entity.get("distance") < 0.4:
                continue
            content = match.entity.get("content") or ""
            relevant_articles += content + "\n---\n"
            results.append(
                {
                    "primary_key": match.id,
                    "distance": match.distance,
                    "content": content,
                }
            )

        user_prompt = f"""
            Articles:
            {relevant_articles}
            Question: {query}

            Summary:
        """

        stream = True
        chat_completion_res = llm_call(system_prompt, user_prompt, stream)

        async def token_generator():
            # First yield the search results as a JSON chunk with stage 'result'
            yield json.dumps({"stage": "results", "content": (results)}) + "\n"

            in_thinking = True

            try:
                for chunk in chat_completion_res:
                    content = chunk.choices[0].delta.content
                    if not content:
                        continue

                    if in_thinking:
                        yield json.dumps({"stage": "thinking", "content": clean_thinking_text(content)}) + "\n"
                        if "</think>" in content:
                            in_thinking = False
                    else:
                        yield json.dumps({"stage": "response", "content": clean_thinking_text(content)}) + "\n"

                    await asyncio.sleep(0)

            except Exception as e:
                yield json.dumps({"stage": "error", "content": str(e)}) + "\n"

        return StreamingResponse(token_generator(), media_type="application/json")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Entry point
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
