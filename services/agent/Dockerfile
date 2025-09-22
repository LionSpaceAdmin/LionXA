FROM node:20
ENV DEBIAN_FRONTEND=noninteractive
# Playwright system dependencies are included in the list below
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl sudo git wget unzip xfce4 xfce4-goodies x11vnc dbus-x11 \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libgbm1 libasound2 \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm
RUN useradd -m -s /bin/bash agentuser && \
    echo "agentuser ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/agentuser
USER agentuser
WORKDIR /home/agentuser/app
COPY --chown=agentuser:agentuser . .
# Install node modules
RUN CI=true pnpm install --frozen-lockfile
# Install browser binaries required by Playwright
RUN pnpm exec playwright install --with-deps chromium
EXPOSE 5901
COPY --chown=agentuser:agentuser services/agent/entrypoint.sh /entrypoint.sh
RUN sudo chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]