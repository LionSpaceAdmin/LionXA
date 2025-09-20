# GEMINI.md

## Project Overview

This is a TypeScript-based Next.js project that uses Playwright to automate interactions with X.com (formerly Twitter). It functions as an "agent" that monitors a specific X.com list, and when it finds new tweets from users with pre-defined profiles, it uses the Google Gemini API to generate and post replies. The project also includes a real-time dashboard to monitor the agent's activity.

**Key Technologies:**

*   Next.js and React
*   Playwright for browser automation
*   Google Gemini API for AI-powered replies
*   TypeScript
*   Express and Socket.IO for the real-time dashboard

**Core Functionality:**

*   **`src/watchList.ts`**: The main entry point for the agent. It logs into X.com, navigates to a specified list, scrapes tweets, and for new tweets from profiled users, it generates and posts a reply using Gemini.
*   **`src/dashboard.ts`**: Sets up an Express server with Socket.IO to provide a real-time dashboard of the agent's activities.
*   **`src/profiles/`**: Contains profiles of X.com users that the agent should interact with. Each profile likely contains a custom prompt for the Gemini API.
*   **`src/config.ts`**: Central configuration file.

## Building and Running

1.  **Install Dependencies:**
    ```bash
    pnpm install
    ```

2.  **Set up the environment:**
    ```bash
    pnpm run setup
    ```

3.  **Run the agent:**
    ```bash
    pnpm run start:agent
    ```

4.  **Run the dashboard:**
    ```bash
    pnpm run dashboard
    ```

**Other Commands:**

*   `pnpm run dev`: Start the Next.js development server.
*   `pnpm run build`: Build the Next.js application for production.
*   `pnpm run start`: Start the production Next.js server.
*   `pnpm run lint`: Lint the code.
*   `pnpm run validate`: Validate the Playwright installation.

## Development Conventions

*   The code is structured into modules with clear responsibilities (e.g., `browser.ts`, `gemini.ts`, `memory.ts`).
*   It uses a central configuration file (`src/config.ts`).
*   It uses a singleton pattern for the browser instance.
*   It has a dashboard for monitoring.
*   It has a setup script for environment validation.
