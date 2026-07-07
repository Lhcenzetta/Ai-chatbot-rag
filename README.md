# Chatbot Assurance RAG — Bilingue Français / العربية

MVP d'un assistant virtuel pour une compagnie d'assurance (Agadir).
Il répond aux questions des clients **uniquement à partir des documents de la
compagnie** (dossier `data/`), en français et en arabe (y compris darija).

## Architecture (simple, 4 fichiers backend)

```
data/            ← les documents de la compagnie (.md / .txt / .pdf)  ★ à remplacer par les vrais
ingest.py        ← lit data/, découpe, vectorise → chroma_db/
rag.py           ← retrouve les passages pertinents + interroge le LLM (réponse "groundée")
app.py           ← API FastAPI : POST /chat, GET /health
config.py        ← toute la configuration (surchargeable via .env)
frontend/        ← interface de chat React (Vite) : bulles, RTL arabe, sources affichées
templates/       ← ancien widget autonome (fallback sans build, servi sur /)
```

## Prérequis

- Python 3.11+ et Node.js 18+
- [Ollama](https://ollama.com) installé avec un modèle local (`ollama pull gemma4:e2b`)
  — ou un compte API OpenAI-compatible (voir `.env.example`)

## Installation & lancement (4 commandes)

```bash
# 1. Dépendances Python (dans un venv)
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# 2. Construire l'index vectoriel à partir de data/
python ingest.py

# 3. Lancer le backend (port 8000)
uvicorn app:app --reload

# 4. Lancer le frontend (port 5173) — dans un second terminal
cd frontend && npm install && npm run dev
```

Ouvrir **http://localhost:5173** → poser une question en français ou en arabe.

Vérification rapide du backend : `curl http://127.0.0.1:8000/health`

## ★ Brancher les vraies données (1 minute)

1. Déposer les vrais documents dans `data/` (formats : `.md`, `.txt`, `.pdf`)
   et supprimer les fichiers d'exemple.
2. Relancer `python ingest.py` (l'index est reconstruit de zéro à chaque exécution).
3. C'est tout — redémarrer le backend et le chatbot répond avec les vraies données.

> Conseil : des fichiers courts et bien structurés (un thème par fichier, titres
> clairs) donnent de meilleures réponses qu'un seul gros document.

## Configuration

Copier `.env.example` vers `.env` et ajuster. Points clés :

| Variable | Rôle | Défaut |
|---|---|---|
| `LLM_PROVIDER` | `ollama` (local) ou `api` (OpenAI-compatible) | `ollama` |
| `OLLAMA_MODEL` | modèle local | `gemma4:e2b` |
| `API_KEY` | clé API (jamais commitée) | — |
| `EMBEDDING_MODEL` | embeddings multilingues FR+AR | `paraphrase-multilingual-MiniLM-L12-v2` |
| `TOP_K` | nb de passages récupérés par question | `4` |
| `COMPANY_NAME` | nom affiché par l'assistant | Atlas Assurances Agadir |

Le nom/logo côté frontend se change dans `frontend/src/config.js`.

## API

```
GET  /health          → statut + configuration active
POST /chat            → { "message": "...", "history": [{role, content}] }
                      ← { "reply": "...", "sources": ["faq.md"], "lang": "fr" }
```

Le champ `sources` liste les documents utilisés — affiché sous chaque réponse
dans l'interface pour prouver que la réponse vient bien des données de la compagnie.

## Garde-fous

- Le prompt système interdit au modèle d'inventer tarifs/garanties : si
  l'information n'est pas dans les documents, il le dit et propose un conseiller.
- Détection de langue automatique (script arabe → réponse en arabe, RTL dans l'UI).
- Aucun secret dans le code : tout passe par `.env` (git-ignoré).
