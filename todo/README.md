Single Chromium Agent — Always-On, Interactive, Single Window

Overview
- Runs as a singleton Playwright agent using a dedicated Chromium profile.
- Maintains exactly one Browser + one Context + one Page for the entire runtime.
- Interactive by default (headful). Headless supported via `INTERACTIVE=0`.
- Keeps one persistent Chromium window open using `userDataDir` to preserve session/cookies.
- Guarded scan loop with logging, rate limits, error backoff, and recovery.

Run Modes
- `INTERACTIVE=1` (default): headful, persistent Chromium window remains usable by you.
- `INTERACTIVE=0`: headless run. Still uses the same profile folder for cookies.

Paths
- User data dir (Chromium profile): `Xagent/.agent_chromium_profile`
- Start URL (active source): `config.browser.startUrl`, defaulting to `TWITTER_LIST_URL`.

How To Run
1) Ensure dependencies are installed in `Xagent` (already present in this workspace).
2) Set env in `Xagent/.env` (needs `OPENAI_API_KEY`; optional `TWITTER_LIST_URL`).
3) From `Xagent/`, run:
   - `pnpm start` (or `npm run start`) for interactive mode.
   - `INTERACTIVE=0 pnpm start` for headless.
 4) Ensure Playwright Chromium is installed: `npx playwright install chromium` (one-time).

Behavior
- Singleton session: `ensureSession()` creates/reuses a single persistent Chromium session (one window, one page).
- Keep-open: On first run, navigates once to the list/notifications and keeps the tab open.
- Interactive: If you manually interact (navigate elsewhere), the agent skips scans until you return; it does not relaunch.
- Recovery: If the window/page is closed, `ensureSession()` recreates the session once on the next cycle (still one window only).
- Guarded loop: The scan loop is mutex-guarded to prevent overlaps; no fire-and-forget intervals.
- Logging: Logs session init (URL, profile, pid), scan start/end, replies count, and recoveries; backs off on errors.
- Rate limits: Caps replies per hour/day; respects a minimal delay between cycles.

Pause / Resume
- Pause: simply close the window. The agent will recreate once when needed on the next cycle.
- Resume: bring the existing window to foreground and return to the list page; the agent continues scanning on the next tick.

Proof Logs
- Look for lines:
  - `Session init: url=..., Profile=.agent_chromium_profile, Engine=Chromium, PID=...` indicates a single session init on Chromium.
  - `Scan start` / `Scan end` repeating without additional `Session init` indicates single-window continuous operation.
  - `Context closed... Will recreate on next cycle.` followed by exactly one `Session init` indicates single controlled recreate after a forced close.
