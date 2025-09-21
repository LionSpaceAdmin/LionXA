#!/bin/bash
set -e

export DISPLAY=:99

rm -f /tmp/.X11-unix/X99 /tmp/xvfb.log /tmp/x11vnc.log

echo "Starting Xvfb, logging to /tmp/xvfb.log..."
Xvfb $DISPLAY -screen 0 1280x1024x24 > /tmp/xvfb.log 2>&1 &

while ! [ -S /tmp/.X11-unix/X99 ]; do
  echo "Waiting for Xvfb to be ready..."
  sleep 1
done
echo "Xvfb is running."

echo "Starting x11vnc, logging to /tmp/x11vnc.log..."
x11vnc -display $DISPLAY -forever -usepw -xkb > /tmp/x11vnc.log 2>&1 &

sleep 2

echo "Starting Python browser agent..."
exec python3 /app/browser_agent.py