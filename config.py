"""
Central configuration — every tunable lives here and is overridable via .env.
Copy .env.example to .env and adjust. Nothing here contains secrets.
"""
import os
from dotenv import load_dotenv

load_dotenv()  # reads .env at project root if present

# --- Company branding (shown in API responses / used by prompts) ---
COMPANY_NAME = os.getenv("COMPANY_NAME", "Atlas Assurances Agadir")

# --- LLM provider: "ollama" (local, default) or "api" (OpenAI-compatible) ---
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama").lower()

# Ollama settings (used when LLM_PROVIDER=ollama)
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma4:e2b")

# API settings (used when LLM_PROVIDER=api) — any OpenAI-compatible endpoint
# (OpenAI, Mistral API, Groq, OpenRouter...). Key comes ONLY from env, never code.
API_BASE_URL = os.getenv("API_BASE_URL", "https://api.openai.com/v1")
API_MODEL = os.getenv("API_MODEL", "gpt-4o-mini")
API_KEY = os.getenv("API_KEY", "")

# --- Embeddings: multilingual so French AND Arabic queries match the docs ---
EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

# --- RAG / vector store ---
DATA_DIR = os.getenv("DATA_DIR", "data")            # drop real docs here
CHROMA_DIR = os.getenv("CHROMA_DIR", "chroma_db")   # persisted index
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "insurance_docs")
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "600"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "80"))
TOP_K = int(os.getenv("TOP_K", "4"))                # chunks retrieved per question
