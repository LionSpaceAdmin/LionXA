# Terraform — LionXA (google-mpf-172983073065, us-central1)

## Prereqs
- gcloud authenticated: `gcloud auth login`
- Set project: `gcloud config set project google-mpf-172983073065`
- Enable services (first time):
  - `gcloud services enable run.googleapis.com compute.googleapis.com aiplatform.googleapis.com certificateauthority.googleapis.com artifactregistry.googleapis.com`
- Artifact Registry repository (Docker): `xagent` under `us-central1`
- Container image pushed to: `us-central1-docker.pkg.dev/google-mpf-172983073065/xagent/xagent:prod`

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
