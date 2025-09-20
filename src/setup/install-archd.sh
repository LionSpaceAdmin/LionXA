#!/usr/bin/env bash
set -euo pipefail

PLIST_ID="com.xagent.archd"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_ID}.plist"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
NODE_BIN="$(command -v node || true)"
ARCHD_SCRIPT="$REPO_DIR/scripts/archd.mjs"
LOG_DIR="$HOME/Library/Logs"

if [[ -z "$NODE_BIN" ]]; then
  echo "❌ node binary not found in PATH"
  exit 1
fi

mkdir -p "$LOG_DIR"

cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${PLIST_ID}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${NODE_BIN}</string>
    <string>${ARCHD_SCRIPT}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>WorkingDirectory</key>
  <string>${REPO_DIR}</string>
  <key>StandardOutPath</key>
  <string>${LOG_DIR}/archd.out.log</string>
  <key>StandardErrorPath</key>
  <string>${LOG_DIR}/archd.err.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PORT</key>
    <string>3003</string>
  </dict>
</dict>
</plist>
EOF

launchctl unload "$PLIST_PATH" 2>/dev/null || true
launchctl load "$PLIST_PATH"
launchctl start "$PLIST_ID" || true

echo "✅ archd installed and started (LaunchAgent: ${PLIST_ID})"
echo "   API: http://127.0.0.1:3003/api/architecture"
echo "   Viewer: http://127.0.0.1:3003/aritcector/index.html"

