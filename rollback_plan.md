# Rollback Plan — LionXA

## Scope
- Cloud Run service, Global HTTP(S) LB, AppHub registration, Vertex AI API enablement
- Container image and environment variables

## Preconditions
- Ensure terraform state is backed up
- Record current Cloud Run revision and image digest

## Steps
1) Freeze traffic
- Option A: Scale Cloud Run min instances to 0 (or set traffic to previous stable revision)
- Option B: Update Env to DRY_RUN=1 (if safe) while investigating

2) Revert Container Image
- `gcloud run services update xagent-service --image us-east1-docker.pkg.dev/PROJECT/xagent/xagent:previous`

3) Revert Environment
- Reapply last known good env/secret versions (Secret Manager version pinning)

4) Terraform Destroy (if full rollback)
- `cd infra/terraform`
- `terraform destroy -var-file=prod.auto.tfvars`

5) DNS / LB
- Point DNS back to prior target or remove LB records if service is unavailable

6) Monitoring
- Check Cloud Run logs, error rates, and health endpoint `/api/health`

## Notes
- Keep at least one stable image in Artifact Registry with annotate tags
- Use canary by shifting partial traffic to new revision before full cutover

