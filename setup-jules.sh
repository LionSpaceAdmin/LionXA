#!/bin/bash
set -euo pipefail
set -x

echo "--- Preparing Jules Environment for LionXA ---"

echo "--- Verifying Tool Versions ---"
node -v
pnpm -v
docker --version
docker compose version

echo "--- Ensuring .env exists and contains required keys ---"
if [ ! -f .env ]; then
  cp .env.example .env
fi
grep -q '^GEMINI_API_KEY=' .env || echo 'GEMINI_API_KEY=placeholder_for_build' >> .env
grep -q '^DRY_RUN=' .env || echo 'DRY_RUN=1' >> .env
grep -q '^VNC_PASSWORD=' .env || echo 'VNC_PASSWORD=jules_vnc_pass' >> .env

echo "--- Installing Node dependencies ---"
pnpm install --frozen-lockfile

echo "--- Building Docker images ---"
docker compose build

echo "--- Running unit tests ---"
pnpm test

echo "--- Jules setup script completed successfully! ---"
