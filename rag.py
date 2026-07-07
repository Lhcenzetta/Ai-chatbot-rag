"""
RAG core — retrieval + grounded, bilingual (FR/AR) answer generation.

Flow for each question:
  1. Detect the user's language (Arabic script → 'ar', otherwise 'fr').
  2. Retrieve the TOP_K most relevant chunks from the ChromaDB index.
  3. Build a system prompt that FORCES the model to answer only from those
     chunks, in the user's language, and to admit when it doesn't know.
  4. Call the LLM (local Ollama by default, or an API — see config.py).

The index itself is built by ingest.py — run it first.
"""
import re
from pathlib import Path

from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

import config

# ---------------------------------------------------------------------------
# Language detection — simple and robust: if the message contains Arabic
# script characters, treat it as Arabic (covers Darija written in Arabic
# script too). Everything else defaults to French for this use case.
# ---------------------------------------------------------------------------
_ARABIC_CHARS = re.compile(r"[؀-ۿ]")


def detect_language(text: str) -> str:
    return "ar" if _ARABIC_CHARS.search(text) else "fr"


# ---------------------------------------------------------------------------
# LLM — swappable via .env (LLM_PROVIDER=ollama | api), see config.py
# ---------------------------------------------------------------------------
def _build_llm():
    if config.LLM_PROVIDER == "api":
        # Any OpenAI-compatible endpoint (OpenAI, Mistral API, Groq, ...)
        from langchain_community.chat_models import ChatOpenAI

        if not config.API_KEY:
            raise RuntimeError("LLM_PROVIDER=api but API_KEY is not set in .env")
        return ChatOpenAI(
            model=config.API_MODEL,
            openai_api_key=config.API_KEY,
            openai_api_base=config.API_BASE_URL,
            temperature=0,
        )
    # Default: local Ollama
    from langchain_ollama import ChatOllama

    return ChatOllama(model=config.OLLAMA_MODEL, temperature=0)


# ---------------------------------------------------------------------------
# Vector store — opened once at import time (the index must already exist)
# ---------------------------------------------------------------------------
def _open_retriever():
    if not Path(config.CHROMA_DIR).is_dir():
        raise RuntimeError(
            f"Vector index '{config.CHROMA_DIR}' not found. Run `python ingest.py` first."
        )
    embeddings = HuggingFaceEmbeddings(model_name=config.EMBEDDING_MODEL)
    store = Chroma(
        collection_name=config.COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=config.CHROMA_DIR,
    )
    return store.as_retriever(search_kwargs={"k": config.TOP_K})


_llm = _build_llm()
_retriever = _open_retriever()


# ---------------------------------------------------------------------------
# Prompt — the grounding rules. Written in French (the model follows it fine
# for Arabic replies too) with the refusal phrasing spelled out per language.
# ---------------------------------------------------------------------------
_SYSTEM_TEMPLATE = """Tu es l'assistant virtuel de {company}, une compagnie d'assurance à Agadir, Maroc.

RÈGLES STRICTES :
1. Réponds UNIQUEMENT à partir du CONTEXTE ci-dessous. N'invente JAMAIS de tarifs, garanties, ou détails de contrat.
2. Réponds dans la MÊME LANGUE que le client : s'il écrit en arabe (y compris darija), réponds en arabe ; s'il écrit en français, réponds en français.
3. Si la réponse n'est pas dans le contexte, dis-le poliment et propose de contacter un conseiller :
   - En français : « Je n'ai pas cette information pour le moment. Souhaitez-vous être mis en contact avec un conseiller ? »
   - En arabe : « ما عنديش هاد المعلومة حالياً. واش بغيتي نوصلك بمستشار ديالنا؟ »
4. Sois concis, clair et professionnel. Utilise des listes à puces quand c'est utile.

CONTEXTE (données officielles de {company}) :
{context}"""


def _format_history(history: list[dict]) -> list:
    """Convert [{role, content}] pairs from the frontend into LangChain messages.
    Only the last 6 turns are kept — enough for follow-up questions, small
    enough to keep the prompt fast on a local model."""
    messages = []
    for turn in history[-6:]:
        role = turn.get("role", "")
        content = (turn.get("content") or "").strip()
        if not content:
            continue
        messages.append(AIMessage(content) if role == "assistant" else HumanMessage(content))
    return messages


def answer(question: str, history: list[dict] | None = None) -> dict:
    """Main entry point: returns {reply, sources, lang}."""
    lang = detect_language(question)

    # 1. Retrieve the most relevant chunks
    docs = _retriever.invoke(question)
    context = "\n\n---\n\n".join(d.page_content for d in docs)

    # Unique source filenames, in retrieval order — shown in the UI as proof
    # that the answer comes from company documents.
    sources = list(dict.fromkeys(d.metadata.get("source", "?") for d in docs))

    # 2. Build the grounded prompt and call the LLM
    system = _SYSTEM_TEMPLATE.format(company=config.COMPANY_NAME, context=context)
    messages = [SystemMessage(system), *_format_history(history or []), HumanMessage(question)]

    reply = _llm.invoke(messages).content

    return {"reply": reply, "sources": sources, "lang": lang}
