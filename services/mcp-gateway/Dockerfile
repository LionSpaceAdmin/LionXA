FROM node:20-slim
ENV NODE_ENV=production
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
# Use non-frozen install to tolerate minor lock drift during CI
RUN pnpm install --no-frozen-lockfile
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD ["node", "services/mcp-gateway/index.js"]
