#!/bin/bash
set -e

# Setup VNC password and start VNC server in the background
if [ -z "${VNC_PASSWORD}" ]; then
  echo "Warning: VNC_PASSWORD not set. Using default 'password'."
  export VNC_PASSWORD=password
fi
mkdir -p /home/agentuser/.vnc
x11vnc -storepasswd "${VNC_PASSWORD}" /home/agentuser/.vnc/passwd
x11vnc -display :0 -bg -forever -usepw -shared -rfbport 5901
sleep 2 # Give VNC a moment to start

echo ">>> Starting the Agent process..."
cd /home/agentuser/app
pnpm start:agent