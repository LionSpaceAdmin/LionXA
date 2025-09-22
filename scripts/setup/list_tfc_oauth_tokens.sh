#!/usr/bin/env bash
set -euo pipefail

# Lists OAuth tokens configured in a TFC org (to find TFC_VCS_OAUTH_TOKEN_ID)
# Required env:
#   TFC_TOKEN - TFC API token
#   TFC_ORG   - Org slug
# Optional env:
#   TFC_HOSTNAME - default app.terraform.io

TFC_HOSTNAME=${TFC_HOSTNAME:-app.terraform.io}
if [[ -z "${TFC_TOKEN:-}" || -z "${TFC_ORG:-}" ]]; then
  echo "Usage: TFC_TOKEN=... TFC_ORG=... $0" >&2
  exit 2
fi

curl -sS "https://${TFC_HOSTNAME}/api/v2/organizations/${TFC_ORG}/oauth-tokens" \
  -H "Authorization: Bearer ${TFC_TOKEN}" \
  -H "Content-Type: application/vnd.api+json" |
  sed 's/\\n/\n/g' | sed 's/{/\n{/g' | grep -E '"id"|"service-provider"|"oauth-client"|"description"|"vcs-type"' || true

echo
echo "Look for an 'id' starting with 'ot-' belonging to your GitHub VCS provider."

