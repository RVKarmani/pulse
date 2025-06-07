import os
import asyncio
from langchain_experimental.graph_transformers import LLMGraphTransformer
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.documents import Document
from dotenv import load_dotenv
import requests
import json
import ulid

load_dotenv()
api_key = os.getenv("GOOGLE_GEMINI_APIKEY")

# from langchain_neo4j import Neo4jGraph

# neo4j_uri=os.getenv("NEO4J_URI")
# neo4j_username=os.getenv("NEO4J_USERNAME")
# neo4j_password=os.getenv("NEO4J_PASSWORD")

# graph = Neo4jGraph(url=neo4j_uri, username=neo4j_username, password=neo4j_password, refresh_schema=False)

feldera_host = os.getenv("FELDERA_HOST")
feldera_pipeline = os.getenv("FELDERA_PIPELINE_NAME")
FELDERA_URL = f"{feldera_host}/v0/pipelines/{feldera_pipeline}/ingress"


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-preview-05-20",  # or "gemini-pro"
    temperature=0,
    google_api_key=api_key,
)

llm_transformer = LLMGraphTransformer(llm=llm)
articles_data = [
    {
        "title": "Trump Allies Try to Discredit Experts Warning About the Cost of Tax Cuts",
        "description": "President Trump and his allies have united around a new foe: the economists and budget experts who have warned about the costs of Republicans' tax ambitions.",
        "source_shortcode": "nyt",
    },
    {
        "title": "Trump's Policy Bill Would Add $2.4 Trillion to Debt, Budget Office Says",
        "description": "The estimate from the nonpartisan Congressional Budget Office is all but certain to inflame an already intense debate inside the G.O.P. about the fiscal consequences of their bill to enact President Trump's agenda.",
        "source_shortcode": "nyt",
    },
    {
        "title": "Brown Disciplined a Student Who Asked Questions in the Style of Elon Musk and DOGE",
        "description": "A conservative student newspaper had DOGE-style questions about the work of Brown University staff. Its writers were summoned to disciplinary hearings.",
        "source_shortcode": "nyt",
    },
    {
        "title": "Before the Attack in Boulder, the Gaza War Consumed the City Council",
        "description": "Activists have regularly disrupted council meetings to demand that the city call for a cease-fire in Gaza. The unusual tension suggests a changing Boulder.",
        "source_shortcode": "nyt",
    },
    {
        "title": "Trump Asks Congress to Claw Back $9 Billion for Foreign Aid, NPR and PBS",
        "description": "The request seeks to codify spending cuts advanced by Elon Musk's Department of Government Efficiency.",
        "source_shortcode": "cnn",
    },
    {
        "title": "Some House Republicans Have Regrets After Passing Trump's Domestic Policy Bill",
        "description": "The sprawling legislation carrying President Trump's domestic agenda squeaked through the House with one vote to spare, but some Republicans now say they didn't realize what they voted for.",
        "source_shortcode": "cnn",
    },
    {
        "title": "Justice Dept. Drops Biden-Era Push to Obtain Peter Navarro's Emails",
        "description": "The department's move is one of many recent actions taken to dismiss criminal and civil actions against Trump allies such as Mr. Navarro, the president's trade adviser.",
        "source_shortcode": "cnn",
    },
]


documents = [
    Document(
        page_content=f"{item['title']} {item['description']}",
        metadata={
            "title": item["title"],
            "description": item["description"],
            "source_shortcode": item["source_shortcode"],
        },
    )
    for item in articles_data
]


def to_json_lines(data: list[dict]) -> str:
    return "\n".join([f'{{"insert": {json.dumps(entry)}}}' for entry in data])


headers = {"Content-Type": "application/json"}


# Wrap the async code in a function
async def main():
    source_payload = to_json_lines(
        [
            {
                "source_shortcode": article["source_shortcode"],
                "item_title": article["title"],
                "item_description": article["description"],
            }
            for article in articles_data
        ]
    )

    resp_source = requests.post(
        f"{FELDERA_URL}/source_data?format=json", data=source_payload, headers=headers
    )

    print(f"Inserted {len(articles_data)} articles — status {resp_source.status_code}")

    graph_documents = await llm_transformer.aconvert_to_graph_documents(documents)
    for doc in graph_documents:
        doc_ulid = str(ulid.new())
        print(f"Ingesting {doc_ulid} for\n{doc}")
        
        # ---- Nodes ----
        node_payload = to_json_lines(
            [
                {"id": node.id, "node_type": node.type, "data_ulid": doc_ulid}
                for node in doc.nodes
            ]
        )
        resp_nodes = requests.post(
            f"{FELDERA_URL}/nodes?format=json", data=node_payload, headers=headers
        )
        print(f"Inserted {len(doc.nodes)} nodes — status {resp_nodes.status_code}")

        # ---- Relationships ----
        rel_payload = to_json_lines(
            [
                {
                    "source_node_id": rel.source.id,
                    "target_node_id": rel.target.id,
                    "rel_type": rel.type,
                    "data_ulid": doc_ulid,
                }
                for rel in doc.relationships
            ]
        )

        resp_rels = requests.post(
            f"{FELDERA_URL}/relationships?format=json", data=rel_payload, headers=headers
        )
        print(
            f"Inserted {len(doc.relationships)} relationships — status {resp_rels.status_code}"
        )
    # graph.add_graph_documents(graph_documents, baseEntityLabel=True, include_source=True)


# Run the async main
asyncio.run(main())
