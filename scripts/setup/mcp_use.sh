#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/setup/mcp_use.sh [local|docker|remote]
MODE=${1:-}
if [[ "$MODE" != "local" && "$MODE" != "docker" && "$MODE" != "remote" ]]; then
  echo "Usage: $0 [local|docker]" >&2
  exit 2
fi

case "$MODE" in
  local)
    cp -f .mcp/servers.local.json .mcp/servers.json
    echo "Switched MCP config to LOCAL (.mcp/servers.json)"
    ;;
  docker)
    cp -f .mcp/servers.docker.json .mcp/servers.json
    echo "Switched MCP config to DOCKER (.mcp/servers.json)"
    echo "Ensure 'lionxa_agent' container is running (docker compose up -d agent)"
    ;;
  remote)
    if [[ -z "${MCP_GATEWAY_URL:-}" ]]; then
      echo "Set MCP_GATEWAY_URL env to your remote gateway base URL (e.g., wss://gateway.example.com)" >&2
    fi
    cp -f .mcp/servers.remote.json .mcp/servers.json
    echo "Switched MCP config to REMOTE gateway (.mcp/servers.json)"
    ;;
esac
