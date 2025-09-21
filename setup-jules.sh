#!/bin/bash

# Jules Environment Setup Script for LionXA
# This script sets up the Node.js project with proper dependency management

set -e

echo "🔍 Detecting package manager and installing dependencies..."

if [ -f "pnpm-lock.yaml" ]; then
  echo "📦 Found pnpm-lock.yaml, using pnpm"
  corepack enable pnpm || true
  pnpm install --frozen-lockfile
elif [ -f "yarn.lock" ]; then
  echo "📦 Found yarn.lock, using yarn"
  corepack enable yarn || true
  yarn install --frozen-lockfile
elif [ -f "package-lock.json" ]; then
  echo "📦 Found package-lock.json, trying npm ci"
  if ! npm ci; then
    echo "⚠️  npm ci failed, trying npm install after cleanup"
    rm -rf node_modules package-lock.json
    npm install
  fi
elif [ -f "package.json" ]; then
  echo "📦 Found package.json, using npm install"
  npm install
else
  echo "⚠️  No package.json found, skipping dependency installation"
fi

echo "✅ Environment verification:"
node -v && npm -v

echo "🎉 Setup completed successfully!"