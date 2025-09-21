# Gemini Code Assistant Context

This document provides context for the Gemini Code Assistant to understand the Xagent project.

## Project Overview

Xagent is a production-ready, full-stack application designed for AI-powered social media management. It features a Next.js 15 user interface, a headless agent powered by Playwright and Google Gemini, and a unified Edge Proxy. The application is designed to be deployed on Google Cloud Platform using Terraform.

The core functionality of the application is to monitor a specific X.com list, and use Gemini to generate and post replies to tweets. The UI provides a live view of the agent's browser, interactive controls, and a diagnostics panel.

### Key Technologies

*   **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
*   **Backend:** Node.js, Express, Socket.IO
*   **Agent:** Playwright, Google Gemini
*   **Infrastructure:** Google Cloud Platform, Cloud Run, Global HTTP(S) Load Balancer, AppHub, Vertex AI, Terraform
*   **Database:** The agent uses a persistent Chromium profile to maintain session data.
*   **Testing:** Jest for unit tests, Playwright for end-to-end tests.

### Architecture

The application is composed of several key components:

*   **Next.js UI:** The user interface for the application, providing a dashboard for monitoring and controlling the agent.
*   **Dashboard Server:** An Express server with Socket.IO that streams real-time data from the agent to the UI.
*   **Agent:** A Playwright-based agent that interacts with X.com, using Gemini to generate replies.
*   **Edge Proxy:** A proxy that unifies the UI and the dashboard server.
*   **Terraform:** Infrastructure as code for provisioning the necessary Google Cloud resources.

## Building and Running

### Development

*   **Install dependencies:** `pnpm install`
*   **Run the UI only:** `pnpm dev`
*   **Run the UI and the agent:** `pnpm dev:all`

### Production

*   **Build the UI:** `pnpm build`
*   **Start all services (UI, agent, and proxy):** `pnpm start:all`

### Testing

*   **Run unit tests:** `pnpm test`
*   **Run end-to-end tests:** `pnpm test:e2e`

## Development Conventions

*   **Code Style:** TypeScript with 2-space indentation. Components are in PascalCase, and modules are in camelCase or kebab-case.
*   **Linting:** ESLint is used for linting. Run `pnpm lint` to check for issues.
*   **Testing:** Unit tests are written with Jest and Testing Library. End-to-end tests are written with Playwright.
*   **Commits and Pull Requests:** Commit messages should be in the imperative mood. Pull requests should include a summary, justification, and testing plan.
*   **Secrets:** Secrets are managed using a `.env` file. The only required secret is `GEMINI_API_KEY`.
