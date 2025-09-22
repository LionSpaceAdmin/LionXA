#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_DIR="$ROOT_DIR/_reports"
OUTPUT_FILE="$REPORT_DIR/secrets-audit.md"

mkdir -p "$REPORT_DIR"

patterns=(
  'AKIA[0-9A-Z]{16}'
  'ASIA[0-9A-Z]{16}'
  'AIza[0-9A-Za-z_-]{35}'
  'ghp_[0-9A-Za-z]{36}'
  'gho_[0-9A-Za-z]{36}'
  'sk-[A-Za-z0-9]{48}'
  '-----BEGIN [A-Z ]+PRIVATE KEY-----'
)

ignore_dirs=(
  '.git'
  'node_modules'
  '.next'
  'dist'
  'coverage'
  'playwright-report'
  '_reports'
  '.tmp'
  '.turbo'
)

has_rg=0
if command -v rg >/dev/null 2>&1; then
  has_rg=1
fi

findings=()

if [[ $has_rg -eq 1 ]]; then
  rg_ignore=()
  for dir in "${ignore_dirs[@]}"; do
    rg_ignore+=(--glob "!$dir")
  done
  for pattern in "${patterns[@]}"; do
    while IFS= read -r line; do
      [[ -z "$line" ]] && continue
      findings+=("$pattern | $line")
    done < <(
      rg --no-heading --line-number --color never --hidden \
        "${rg_ignore[@]}" -- "$pattern" "$ROOT_DIR"
    )
  done
else
  exclude_args=()
  for dir in "${ignore_dirs[@]}"; do
    exclude_args+=("--exclude-dir=$dir")
  done
  for pattern in "${patterns[@]}"; do
    while IFS= read -r line; do
      [[ -z "$line" ]] && continue
      findings+=("$pattern | $line")
    done < <(
      grep -RIn --color=never "${exclude_args[@]}" -e "$pattern" "$ROOT_DIR" || true
    )
  done
fi

{
  echo "# Secrets Audit"
  echo "Generated: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  echo "Scanner: $([[ $has_rg -eq 1 ]] && echo 'ripgrep' || echo 'grep')"
  echo
  if [[ ${#findings[@]} -eq 0 ]]; then
    echo "No high-confidence secrets found."
  else
    echo "Potential findings (pattern | file:line)"
    for entry in "${findings[@]}"; do
      echo "- $entry"
    done
  fi
} > "$OUTPUT_FILE"

echo "Secrets audit written to $OUTPUT_FILE"
