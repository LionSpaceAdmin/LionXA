#!/usr/bin/env bash
set -euo pipefail

# Connects a Terraform Cloud/HCP workspace to a GitHub repo via VCS provider.
# Required env:
#   TFC_TOKEN                - TFC API token (atlasv1...)
#   TFC_ORG                  - Org slug (human readable)
#   TFC_WORKSPACE            - Workspace name (e.g., lionxa-prod)
#   TFC_VCS_OAUTH_TOKEN_ID   - OAuth token ID from TFC (format: ot-...)
#   TFC_VCS_REPO             - GitHub repo in 'owner/repo' format
# Optional env:
#   TFC_VCS_BRANCH           - Branch to track (default: main)
#   TFC_HOSTNAME             - API host (default: app.terraform.io)
#   INGRESS_SUBMODULES       - true/false (default: false)

TFC_HOSTNAME=${TFC_HOSTNAME:-app.terraform.io}
TFC_VCS_BRANCH=${TFC_VCS_BRANCH:-main}
INGRESS_SUBMODULES=${INGRESS_SUBMODULES:-false}

need=(TFC_TOKEN TFC_ORG TFC_WORKSPACE TFC_VCS_OAUTH_TOKEN_ID TFC_VCS_REPO)
for v in "${need[@]}"; do
  if [[ -z "${!v:-}" ]]; then
    echo "Missing required env: $v" >&2
    exit 2
  fi
done

echo "Linking workspace '${TFC_WORKSPACE}' to repo '${TFC_VCS_REPO}' on branch '${TFC_VCS_BRANCH}'..."

curl -sS -X PATCH \
  "https://${TFC_HOSTNAME}/api/v2/organizations/${TFC_ORG}/workspaces/${TFC_WORKSPACE}" \
  -H "Authorization: Bearer ${TFC_TOKEN}" \
  -H "Content-Type: application/vnd.api+json" \
  --data @- <<EOF
{
  "data": {
    "type": "workspaces",
    "attributes": {
      "execution-mode": "remote",
      "vcs-repo": {
        "identifier": "${TFC_VCS_REPO}",
        "oauth-token-id": "${TFC_VCS_OAUTH_TOKEN_ID}",
        "branch": "${TFC_VCS_BRANCH}",
        "ingress-submodules": ${INGRESS_SUBMODULES}
      }
    }
  }
}
EOF

echo
echo "If successful, the workspace is now connected to GitHub."
echo "You can trigger runs from VCS pushes or via the TFC UI."

