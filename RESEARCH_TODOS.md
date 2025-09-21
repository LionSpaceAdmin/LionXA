# LionXA Research TODOs (Deep‑Dive)

## Repo Walkthrough
- [ ] Validate directory map vs docs: `src/app`, `src/components/dashboard`, `src/dashboard.ts`, `src/watchList.ts`, `src/browser.ts`, `src/gemini.ts`, `src/config.ts`, `src/setup`, `scripts`, `infra/terraform`.
- [ ] Identify any orphaned or legacy files (unused scripts, stale configs, heavy assets).
- [ ] Confirm `.gitignore` excludes runtime artifacts (`.next`, `data/`, logs, pids).

## UI (Next.js) — Live Browser
- [ ] Verify socket client reconnection/backoff and error reporting in `src/app/page.tsx`.
- [ ] Confirm controls (Pause/Reset/Rate) sync state back from server (`status` event).
- [ ] Ensure diagnostics list truncation + performance (max size, virtualize if needed).
- [ ] Add a11y: focus ring for Live Browser card; keyboard hints.

## Agent Loop & Browser
- [ ] Review `src/watchList.ts` for rate‑limit guards and backoff; one‑reply‑per‑scan policy.
- [ ] Validate `ensureSession` resilience in `src/browser.ts` (profile lock, crash recovery, CDP port use).
- [ ] Confirm screencap interval bounds + JPEG quality/perf balance.
- [ ] Double‑click/right‑click support and safeguards (optional).

## Dashboard & Protocols
- [ ] Audit `src/dashboard.ts` Socket.IO events and input validation (normalize coordinates, throttle user events).
- [ ] Confirm health API stability and content ({ ok, uptime, activeConnections, paused }).
- [ ] Consider authentication for control channels in prod (API key/header or OAuth if needed).

## Config, Env, Secrets
- [ ] Centralize and validate envs in `src/config.ts`; ensure no fatal checks run during build.
- [ ] Map production envs (Cloud Run) from Secret Manager; verify no placeholders in prod.
- [ ] Document required/optional envs (README/PRODUCTION updated).

## Gemini/Vertex
- [ ] Confirm askGemini fallback/retry policy and DRY_RUN behavior.
- [ ] Post‑deploy, validate Vertex quotas/region alignment (us‑central1) and success logs.

## Infra — Terraform
- [ ] Verify variables (`*_project_id`, `cloud_run_location`, `container_image`) and module versions.
- [ ] Apply plan in lionspace; export `tf-outputs.json` and wire into env sample if needed.
- [ ] Confirm Global LB URL works end‑to‑end (proxy `/socket.io` + `/api/health`).

## Container
- [ ] Ensure Playwright base image version matches `@playwright/test`.
- [ ] Validate entrypoint (start‑all) stability: port collisions, exits, graceful shutdown.
- [ ] Consider multi‑process supervisor if needed (or separate services) — defer if Cloud Run OK.

## Security & IAM
- [ ] Grant least‑privilege IAM on Cloud Run SA: aiplatform.user, artifactregistry.reader, logging/monitoring writers, secretmanager accessor.
- [ ] Review incoming control surface — restrict to internal/admin if required.

## Observability
- [ ] Add explicit logging for key events (agent start, navigation, reply posted, errors).
- [ ] Explore metrics export (optional) — success rates, latencies.

## E2E Smoke (Prod)
- [ ] Browse LB URL → verify UI + Live Browser streaming.
- [ ] `/api/health` via LB returns `{ ok: true }`.
- [ ] Controls affect agent; see diagnostics reflect actions.
- [ ] Save results to `prod_smoke.log`, mark `preprod_report.md` as Ready.

## Docs & Cleanup
- [ ] Consolidate central `README.md` (done) and keep `AGENTS.md`, `AGENT_MODE.md`, `PRODUCTION.md` aligned.
- [ ] Remove legacy `SUMMARY.md` (done); add `infra/terraform/README.md` (done).
- [ ] Keep `preprod_report.md` up‑to‑date; finalize with LB URL.

