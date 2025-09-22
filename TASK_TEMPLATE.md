# Agent Task Template

This template is designed to provide a clear, structured, and effective prompt for long-running or complex tasks to be performed by an AI agent.

---

## 1. High-Level Goal

*A clear, single-sentence summary of the ultimate objective.*

**Example:** "Refactor the authentication logic in `src/server.ts` to use a new JWT library and add unit tests for the new implementation."

## 2. Context & Background

*Provide the necessary context to understand the "why" behind the task. Include links to relevant files, documentation, or external resources.*

-   **Relevant Files:**
    -   `[Path to file 1]`
    -   `[Path to file 2]`
-   **Key Technologies:** `[e.g., pnpm, Docker, Terraform, Next.js, Jest]`
-   **Background:** `[Brief explanation of the current situation and why the change is needed.]`

**Example:**
-   **Relevant Files:**
    -   `src/server.ts`
    -   `src/auth.ts` (old logic)
    -   `__tests__/auth.test.ts`
-   **Key Technologies:** `pnpm`, `Jest`, `ts-node`
-   **Background:** "The current authentication middleware is outdated and lacks proper error handling. We are migrating to a more secure and modern JWT library to improve security and maintainability."

## 3. Acceptance Criteria (Step-by-Step)

*A detailed, ordered list of steps or a checklist of conditions that must be met for the task to be considered complete. This is the core of the task definition.*

1.  **[First logical step]**
2.  **[Second logical step]**
3.  ...
4.  **[Final step, e.g., "Commit the changes with a descriptive message."]**

**Example:**
1.  Add the new JWT library (`jsonwebtoken`) to `package.json` using `pnpm add`.
2.  Create a new file `src/new-auth.ts` to house the new authentication logic.
3.  Implement the new middleware function, ensuring it handles token verification and user extraction.
4.  Replace the old middleware in `src/server.ts` with the new one.
5.  Create a new test file `__tests__/new-auth.test.ts` with comprehensive unit tests covering success and failure cases.
6.  Remove the old `src/auth.ts` file.
7.  Ensure all existing tests continue to pass.

## 4. Verification & Validation

*How to prove the task was completed successfully. This should include specific commands to run and their expected outcomes.*

-   **Verification Commands:**
    ```bash
    # [e.g., pnpm install]
    # [e.g., pnpm lint]
    # [e.g., pnpm test]
    # [e.g., docker compose up -d --build]
    ```
-   **Expected Outcome:**
    -   `[e.g., "All linting and tests must pass."]`
    -   `[e.g., "The application should start successfully and be accessible at http://localhost:3000."]`
    -   `[e.g., "Protected endpoints should return a 401 error without a valid token and a 200 with a valid token."]`

## 5. Constraints & Non-Goals

*What the agent **should not** do. This is critical for preventing unintended side effects.*

-   **Constraints:**
    -   `[e.g., "Must use pnpm for package management."]`
    -   `[e.g., "Do not change the database schema."]`
-   **Non-Goals:**
    -   `[e.g., "Do not refactor any code outside of the authentication modules."]`
    -   `[e.g., "Do not deploy the changes to any environment."]`
