# LionXA Project Overview

This document provides essential context for the LionXA project, an AI-powered browser agent with a web-based dashboard and cloud-native infrastructure.

## 1. Architecture & Purpose

LionXA is a multi-service application designed to automate browser tasks using AI. It consists of:

-   **Frontend:** A Next.js dashboard for monitoring and interacting with the agent.
-   **Agent:** A Playwright-based service that runs in a containerized desktop environment (XFCE with VNC) and executes browser automation tasks.
-   **MCP Gateway:** A "Multi-Capability Proxy" running on Node.js, which appears to be the main entry point for remote operations, deployed to Google Cloud Run.
-   **Infrastructure:** The entire cloud stack is managed using Terraform, including a VPC, firewall rules, a Compute Engine VM, and the Cloud Run service.

## 2. Key Technologies

-   **Frontend:** Next.js, React, TypeScript, Tailwind CSS
-   **Backend/Agent:** Playwright, TypeScript, Node.js, Docker
-   **Infrastructure as Code:** Terraform
-   **CI/CD:** GitHub Actions
-   **Containerization:** Docker, Docker Compose
-   **Package Manager:** pnpm

## 3. Getting Started

### Local Development

The primary method for running the application locally is via Docker Compose.

1.  **Environment Setup:**
    ```bash
    cp .env.example .env
    # Edit .env to add necessary secrets like GEMINI_API_KEY
    ```

2.  **Build and Run:**
    ```bash
    docker compose build --no-cache
    docker compose up -d
    ```

-   **Dashboard:** [http://localhost:3000](http://localhost:3000)
-   **MCP Gateway:** [http://localhost:8080](http://localhost:8080)
-   **VNC Access (via Guacamole):** [http://localhost:8080/guacamole](http://localhost:8080/guacamole)
    -   Default credentials are in `infra/guacamole/user-mapping.xml`.

### Development Scripts (`package.json`)

-   `pnpm dev`: Starts the Next.js development server.
-   `pnpm build`: Creates a production build of the Next.js application.
-   `pnpm test`: Runs Jest unit tests.
-   `pnpm test:e2e`: Runs Playwright end-to-end tests.

## 4. Infrastructure (Terraform & GCP)

The cloud infrastructure is defined in the `infra/terraform/` directory and managed via Terraform Cloud.

-   **Main Components:**
    -   `mcp_gateway.tf`: Defines the Cloud Run service for the MCP Gateway.
    -   `main.tf`: Defines the network (VPC, firewall) and an optional Compute Engine VM.
-   **Deployment:** Changes are applied via Terraform Cloud, which is configured with variables for credentials and environment settings.
-   **Cloud Run Service:** The `mcp-gateway` is deployed as a public service on Cloud Run, with application-level authentication for sensitive paths.
-   **VM:** A Compute Engine VM (`lionxa-server`) can be provisioned to run the entire Docker Compose stack in the cloud. Its creation is controlled by the `enable_vm` Terraform variable.

## 5. Development Conventions

-   **Monorepo Structure:** The project is organized as a monorepo, with distinct services in the `services/` directory and shared configuration at the root.
-   **Testing:** The project uses Jest for unit tests (`__tests__/`) and Playwright for E2E tests (`e2e/`).
-   **Infrastructure as Code:** All infrastructure changes should be made through Terraform to avoid configuration drift. The audit from `docs/audit-2025-09-22.md` highlights the importance of this, as a manual `gcloud` deployment caused drift.
-   **Secrets Management:** Secrets are managed via `.env` for local development and Terraform Cloud variables for deployments. Avoid committing secrets to the repository.
