# CYBER Backend

FastAPI service that receives, normalizes, stores and exposes security scan results.

Pipeline: Nmap / Nuclei output, parser, FastAPI, PostgreSQL.

## Requirements

- Python 3.12 or newer
- Docker and Docker Compose

## Setup

```bash
cd backend
docker compose up -d
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs
Health check: http://localhost:8000/health

PostgreSQL runs in Docker on port 5433 (user `cyber_user`, database `cyber_db`).
Override the connection with the `DATABASE_URL` environment variable.

## Main endpoints

| Method | Path | Purpose |
|---|---|---|
| GET, POST | `/assets` | List and create assets |
| GET, PUT | `/assets/{id}` | Read and update an asset |
| GET, POST | `/findings` | List and create findings |
| GET, PUT | `/findings/{id}` | Read and update a finding |
| POST | `/findings/ingest/nmap` | Parse raw Nmap XML and store findings |
| POST | `/findings/ingest/nuclei` | Parse raw Nuclei JSONL and store findings |

Asset types: `web`, `server`, `network`.
Severities: `info`, `low`, `medium`, `high`, `critical`.

## Tests

```bash
pip install pytest
pytest
```
