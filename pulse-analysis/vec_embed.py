from sentence_transformers import SentenceTransformer


sentence="Who supports Israel"

encoder = SentenceTransformer('all-distilroberta-v1')

embeddings = encoder.encode([sentence])


for embedding in embeddings[0]:
    print(f"{embedding},")
