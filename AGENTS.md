# Repository Guidelines

This document is the concise contributor guide for LionXA.

## Project Structure & Modules
- `src/app/` — Next.js App Router UI (pages, layout, API routes).
- `src/components/` — Reusable UI.
- `src/agent.ts` — Agent entrypoint (uses `src/watchList.ts`).
- `src/server.ts` — Custom Next server + Socket.IO for local dev.
- `src/tools/` — Internal analysis utilities (e.g., `conductArchitecturalReview`).
- `e2e/` — Playwright tests; `src/__tests__/` — Jest unit tests.
- `services/` — Dockerfiles for `frontend` and `agent`; `infra/guacamole/` — Guacamole config.

## Build, Test, and Development
- `pnpm install` — install deps.
- `pnpm dev` — Next.js dev at `http://localhost:3000`.
- `pnpm start:agent` — run agent locally.
- `pnpm test` / `pnpm test:watch` / `pnpm test:coverage` — Jest.
- `pnpm test:e2e` — Playwright (spawns `pnpm dev`).
- Docker: `docker compose build --no-cache && docker compose up -d`.

## Coding Style & Naming
- TypeScript + React; 2 spaces.
- Components PascalCase (`MyWidget.tsx`); modules camelCase.
- Prefer named exports; add `"use client"` for client components.
- Lint: `pnpm lint` before PR.

## Testing Guidelines
- Jest config: `config/jest.config.js` (jsdom + Testing Library).
- Tests in `src/**/__tests__` or `*.test.ts(x)`.
- Playwright baseURL `http://localhost:3000`; screenshots under `e2e/screenshots/`.

## Commits & Pull Requests
- Conventional style preferred (`feat:`, `fix:`, `refactor:`, `chore:`).
- PRs include description, rationale, test plan, linked issues, and screenshots when UI changes.

## Security & Config
- `.env` holds secrets. Required: `GEMINI_API_KEY` (or `DRY_RUN=1`). Optional: `VNC_PASSWORD`, `TWITTER_LIST_URL`, `BROWSER_USER_DATA_DIR`.
- Do not commit cookies/tokens or browser caches.
