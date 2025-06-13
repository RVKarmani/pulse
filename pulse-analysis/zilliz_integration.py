import pymilvus
from pymilvus import connections, Collection, utility
import numpy as np
from sentence_transformers import SentenceTransformer

class ZillizVectorStore:
    def __init__(self, uri="localhost", port="19530", user="", password="", collection_name="news_store"):
        self.uri = uri
        self.port = port
        self.user = user
        self.password = password
        self.collection_name = collection_name
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        self.dim = 384  # Dimension of the embeddings from all-MiniLM-L6-v2
        
        # Connect to Zilliz Cloud
        connections.connect(
            alias="default",
            uri=self.uri,
            port=self.port,
            user=self.user,
            password=self.password
        )
        
        # Create collection if it doesn't exist
        self._create_collection()
    
    def _create_collection(self):
        if not utility.has_collection(self.collection_name):
            from pymilvus import CollectionSchema, FieldSchema, DataType
            
            fields = [
                FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
                FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=65535),
                FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=self.dim)
            ]
            schema = CollectionSchema(fields=fields, description="Text and its embeddings")
            collection = Collection(name=self.collection_name, schema=schema)
            
            # Create an IVF_FLAT index for the embedding field
            index_params = {
                "metric_type": "L2",
                "index_type": "IVF_FLAT",
                "params": {"nlist": 1024}
            }
            collection.create_index(field_name="embedding", index_params=index_params)
    
    def add_texts(self, texts):
        """Add texts to the vector store"""
        collection = Collection(self.collection_name)
        collection.load()
        
        # Generate embeddings
        embeddings = self.encoder.encode(texts)
        
        # Insert data
        entities = [
            texts,
            embeddings.tolist()
        ]
        collection.insert(entities)
        collection.flush()
        
        return True
    
    def semantic_search(self, query_text, top_k=5):
        """Perform semantic search"""
        collection = Collection(self.collection_name)
        collection.load()
        
        # Generate query embedding
        query_embedding = self.encoder.encode([query_text])[0]
        
        # Search parameters
        search_params = {"metric_type": "L2", "params": {"nprobe": 10}}
        
        # Perform search
        results = collection.search(
            data=[query_embedding.tolist()],
            anns_field="embedding",
            param=search_params,
            limit=top_k,
            output_fields=["text"]
        )
        
        # Format results
        search_results = []
        for hits in results:
            for hit in hits:
                search_results.append({
                    "text": hit.entity.get('text'),
                    "score": hit.score
                })
        
        return search_results
    
    def close(self):
        """Close the connection to Zilliz Cloud"""
        connections.disconnect("default")

# Example usage:
'''
zilliz_store = ZillizVectorStore(
    uri="your-cluster-endpoint",
    port="your-port",
    user="your-username",
    password="your-password",
    collection_name="your-collection-name"
)

# Add texts
texts = ["This is a sample text", "Another example text"]
zilliz_store.add_texts(texts)

# Perform semantic search
results = zilliz_store.semantic_search("sample query", top_k=3)
for result in results:
    print(f"Text: {result['text']}, Score: {result['score']}")

# Close connection
zilliz_store.close()
'''