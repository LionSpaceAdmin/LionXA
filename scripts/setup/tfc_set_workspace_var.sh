#!/usr/bin/env bash
set -euo pipefail

# Creates or updates a Terraform Cloud workspace variable via API.
# Required env:
#   TFC_TOKEN      - TFC API token (atlasv1...)
#   TFC_ORG        - Org slug
#   TFC_WORKSPACE  - Workspace name
#   VAR_NAME       - Variable name (e.g., mcp_auth_token or GOOGLE_CREDENTIALS)
#   VAR_VALUE      - Variable value (omit if using VAR_FILE)
# Optional env:
#   SENSITIVE      - true|false (default: true)
#   CATEGORY       - env|terraform (default: env)
#   HCL            - true|false (default: false)
#   TFC_HOSTNAME   - default app.terraform.io
#   VAR_FILE       - Path to file; its contents become the variable value

TFC_HOSTNAME=${TFC_HOSTNAME:-app.terraform.io}
SENSITIVE=${SENSITIVE:-true}
CATEGORY=${CATEGORY:-env}
HCL=${HCL:-false}

need=(TFC_TOKEN TFC_ORG TFC_WORKSPACE VAR_NAME)
for v in "${need[@]}"; do
  if [[ -z "${!v:-}" ]]; then
    echo "Missing required env: $v" >&2
    exit 2
  fi
done

# Lookup workspace ID
ws_json=$(curl -sS -H "Authorization: Bearer ${TFC_TOKEN}" \
  "https://${TFC_HOSTNAME}/api/v2/organizations/${TFC_ORG}/workspaces/${TFC_WORKSPACE}")
ws_id=$(node -e 'const d=process.env.J;try{const j=JSON.parse(d);if(j&&j.data&&j.data.id)process.stdout.write(j.data.id);else process.exit(1);}catch(e){process.exit(1)}' J="$ws_json")
if [[ -z "$ws_id" ]]; then
  echo "Failed to resolve workspace ID. Response:" >&2
  echo "$ws_json" >&2
  exit 1
fi

if [[ -n "${VAR_FILE:-}" ]]; then
  # JSON-escape file contents via node
  VALUE_ESCAPED=$(node -e "const fs=require('fs');const p=process.env.F;process.stdout.write(JSON.stringify(fs.readFileSync(p,'utf8')));" F="${VAR_FILE}")
else
  VALUE_ESCAPED=$(node -e "process.stdout.write(JSON.stringify(process.env.V||''))" V="${VAR_VALUE:-}")
fi

payload=$(cat <<JSON
{
  "data": {
    "type": "vars",
    "attributes": {
      "key": "${VAR_NAME}",
      "value": ${VALUE_ESCAPED},
      "sensitive": ${SENSITIVE},
      "category": "${CATEGORY}",
      "hcl": ${HCL}
    }
  }
}
JSON
)

# Try to find existing var id
vars_json=$(curl -sS -H "Authorization: Bearer ${TFC_TOKEN}" \
  "https://${TFC_HOSTNAME}/api/v2/workspaces/${ws_id}/vars")
var_id=$(node -e 'const d=process.env.J;const k=process.env.K;try{const j=JSON.parse(d);const it=(j.data||[]).find(v=>v.attributes&&v.attributes.key===k);if(it&&it.id)process.stdout.write(it.id);else process.stdout.write("");}catch(e){process.stdout.write("")}' J="$vars_json" K="$VAR_NAME")

if [[ -n "$var_id" ]]; then
  # Update
  curl -sS -X PATCH \
    -H "Authorization: Bearer ${TFC_TOKEN}" \
    -H "Content-Type: application/vnd.api+json" \
    "https://${TFC_HOSTNAME}/api/v2/vars/${var_id}" \
    --data-binary @- <<<"$payload"
  echo "\nUpdated variable '${VAR_NAME}' (id=${var_id}) in workspace '${TFC_WORKSPACE}'."
else
  # Create
  curl -sS -X POST \
    -H "Authorization: Bearer ${TFC_TOKEN}" \
    -H "Content-Type: application/vnd.api+json" \
    "https://${TFC_HOSTNAME}/api/v2/workspaces/${ws_id}/vars" \
    --data-binary @- <<<"$payload"
  echo "\nCreated variable '${VAR_NAME}' in workspace '${TFC_WORKSPACE}'."
fi
