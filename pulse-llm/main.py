from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from pymilvus import MilvusClient
import os
from fastapi.middleware.cors import CORSMiddleware
from langchain import hub
from langchain_google_genai import ChatGoogleGenerativeAI


load_dotenv()

ZILLIZ_URI = os.getenv("ZILLIZ_URI")
ZILLIZ_TOKEN = os.getenv("ZILLIZ_TOKEN")
ZILLIZ_COLLECTION = os.getenv("ZILLIZ_COLLECTION")

GOOGLE_GEMINI_APIKEY = os.getenv("GOOGLE_GEMINI_APIKEY")

prompt = hub.pull("rlm/rag-prompt")


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-preview-05-20",  # or "gemini-pro"
    temperature=0,
    google_api_key=GOOGLE_GEMINI_APIKEY,
)

# Vector store
milvus_client = MilvusClient(uri=ZILLIZ_URI, token=ZILLIZ_TOKEN)
print(f"Connected to DB: {ZILLIZ_URI} successfully")
search_params = {"metric_type": "COSINE", "params": {}}

origins = [
    "http://localhost",
    "http://localhost:3000",
    "https://deep-needlessly-sawfly.ngrok-free.app", 
]

app = FastAPI(
    title="Pulse LLM API", description="API for Pulse LLM services", version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# For vector embedding
vec_embed_model = SentenceTransformer("all-distilroberta-v1")


class HealthResponse(BaseModel):
    status: str
    version: str


@app.get("/llm/")
async def root():
    return {"message": "Welcome to Pulse LLM API"}


@app.get("/llm/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="healthy", version="1.0.0")


class EmbeddingRequest(BaseModel):
    query: str


class SearchResultItem(BaseModel):
    primary_key: int
    distance: float
    content: str


class SearchQueryResponse(BaseModel):
    results: List[SearchResultItem]
    rag_response: str


@app.post("/llm/query", response_model=SearchQueryResponse)
async def generate_embedding(request: EmbeddingRequest):
    """
    Generate vector embedding for input text
    """
    try:
        # Generate embedding
        query = request.query
        embedding = vec_embed_model.encode(query).tolist()
        search_result = milvus_client.search(
            collection_name=ZILLIZ_COLLECTION,
            data=[embedding],
            limit=3,
            output_fields=["content"],
            search_params=search_params,
        )

        context = []
        # Transform result into a clean list of results
        results = []
        for hit in search_result[0]:  # search_result is a 2D list
            content = hit.entity.get("content") if hit.entity else None
            context.append(content)
            results.append(
                {
                    "primary_key": hit.id,
                    "distance": hit.distance,
                    "content": content,
                }
            )

        filled_prompt = prompt.invoke({"question": query, "context": "\n".join(context)})
        answer = llm.invoke(filled_prompt)

        return {"results": results, "rag_response": answer.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
