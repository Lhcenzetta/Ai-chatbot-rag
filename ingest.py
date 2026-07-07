"""
Ingestion script — builds the vector index from everything in `data/`.

Usage:
    python ingest.py

How it works (the whole RAG "indexing" side):
  1. Load every .md / .txt / .pdf file found in DATA_DIR.
  2. Split them into overlapping chunks (small enough to embed & retrieve well).
  3. Embed each chunk with a MULTILINGUAL model (French + Arabic share one
     vector space, so an Arabic question can match a French document).
  4. Persist everything into a ChromaDB folder (CHROMA_DIR).

Idempotent: each run deletes the previous collection and rebuilds it from
scratch, so "plug in the real data" = drop files in data/ and re-run this.
"""
import sys
from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

import config


def load_documents(data_dir: Path) -> list[Document]:
    """Read every supported file in data/ into LangChain Documents.

    The filename is stored in metadata["source"] — the frontend shows it
    under each answer to prove the reply is grounded in company data.
    """
    documents: list[Document] = []
    for path in sorted(data_dir.iterdir()):
        if path.suffix.lower() in {".md", ".txt"}:
            text = path.read_text(encoding="utf-8").strip()
            if text:
                documents.append(
                    Document(page_content=text, metadata={"source": path.name})
                )
        elif path.suffix.lower() == ".pdf":
            for page in PyPDFLoader(str(path)).load():
                page.metadata["source"] = path.name
                documents.append(page)
    return documents


def main() -> None:
    data_dir = Path(config.DATA_DIR)

    # Graceful failure if there is nothing to ingest
    if not data_dir.is_dir():
        sys.exit(f"❌ Data folder '{data_dir}' not found. Create it and add documents.")
    documents = load_documents(data_dir)
    if not documents:
        sys.exit(f"❌ No .md / .txt / .pdf files found in '{data_dir}'. Nothing to ingest.")

    print(f"📄 Loaded {len(documents)} document(s) from '{data_dir}'")

    # 2. Chunking — overlap keeps sentences that straddle a boundary retrievable
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.CHUNK_SIZE, chunk_overlap=config.CHUNK_OVERLAP
    )
    chunks = splitter.split_documents(documents)
    print(f"✂️  Split into {len(chunks)} chunks (size={config.CHUNK_SIZE}, overlap={config.CHUNK_OVERLAP})")

    # 3. Multilingual embeddings (first run downloads the model, ~500 MB)
    print(f"🧠 Embedding with '{config.EMBEDDING_MODEL}' ...")
    embeddings = HuggingFaceEmbeddings(model_name=config.EMBEDDING_MODEL)

    # 4. Rebuild the collection from scratch (idempotent re-runs)
    store = Chroma(
        collection_name=config.COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=config.CHROMA_DIR,
    )
    store.reset_collection()  # wipe previous index
    store.add_documents(chunks)

    print(f"✅ Indexed {len(chunks)} chunks into '{config.CHROMA_DIR}' "
          f"(collection: {config.COLLECTION_NAME})")
    print("   You can now start the API:  uvicorn app:app --reload")


if __name__ == "__main__":
    main()
