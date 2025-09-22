#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_DIR="$ROOT_DIR/_reports"
SUMMARY_FILE="$REPORT_DIR/setup-summary.txt"
PNPM_VERSION="10.13.1"
NODE_TARGET="$(tr -d '\n' < "$ROOT_DIR/.nvmrc" 2>/dev/null || echo 'unknown')"

mkdir -p "$REPORT_DIR"

summary=()

write_summary() {
  local node_runtime
  local pnpm_runtime
  node_runtime="$(node -v 2>/dev/null || echo 'unavailable')"
  pnpm_runtime="$(pnpm -v 2>/dev/null || echo 'unavailable')"
  {
    echo "# Setup Summary"
    echo "Generated: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
    echo "Target Node (from .nvmrc): $NODE_TARGET"
    echo "Detected node -v: $node_runtime"
    echo "Detected pnpm -v: $pnpm_runtime"
    echo
    for line in "${summary[@]}"; do
      echo "- $line"
    done
  } > "$SUMMARY_FILE"
}

run_step() {
  local name="$1"
  shift
  local cmd=$*
  echo
  echo "[setup] $name"
  set +e
  eval "$cmd"
  local status=$?
  set -e
  if [[ $status -eq 0 ]]; then
    summary+=("✔ $name")
  else
    summary+=("✘ $name (exit $status)")
    write_summary
    echo "[setup] Failed: $name" >&2
    exit $status
  fi
}

run_step "Enable Corepack" "corepack enable >/dev/null 2>&1 || true"
run_step "Activate pnpm@$PNPM_VERSION" "corepack prepare pnpm@$PNPM_VERSION --activate"
run_step "Install dependencies" "pnpm install --frozen-lockfile"
run_step "Clean workspace" "pnpm clean"
run_step "Build project" "pnpm build"
run_step "Lint source" "pnpm lint"
run_step "Typecheck" "pnpm typecheck"
run_step "Run unit tests" "pnpm test"

write_summary

echo
echo "[setup] Success. Summary written to $SUMMARY_FILE"
