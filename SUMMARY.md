Xagent — Repo Cleanup and Production Agent Setup (keeping aritcector/)

Overview
- Unified app: Next.js UI + Dashboard (Express/Socket.IO) + Agent loop (Playwright + Gemini) + persistent Chromium profile.
- Architecture viewer remains at `aritcector/` and is decoupled from the app build.

What changed
- Config: default persistent profile is unified at `src/profiles/agent_profile/Default` (override via `PROFILE_DIR`).
- Gemini: removed random emoji injection; responses within 280 chars, no emojis/hashtags.
- Setup: `src/setup/validatePlaywright.ts` is a clean validator that launches Chromium with env flags.
- Scripts: added `dev:ui` and `start:agent:prod` (headless + safe flags); retained existing scripts.
- .env.example: added `PROFILE_DIR`, ports (`PORT_UI`, `DASHBOARD_PORT`), dashboard client hints.
- Docs: updated `AGENTS.md` with profile/cache policy.

Production notes
- Run Next.js in production with `pnpm build` then `pnpm start`.
- Run agent headless with sandbox-safe flags: `pnpm start:agent:prod`.
- Persistent profile lives in `PROFILE_DIR` (default `src/profiles/agent_profile/Default`).

Quick flow (ASCII)

  [Next.js UI (src/app)] ⇄ Socket.IO ⇄ [Dashboard (src/dashboard.ts)] ⇄ logEvent*
                                              ↑
                                              │
                                       [Agent Loop (src/watchList.ts)] → [Browser (src/browser.ts → Playwright → X.com)]
                                            │ uses gemini/memory/config/profiles
                                            └→ artifacts → reports/

