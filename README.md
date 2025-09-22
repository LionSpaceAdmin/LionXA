# LionXA — AI Browser Agent (Next.js + Playwright)

This repository provides a containerized AI browser agent with a Next.js dashboard and a VNC-friendly desktop for visual inspection via Guacamole.

## Services (Docker Compose)

- Frontend (Next.js dev): http://localhost:3000
- Agent (Playwright + XFCE + VNC): exposes VNC on 5901 (internal); reports to Frontend API
- Guacamole UI: http://localhost:8080/guacamole (configured via `infra/guacamole`)
- Guacd (Guacamole daemon): internal service

Note: An optional FastAPI backend scaffold exists under `services/backend/`, but is not enabled in `docker-compose.yml` by default.

## Quick Start

1. Copy env: `cp .env.example .env`, then set `GEMINI_API_KEY` (or keep `DRY_RUN=1`).

2. Build and run:

```bash
docker compose build --no-cache
docker compose up -d
```

3. Open the dashboard at http://localhost:3000

4. Open Guacamole at http://localhost:8080/guacamole
   - Default mapping (edit in `infra/guacamole/user-mapping.xml`):
     - Username: `xagent-admin`
     - Password: `password`
     - Connection: “Agent Desktop (VNC)” → connects to `lionxa_agent:5901`

5. Verify agent → frontend reporting: watch `docker compose logs -f frontend` for lines like:

```
Received data from agent: { ... }
```

## Development commands

- `pnpm dev` — Next.js dev server (local)
- `pnpm start:agent` — run agent entry (local)
- `pnpm test` / `pnpm test:e2e` — unit and Playwright tests
- `pnpm build` — Next.js production build (uses `SKIP_GEMINI_CHECK=1` in CI)

## CI

GitHub Actions run lint, unit tests, and build on push/PR. Optional Playwright E2E workflow is provided and can be triggered manually.
