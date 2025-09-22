# Terraform — LionXA (google-mpf-172983073065, us-central1)

## Prereqs
- gcloud authenticated: `gcloud auth login`
- Set project: `gcloud config set project google-mpf-172983073065`
- Enable services (first time):
  - `gcloud services enable run.googleapis.com compute.googleapis.com aiplatform.googleapis.com certificateauthority.googleapis.com artifactregistry.googleapis.com`
- Artifact Registry repository (Docker): `xagent` under `us-central1`
- Container images:
  - App: `us-central1-docker.pkg.dev/google-mpf-172983073065/xagent/xagent:prod`
  - MCP Gateway: `us-central1-docker.pkg.dev/google-mpf-172983073065/xagent/mcp-gateway:prod`

## Configure
- Create `prod.auto.tfvars` using this template:
```
xagent_cloud_run_service_project_id = "google-mpf-172983073065"
xagent_vertex_ai_project_id         = "google-mpf-172983073065"
xagent_global_lb_frontend_project_id = "google-mpf-172983073065"
xagent_global_lb_backend_project_id  = "google-mpf-172983073065"
apphub_project_id                   = "google-mpf-172983073065"
apphub_location                     = "global"
apphub_application_id               = "lionxa"
cloud_run_location                  = "us-central1"
container_image                     = "us-central1-docker.pkg.dev/google-mpf-172983073065/xagent/xagent:prod"
mcp_gateway_project_id              = "google-mpf-172983073065"
mcp_gateway_image                   = "us-central1-docker.pkg.dev/google-mpf-172983073065/xagent/mcp-gateway:prod"
```

## Run
- `terraform init`
- `terraform plan -var-file=prod.auto.tfvars`
- `terraform apply -var-file=prod.auto.tfvars`
- `terraform output -json > ../../tf-outputs.json`

## Post-Deploy
- Set Cloud Run env/secret (GEMINI_API_KEY, INTERACTIVE=0, HEADLESS_BROWSER=true, BROWSER_ARGS)
- Verify health via LB: `GET /api/health` → `{ ok: true }`
- Smoke test the Live Browser & controls in UI

### Build and Push MCP Gateway

```
# Build
docker build -t mcp-gateway -f services/mcp-gateway/Dockerfile .

# Tag to Artifact Registry
docker tag mcp-gateway \
  us-central1-docker.pkg.dev/google-mpf-172983073065/xagent/mcp-gateway:prod

# Push
docker push \
  us-central1-docker.pkg.dev/google-mpf-172983073065/xagent/mcp-gateway:prod
```

Then run `terraform apply` to deploy the Cloud Run service `mcp-gateway`.

### VS Code → Remote MCP Gateway

Switch MCP to remote gateway and set env:

```
export MCP_GATEWAY_URL=wss://<cloud-run-domain>/ws
# Application-level auth token (matches Terraform var mcp_auth_token):
export MCP_AUTH_TOKEN=<your-secret>
# If service requires Cloud Run auth (recommended), provide an ID token:
# gcloud auth print-identity-token --audiences https://<cloud-run-domain>
export MCP_ID_TOKEN=$(gcloud auth print-identity-token --audiences https://<cloud-run-domain>)
pnpm mcp:use:remote
```

The proxy (`scripts/mcp/ws-proxy.js`) bridges VS Code MCP stdio to the remote gateway over WebSocket.

Terraform Cloud variable (sensitive):
- Set Workspace variable `mcp_auth_token` (Sensitive) so Cloud Run container gets `AUTH_TOKEN`.

## HCP Terraform (Remote Backend)

To store state and run plans in HCP Terraform (Terraform Cloud):

1) Create a workspace via API (optional if you prefer UI):

```
export TFC_TOKEN=REDACTED_TFC_TOKEN
export TFC_ORG=<your_org_slug>
export TFC_WORKSPACE=lionxa-prod
# Optionally attach to HCP Project (UUID you provided):
export TFC_PROJECT_ID=091b607d-4315-41f1-a55e-d00967796fd8

bash scripts/setup/create_tfc_workspace.sh
```

2) Generate a backend config that points Terraform to the TFC workspace:

```
bash scripts/setup/configure_tfc_backend.sh "$TFC_ORG" "$TFC_WORKSPACE"
```

3) Initialize Terraform with the cloud backend:

```
cd infra/terraform
terraform init
```

Notes:
- The `organization` value is the org slug (human‑readable), not the GUID.
- No secrets are stored in `backend.tf`. The TFC user/team token is configured interactively by `terraform init`.
- If you already have local state, `terraform init -migrate-state` migrates it to TFC.

### Terraform Cloud → Google Cloud Authentication

Remote plans in TFC require credentials to access GCP. Use one of:

- Workload Identity Federation (recommended)
  - Configure TFC → Settings → Providers → Google Cloud to trust your GCP project.
  - Set environment variables in the TFC workspace as instructed by the WIF setup.

- Service Account JSON (simpler)
  - Add a workspace environment variable (Sensitive) named `GOOGLE_CREDENTIALS` with the full JSON of a service account that has the required roles.
  - Optionally set `GOOGLE_PROJECT` and `GOOGLE_REGION`.

Without these, TFC runs will fail with: “could not find default credentials”.

### Connect Workspace to GitHub (VCS)

To have runs triggered by PRs/commits, connect the workspace to your GitHub repo:

```
export TFC_TOKEN=<atlasv1...>
export TFC_ORG=<org_slug>
export TFC_WORKSPACE=lionxa-prod
# Find your OAuth token id (starts with ot-...):
bash scripts/setup/list_tfc_oauth_tokens.sh

export TFC_VCS_OAUTH_TOKEN_ID=ot_XXXXXXXX
export TFC_VCS_REPO=<github_owner>/<repo_name>
export TFC_VCS_BRANCH=main

bash scripts/setup/connect_tfc_workspace_vcs.sh
```

This sets execution mode to `remote` and associates the workspace with the GitHub repo via the configured VCS provider.
