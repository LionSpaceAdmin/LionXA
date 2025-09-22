# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LionXA is an AI browser agent infrastructure that automates Twitter/X interactions using Playwright and AI. The system runs both as a Next.js application and a distributed Docker-based architecture.

## Architecture

### Core Components
- **Next.js Frontend** (`src/app/`): React-based dashboard interface
- **AI Agent** (`src/watchList.ts`): Main automation logic using Playwright
- **Backend Services** (`services/`): FastAPI backend and browser agent containers
- **Configuration** (`src/config.ts`): Centralized system configuration
- **Memory System** (`src/memory.ts`): Tweet deduplication and state management
- **Dashboard** (`src/dashboard.ts`): Real-time monitoring and control interface

### Key Services (Docker Mode)
- **Frontend**: Nginx-served React app (port 8080)
- **Backend**: FastAPI WebSocket server (port 8000)
- **Browser Agent**: Playwright automation in container
- **Guacamole**: VNC remote desktop gateway (port 8081)

## Development Commands

### Local Development
```bash
# Start Next.js development server
npm run dev

# Start all local services together
npm run dev:all

# Start standalone agent
npm run start:agent

# Start production agent
npm run start:agent:prod
```

### Docker Environment
```bash
# Start entire containerized stack
docker-compose up --build

# Test agent communication
curl -X POST -H "Content-Type: application/json" \
  -d '{"prompt": "Navigate to https://www.wikipedia.org"}' \
  http://localhost:8000/api/agent/command
```

### Testing & Quality
```bash
# Run unit tests
npm test
npm run test:watch
npm run test:coverage

# Run E2E tests
npm run test:e2e
npm run test:e2e:ui

# Linting and type checking
npm run lint
next lint
```

### Build & Production
```bash
npm run build
npm start
```

## Agent System

### Main Agent (`src/watchList.ts`)
- Monitors Twitter lists for new tweets
- Uses AI (Gemini) to generate contextual replies
- Implements memory system to avoid duplicate responses
- Supports multiple user profiles with different behaviors

### Browser Service (`src/browserService.ts`)
- Abstracts Playwright browser management
- Handles page navigation and interaction
- Provides screenshot and logging capabilities

### Configuration System
- Environment-based configuration in `src/config.ts`
- Profile-based behavior customization in `src/profiles/`
- Twitter API integration settings
- AI model parameters and prompts

### Memory & State
- SQLite-based memory system for seen tweets
- Backup and restore functionality
- State persistence across restarts

## Key Files

- `src/watchList.ts` - Main agent automation logic
- `src/config.ts` - Central configuration management
- `src/dashboard.ts` - Real-time monitoring interface
- `src/gemini.ts` - AI integration (Google Gemini)
- `src/memory.ts` - Tweet deduplication system
- `src/browserService.ts` - Browser automation wrapper
- `docker-compose.yml` - Multi-container orchestration
- `services/backend/` - FastAPI WebSocket server
- `services/browser-agent/` - Containerized Playwright agent

## Testing & Monitoring

### Docker Stack Testing
1. Verify all containers are running: `docker-compose ps`
2. Check logs: `docker-compose logs [service-name]`
3. Access Guacamole VNC at http://localhost:8081 (user: guacadmin, pass: guacadmin)
4. Monitor agent activity through dashboard at http://localhost:8080

### Local Development Testing
- Use dashboard interface for real-time monitoring
- Check browser automation through screenshot functionality
- Monitor memory system for duplicate detection
- Verify AI responses through logging system

## Environment Setup

### Required Environment Variables
- Twitter/X authentication tokens
- Google Gemini API keys
- Database connection strings
- Agent behavior configuration

### Development Dependencies
- Node.js 18+
- TypeScript 5+
- Playwright (auto-installs Chromium)
- Docker & Docker Compose (for containerized mode)

## Scripts & Utilities

### Architecture Scripts
- `scripts/generate-architecture.mjs` - Generate architecture documentation
- `scripts/run-lighthouse.mjs` - Performance analysis
- `scripts/screenshot-home.ts` - Automated screenshot testing

### Setup Scripts
- `src/setup/` - Development environment initialization
- `scripts/start-all.js` - Unified service startup

## TypeScript Configuration

Path aliases configured for clean imports:
- `@/*` maps to `./src/*`
- Excludes: `node_modules`, `data`, `docs`, `tools`, `.idx`, `services`