# LionXA (XAgent Control)

A production‑ready Next.js 15 UI with a headless Agent (Playwright + Gemini) and a unified Edge Proxy. The UI embeds a Live Browser view (screenshots streamed from the agent) with interactive controls and a diagnostics panel. Terraform modules provision Cloud Run + Global HTTP(S) LB + AppHub + Vertex API.

## Quick Start (Dev)
- Install: `pnpm install`
- UI only: `pnpm dev` → http://localhost:3000
- UI + Agent (Live Browser): `pnpm dev:all`
  - Use `.env` with `INTERACTIVE=1`, `HEADLESS_BROWSER=false`, and `DRY_RUN=1` to avoid posting.

## Production
- Build UI: `pnpm build`
- Start all (local prod‑like): `PORT=8080 pnpm start:all` → proxy on `http://localhost:8080`
  - Edge proxy unifies the UI and the dashboard (`/socket.io` and `/api/health`).
- Docker: see `Dockerfile` (Playwright base with Chromium), entrypoint runs start‑all.
- Health: `GET /api/health` (200 + `{ ok: true }`) via proxy or dashboard.

## Terraform (us‑central1, project: google-mpf-172983073065)
- Files: `infra/terraform/`
- Create `prod.auto.tfvars` (see `infra/terraform/input.tfvars` template), e.g.:
  - `xagent_cloud_run_service_project_id = "google-mpf-172983073065"`
  - `apphub_project_id = "google-mpf-172983073065"`
  - `cloud_run_location = "us-central1"`
  - `container_image = "us-central1-docker.pkg.dev/google-mpf-172983073065/xagent/xagent:prod"`
- Commands:
  - `terraform init`
  - `terraform apply -var-file=prod.auto.tfvars`
  - `terraform output -json > tf-outputs.json`

## Env & Secrets (Cloud Run)
- Secrets in Secret Manager (no placeholders in prod):
  - `GEMINI_API_KEY`
- Recommended env:
  - `INTERACTIVE=0`, `HEADLESS_BROWSER=true`, `BROWSER_ARGS=--no-sandbox,--disable-dev-shm-usage`
  - Optional: `TWITTER_LIST_URL` or `START_URL`
- Service Account IAM (least‑privilege):
  - `roles/aiplatform.user`, `roles/artifactregistry.reader`, `roles/logging.logWriter`, `roles/monitoring.metricWriter`, `roles/secretmanager.secretAccessor`

## Live Browser & Diagnostics
- UI page: `src/app/page.tsx`
  - Live Browser card: streams screenshots; click/type/wheel forwarded to the Playwright page
  - Controls: Pause/Resume, Reset, Rate (1–10s)
  - Diagnostics: page console + agent exceptions
- Agent loop: `src/watchList.ts` (screencap loop + event hooks)
- Dashboard server: `src/dashboard.ts` (Socket.IO + `/api/health`)

## Edge Proxy & Orchestration
- Proxy: `scripts/edge-proxy.js` (routes `/socket.io` and `/api/health` to dashboard port; other paths to UI)
- Orchestrator: `scripts/start-all.js` (UI + Agent + Edge proxy on `$PORT`)

## Repo Map
- UI (Next.js): `src/app/`
- Agent: `src/watchList.ts`, `src/browser.ts`, `src/gemini.ts`, `src/config.ts`
- Dashboard: `src/dashboard.ts`
- Setup: `src/setup/`
- Infra: `infra/terraform/`

## Further Docs
- Dev guide: `AGENTS.md`
- Agent mode (local, MCP): `AGENT_MODE.md`
- Production runbook: `PRODUCTION.md`
- Pre‑production status: `preprod_report.md`
- Rollback plan: `rollback_plan.md`
