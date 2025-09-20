#!/usr/bin/env bash

set -euo pipefail

echo "🔧 Removing macOS quarantine flags from Playwright browser caches..."

TARGETS=(
  "$HOME/Library/Caches/ms-playwright/chromium-*"
  "$HOME/Library/Caches/ms-playwright/webkit-*"
  "$HOME/Library/Caches/ms-playwright/firefox-*"
)

for t in "${TARGETS[@]}"; do
  if compgen -G "$t" > /dev/null; then
    echo "🧹 Clearing quarantine on: $t"
    xattr -dr com.apple.quarantine $t || true
  fi
done

if [ -d "/Applications/Chromium.app" ]; then
  echo "🧹 Clearing quarantine on /Applications/Chromium.app"
  xattr -dr com.apple.quarantine "/Applications/Chromium.app" || true
fi

echo "✅ Done. If issues persist, reinstall browsers: pnpm exec playwright install chromium"

