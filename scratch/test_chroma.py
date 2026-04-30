from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

try:
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vector_store = Chroma(embedding_function=embeddings)
    print("Chroma is working")
except Exception as e:
    print(f"Error: {e}")
