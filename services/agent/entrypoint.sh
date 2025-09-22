#!/bin/bash
set -e
# Setup VNC password from environment variable
# VNC server disabled for now due to persistent issues.
echo ">>> Starting the Agent process..."
cd /home/agentuser/app
pnpm start:agent