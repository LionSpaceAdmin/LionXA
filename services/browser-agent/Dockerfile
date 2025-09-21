# Base image and user setup
FROM mcr.microsoft.com/playwright/python:v1.40.0-jammy
USER root

# System dependencies (many are included in base image, but we ensure xvfb/x11vnc)
RUN apt-get update && apt-get install -y --no-install-recommends xvfb x11vnc curl

# Application setup
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt

# --- THIS IS THE CRITICAL FIX ---
# Install the Chromium browser for Playwright
RUN python3 -m playwright install --with-deps chromium

# Create user and directories
RUN useradd -ms /bin/bash agentuser
RUN mkdir -p /home/agentuser/.vnc && \
    x11vnc -storepasswd password /home/agentuser/.vnc/passwd && \
    chown -R agentuser:agentuser /home/agentuser /app

USER agentuser
WORKDIR /home/agentuser

# Set the entrypoint to the robust startup script
ENTRYPOINT ["/app/start.sh"]