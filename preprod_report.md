LionXA — Pre‑Production Validation Report (Target: google-mpf-172983073065, us-central1)

Summary
- Code audit + build: PASS (Next 15.5.3, React 19.1.1, TS 5.9.x)
- Prod‑like run (local): PASS — UI+Agent+Proxy, health endpoint OK, diagnostics live
- Containerization: READY — Dockerfile with Playwright base, start‑all orchestrator
- Terraform: VALID PLAN — modules fixed and parameterized; apply pending image push
- Firebase Extensions: PENDING — requires project auth to verify live triggers
- Vertex AI + IAM: PARTIAL — plan enables API; IAM to be confirmed post‑deploy

Details
1) Build/Typecheck
- Commands: pnpm install; pnpm build (compiled successfully)
- Fixed ESLint any in API route; fixed UI Socket typings; added diagnostics + control UI

2) Prod‑like Run
- Orchestrator: scripts/start-all.js starts Next UI (3002), Agent dashboard (3011), Edge proxy (8080)
- Health: GET /api/health → { ok: true, ... } (direct: 3011 OK; proxied path wired in edge proxy)
- Live Browser: screencaps streaming; click/type/wheel controls work; pause/reset/rate adjustable
- Diagnostics: console + exceptions forwarded and visible

3) Container
- Dockerfile uses mcr.microsoft.com/playwright base (Chromium included)
- CMD runs start‑all to expose a single $PORT via edge proxy

4) Terraform (Target project: google-mpf-172983073065, region: us-central1)
- Source: infra/terraform (unzipped template)
- Fixed invalid hyphenated variables → snake_case
- Added variable container_image; parameterized cloud_run_location
- terraform init: PASS; plan: PASS (ready for apply in target project)
- Apply awaiting gcloud auth and pushed image

5) Firebase Extensions
- Pending verification: list installed extensions; trigger Firestore/Storage; inspect logs

6) Vertex AI + IAM
- API enablement in plan; Cloud Run SA roles to be granted post‑deploy (least‑privilege set listed)

Gaps / Next Actions
- Authenticate gcloud; build/push image to Artifact Registry (us-east1)
- terraform apply; capture tf-outputs.json
- Set Cloud Run envs (GEMINI_API_KEY / Firebase / Vertex) from Secret Manager; confirm IAM
- Run production smoke via LB URL

Ready‑for‑Production Criteria
- Build/typecheck PASS — met
- Prod‑like PASS — met
- Image in Artifact Registry — pending
- Terraform apply + outputs — pending
- Cloud Run env/secrets + IAM — pending
- Firebase extensions live — pending
- Vertex connectivity — pending
- Production smoke — pending
