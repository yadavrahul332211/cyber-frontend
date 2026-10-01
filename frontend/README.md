# CYBER Frontend

Next.js dashboard for the CYBER security MVP.

Flow: Login, Dashboard, Add Asset, Upload scan, Findings, Finding details.

## Requirements

- Node.js 18.18 or newer
- The backend (FastAPI) running on http://localhost:8000 when not using mock data

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open the URL printed in the terminal (usually http://localhost:3000).

## Environment variables

| Name | Purpose |
|---|---|
| `BACKEND_URL` | Backend base URL. Requests to `/api/*` are proxied here, so the browser needs no CORS setup. Default: `http://localhost:8000` |
| `NEXT_PUBLIC_USE_MOCK` | `true` uses built-in sample data, `false` calls the real backend |

Restart `npm run dev` after changing `.env.local`.

## Mock data vs real backend

1. Mock mode (no backend needed): set `NEXT_PUBLIC_USE_MOCK=true`.
2. Real backend: start the backend, set `NEXT_PUBLIC_USE_MOCK=false`, restart the dev server.

## Login

Login is a mock for now (any email and password work). Replace `login()` in `lib/auth.ts` once the backend has an auth API.

## Backend API used

| Method | Path | Used for |
|---|---|---|
| GET | `/assets` | Assets page |
| POST | `/assets` | Add asset |
| GET | `/assets/{id}` | Finding details |
| GET | `/findings` | Overview and Findings page |
| GET | `/findings/{id}` | Finding details |
| POST | `/findings/ingest` | Upload scan page |

Asset types: `web`, `server`, `network`. Severities: `info`, `low`, `medium`, `high`, `critical`.

## Upload scan

The Upload scan page takes a JSON list of normalized findings for one asset.
Try `sample-data/sample-findings.json`.

## Tests

```bash
npm test
```

## Project structure

- `app/`: pages (login, dashboard, assets, findings, scan)
- `components/`: Sidebar, SeverityBadge
- `lib/`: API client, types, mock auth
- `__tests__/`: Vitest tests
