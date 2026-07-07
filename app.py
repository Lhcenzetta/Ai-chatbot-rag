"""
FastAPI backend for the bilingual insurance RAG chatbot.

Endpoints:
  GET  /health    → liveness + config summary (nice for the demo)
  POST /chat      → {message, history} → {reply, sources, lang}
  POST /api/chat  → legacy endpoint kept for the old widget (templates/)
  GET  /          → serves the legacy standalone widget (zero-build fallback)

Run:  uvicorn app:app --reload
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

import config
import rag

app = FastAPI(title=f"{config.COMPANY_NAME} — Chatbot RAG")

# CORS open for the MVP so the Vite dev server (port 5173) can call the API.
# Restrict allow_origins to the real site domain before production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


# --- Schemas ---------------------------------------------------------------
class HistoryTurn(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: list[HistoryTurn] = []


class LegacyQuery(BaseModel):
    text: str


# --- Routes ----------------------------------------------------------------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "company": config.COMPANY_NAME,
        "llm_provider": config.LLM_PROVIDER,
        "model": config.OLLAMA_MODEL if config.LLM_PROVIDER == "ollama" else config.API_MODEL,
        "embedding_model": config.EMBEDDING_MODEL,
    }


@app.post("/chat")
def chat(req: ChatRequest):
    """Main chat endpoint used by the React frontend."""
    result = rag.answer(req.message, [t.model_dump() for t in req.history])
    return result


@app.post("/api/chat")
def legacy_chat(query: LegacyQuery):
    """Legacy route kept so the standalone widget (templates/index.html) still works."""
    result = rag.answer(query.text)
    return {"reply": result["reply"]}


@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
