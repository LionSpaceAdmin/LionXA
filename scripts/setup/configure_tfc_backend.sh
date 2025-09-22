#!/usr/bin/env bash
set -euo pipefail

# Generates infra/terraform/backend.tf for Terraform Cloud/HCP.
# Usage:
#   TFC_ORG=my-org TFC_WORKSPACE=lionxa-prod scripts/setup/configure_tfc_backend.sh
# or
#   scripts/setup/configure_tfc_backend.sh my-org lionxa-prod

ORG=${TFC_ORG:-${1:-}}
WS=${TFC_WORKSPACE:-${2:-}}

if [[ -z "${ORG}" || -z "${WS}" ]]; then
  echo "Usage: TFC_ORG=... TFC_WORKSPACE=... $0  OR  $0 <org> <workspace>" >&2
  exit 2
fi

mkdir -p infra/terraform
cat > infra/terraform/backend.tf <<EOF
terraform {
  cloud {
    organization = "${ORG}"
    workspaces {
      name = "${WS}"
    }
  }
}
EOF

echo "Wrote infra/terraform/backend.tf targeting org='${ORG}', workspace='${WS}'."
echo "Run: (cd infra/terraform && terraform init)"

