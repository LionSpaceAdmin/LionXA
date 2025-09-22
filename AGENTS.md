# Repository Guidelines

This guide orients new contributors to LionXA so you can ship agent updates quickly and safely.

## Project Structure & Module Organization

Application code lives in `src/`, with feature modules such as `src/app` (Next.js routes), `src/components` (shared UI), and `src/tools` (agent utilities). Browser automation lives in `services/agent/`, while optional backend scaffolding resides in `services/backend/`. E2E assets are under `e2e/`, infrastructure templates in `infra/`, utility scripts in `scripts/`, and audit artefacts in `_reports/`. Treat files in `data/` and `cookies.json` as local-only seed material.

## Build, Test, and Development Commands

- `pnpm dev` launches the Next.js dashboard locally.
- `pnpm start:agent` runs the Playwright-driven agent loop.
- `pnpm build` creates a deterministic production bundle (`.next/`), forcing `DRY_RUN=1` and `SKIP_GEMINI_CHECK=1`.
- `pnpm clean` removes `.next/`, `.tmp/`, and cached outputs.

## Coding Style & Naming Conventions

Use TypeScript with two-space indentation and ESLint/Prettier defaults. Components stay PascalCase, hooks camelCase, and config files snake_case only when matching upstream APIs. Keep JSX lean, and prefer module-scoped `logger` helpers in `src/logging.ts` for observability. Run `pnpm lint` and `pnpm format:check` before pushing; CI enforces both.

## Testing Guidelines

Jest unit tests live beside sources in `src/__tests__/` or next to the file under test with the `.test.ts` suffix. Execute `pnpm test` for the full suite (`--ci --runInBand`). Playwright journeys live in `e2e/` and run via `pnpm test:e2e`; they require Docker or local browsers, so gate them behind feature flags when possible. Aim for coverage on critical agent flows (task ingestion, browsing, result reporting).

## Commit & Pull Request Guidelines

Adopt Conventional Commits (`feat:`, `fix:`, `chore:`) and keep subjects under 72 characters. Every PR should call out linked issues, list the commands you ran (build/lint/typecheck/test), and include screenshots or logs for UI or agent behavior changes. Request review from the CODEOWNERS-specified team when touching core agent logic or infra.

## Security & Configuration Tips

Never commit secrets or browser state. Keep `.env` derived from `.env.example`, retaining `DRY_RUN=1` unless you explicitly hold a `GEMINI_API_KEY`. Store VNC credentials and service-account JSON outside the repo and inject them via GitHub environments or local shell exports.

## Don’ts

- אל תריצו שרתי dev ממושכים במהלך אוטומציה; הסתפקו בפקודות headless (build/test/lint/typecheck).
- אל תשריינו Secrets בקבצים; הסתמכו על GitHub Secrets/Environments והחזיקו ערכי דמה בלבד ב־`.env.example`.
- אל תדחו בדיקות או lint — PRs חייבים לעבור `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, ו־`pnpm test` לפני מיזוג.
