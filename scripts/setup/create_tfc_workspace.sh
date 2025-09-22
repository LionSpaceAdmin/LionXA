#!/usr/bin/env bash
set -euo pipefail

# Creates a Terraform Cloud/HCP Terraform workspace via API.
# Required env:
#   TFC_TOKEN       - User or Team API token (starts with tfe...)
#   TFC_ORG         - Organization slug (not GUID)
#   TFC_WORKSPACE   - Workspace name to create (e.g., lionxa-prod)
# Optional env:
#   TFC_HOSTNAME    - API host (default: app.terraform.io)
#   TFC_PROJECT_ID  - HCP/TFC Project ID (UUID) to attach workspace to

TFC_HOSTNAME=${TFC_HOSTNAME:-app.terraform.io}

if [[ -z "${TFC_TOKEN:-}" || -z "${TFC_ORG:-}" || -z "${TFC_WORKSPACE:-}" ]]; then
  echo "Usage: TFC_TOKEN=... TFC_ORG=... TFC_WORKSPACE=... [TFC_PROJECT_ID=...] [TFC_HOSTNAME=app.terraform.io] $0" >&2
  exit 2
fi

echo "Creating workspace '${TFC_WORKSPACE}' in org '${TFC_ORG}' on ${TFC_HOSTNAME}..."

if [[ -n "${TFC_PROJECT_ID:-}" ]]; then
  # With project relationship
  curl -sS -X POST \
    "https://${TFC_HOSTNAME}/api/v2/organizations/${TFC_ORG}/workspaces" \
    -H "Authorization: Bearer ${TFC_TOKEN}" \
    -H "Content-Type: application/vnd.api+json" \
    --data @- <<EOF
{
  "data": {
    "type": "workspaces",
    "attributes": {
      "name": "${TFC_WORKSPACE}"
    },
    "relationships": {
      "project": {
        "data": {
          "type": "projects",
          "id": "${TFC_PROJECT_ID}"
        }
      }
    }
  }
}
EOF
else
  # Without project relationship
  curl -sS -X POST \
    "https://${TFC_HOSTNAME}/api/v2/organizations/${TFC_ORG}/workspaces" \
    -H "Authorization: Bearer ${TFC_TOKEN}" \
    -H "Content-Type: application/vnd.api+json" \
    --data @- <<EOF
{
  "data": {
    "type": "workspaces",
    "attributes": {
      "name": "${TFC_WORKSPACE}"
    }
  }
}
EOF
fi

echo
echo "If the workspace already exists, the API returns its JSON."
echo "Next: set backend with scripts/setup/configure_tfc_backend.sh"

