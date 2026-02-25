# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

WonderLens AI is an Industrial Computer Vision Platform built with Next.js 14 (App Router). It uses npm workspaces with two packages: `frontend/` (the main app) and `backend/` (placeholder). See `README.md` for project structure.

### Running services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Next.js dev server | `npm run dev` (from repo root) | 3000 | Serves both UI and API routes |

### Key commands

- **Install deps:** `npm run install:all` (installs root + frontend + backend workspaces)
- **Dev server:** `npm run dev` (starts Next.js on port 3000)
- **Lint:** `npm run lint --workspace=frontend` (runs `next lint`)
- **Build:** `npm run build` (production build of frontend)
- **TypeScript check:** Build implicitly checks types

### Gotchas

- **ESLint version:** Next.js 14 requires ESLint v8 and `eslint-config-next@^14.2.0`. The latest `eslint-config-next` (v16+) and ESLint v9 are incompatible and will error. These are already pinned in `frontend/package.json` devDependencies.
- **`next lint` interactive prompt:** Without an `.eslintrc.json` in `frontend/`, `next lint` prompts interactively. The file `frontend/.eslintrc.json` with `{"extends": "next/core-web-vitals"}` is committed to avoid this.
- **External services not required for basic dev:** The app can run `npm run dev` without `DATABASE_URL` or `OPENAI_API_KEY`. These are only needed when exercising upload/process/chat API routes. The landing page (`/`) and app UI (`/app`) load fine without them.
- **PostgreSQL + pgvector:** Required for full pipeline (upload, process, chat). Schema is at `db/schema.sql`. Set `DATABASE_URL` env var.
- **OpenAI API:** Required for video processing pipeline (transcription, captioning, embeddings, chat). Set `OPENAI_API_KEY` env var.
- **Python worker (`backend/worker_py/`):** Optional FastAPI + YOLO service. Not integrated into the main pipeline. Install via `pip install -r backend/worker_py/requirements.txt`.
