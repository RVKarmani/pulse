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

from openai import OpenAI

load_dotenv()

ZILLIZ_URI = os.getenv("ZILLIZ_URI")
ZILLIZ_TOKEN = os.getenv("ZILLIZ_TOKEN")
ZILLIZ_COLLECTION = os.getenv("ZILLIZ_COLLECTION")
GOOGLE_GEMINI_APIKEY = os.getenv("GOOGLE_GEMINI_APIKEY")
NOVITA_APIKEY = os.getenv("NOVITA_APIKEY")

# prompt = hub.pull("rlm/rag-prompt")

# llm = ChatGoogleGenerativeAI(
#     model="gemini-2.5-flash-preview-05-20",  # or "gemini-pro"
#     temperature=0,
#     google_api_key=GOOGLE_GEMINI_APIKEY,
# )

# Vector store
milvus_client = MilvusClient(uri=ZILLIZ_URI, token=ZILLIZ_TOKEN)
print(f"Connected to DB: {ZILLIZ_URI} successfully")
search_params = {"metric_type": "COSINE", "params": {"level": 2}}

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

# LLM Model
llm_client = OpenAI(
    base_url="https://api.novita.ai/v3/openai",
    api_key=NOVITA_APIKEY,
)

# For vector embedding
# vec_embed_model = SentenceTransformer("all-distilroberta-v1")

# Embedding model
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

# Prompting
system_prompt = """
You are a helpful assistant that answers questions based strictly on provided news articles.
Do not make up any information. Only use the content from provided articles. If the content is missing or unclear, say so.
If the articles are not relevant to the user's question, respond with: "The provided articles do not contain relevant information to answer this question."
Otherwise, use only the relevant articles to generate a factual, concise, and insightful summary.
"""

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

def llm_call(system_prompt, user_prompt, stream):
    model = "deepseek/deepseek-r1-0528-qwen3-8b"
    max_tokens = 16000

    # To reduce hallucination
    temperature = 0.2
    min_p = 0
    top_p = 0.8
    top_k = 30

    presence_penalty = 0
    frequency_penalty = 0
    repetition_penalty = 1.05
    response_format = { "type": "text" }

    chat_completion_res = llm_client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            }
        ],
        stream=stream,
        max_tokens=max_tokens,
        temperature=temperature,
        top_p=top_p,
        presence_penalty=presence_penalty,
        frequency_penalty=frequency_penalty,
        response_format=response_format,
        extra_body={
        "top_k": top_k,
        "repetition_penalty": repetition_penalty,
        "min_p": min_p
        }
    )




@app.post("/llm/query", response_model=SearchQueryResponse)
async def generate_embedding(request: EmbeddingRequest):
    """
    Generate vector embedding for input text
    """
    try:
        # Generate embedding
        query = request.query
        embedding = get_embeddings(query).tolist()
        search_result = milvus_client.search(
            collection_name=ZILLIZ_COLLECTION,
            data=[embedding],
            limit=5,
            output_fields=["content"],
            search_params=search_params,
        )

        results = []
        relevant_articles = ""
        # Transform result into a clean list of results
        results = []
        for match in search_result[0]:  # search_result is a 2D list
            if match.entity.get("distance") < 0.1:
                print("Not semantically close enough")
                continue
            else:
                content = match.entity.get("content") if match.entity else None
                relevant_articles += top_doc_content
                relevant_articles += "\n---\n"
                results.append(
                    {
                        "primary_key": match.id,
                        "distance": match.distance,
                        "content": content,
                    }
                )

        # filled_prompt = prompt.invoke(
        #     {"question": query, "context": "\n".join(context)}
        # )
        user_prompt = f"""
            Articles:
            {relevant_articles}
            Question: {user_question}

            Summary:
            """
        
        # LLM Call
        stream = True
        chat_completion_res = llm_call(system_prompt, user_prompt, stream)

        # answer = llm.invoke(filled_prompt)

        # Track what stage we're in
        in_thinking = True
        printed_ai_label = False

        complete_response = ""

        thinking_title = "Thinking...\n"
        complete_response += thinking_title
        print(thinking_title)
        
        if stream:
            # Stream tokens as they come
            for chunk in chat_completion_res:
                # if 'choices' not in chunk:
                #     continue
                content = chunk.choices[0].delta.content

                if content:
                    # Detect when thinking ends
                    if in_thinking:
                        complete_response += content
                        print(content, end="", flush=True)
                        if "</think>" in content:
                            in_thinking = False
                    else:
                        if not printed_ai_label:
                            ai_generation_title = "\n\nAI Response :\n"
                            complete_response += ai_generation_title
                            print(ai_generation_title)  # move to next line after thinking block
                            printed_ai_label = True
                        complete_response += content
                        print(content, end="", flush=True)

        else:
            print(chat_completion_res.choices[0].message.content)


        print("\n\nAI responses may include mistakes. Refer the citations given below.")

        return {"results": results, "rag_response": complete_response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
