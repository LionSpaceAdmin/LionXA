# Repository Guidelines

Note: For production deployment instructions and infrastructure, see `PRODUCTION.md`. For running the agent locally in an interactive “Agent Mode”, see `AGENT_MODE.md`. A general overview is in `README.md`.

## מבנה הפרויקט וארגון מודולים
- `src/app` — אפליקציית Next.js (UI): דפים, layout ו־`globals.css`.
- `src/components/dashboard` — רכיבי UI (למשל `MetricCard.tsx`, `Header.tsx`).
- `src/dashboard.ts` — שרת Express + Socket.IO (פורט 3001) המשדר נתונים בזמן אמת ל־UI.
- `src/watchList.ts` — לולאת הסוכן (Playwright) לסריקת רשימת X.com ותגובה דרך Gemini.
- `src/browser.ts` — ניהול סשן Chromium מתמיד.
- `src/gemini.ts` — לקוח Google Generative AI ומעטפת עזר.
- `src/__tests__` — בדיקות יחידה; `e2e/` — בדיקות E2E של Playwright.
- `src/setup/` — סקריפטי התקנה; `scripts/` — שירותים (למשל Lighthouse).
- `public/` — נכסים סטטיים. `data/` — מצב ריצה (נוצר לפי צורך).

## פקודות Build, Test ו־Development
- `pnpm install` — התקנת חבילות (להשתמש ב־pnpm כפי שמוגדר ב־`package.json`).
- `pnpm dev` — מריץ UI של Next.js בלבד ב־`http://localhost:3000` (ללא סוכן וללא פתיחת Chromium).
- `pnpm dev:all` — UI + סוכן אמיתי (מפעיל את הדאשבורד על פורט 3001 ומזין תצוגת "דפדפן חי").
- `pnpm start:agent` — מפעיל את הסוכן ואת שרת הדאשבורד (3001).
- `pnpm start:all` — הרצה מקומית "כמו פרודקשן": UI, סוכן ו־Edge Proxy על `$PORT`.
- `pnpm build` / `pnpm start` — Build לפרודקשן והרצת ה־UI.
- `pnpm lint` — הרצת ESLint.
- `pnpm test` / `pnpm test:watch` / `pnpm test:coverage` — בדיקות יחידה (Jest).
- `pnpm test:e2e` / `pnpm test:e2e:ui` — בדיקות Playwright (משתמשות ב־`pnpm dev` שמריץ UI בלבד).

## סגנון קוד ושמות
- TypeScript + React (Next.js), הזחה של 2 רווחים.
- רכיבים ב־PascalCase (`MetricCard.tsx`); מודולים ב־camelCase/‏kebab-case בהתאם למקובל.
- עדיפו Named exports; Default export מקובל לקובץ רכיב יחיד.
- להריץ `pnpm lint` לפני push. הוסיפו `"use client"` לרכיבי לקוח בעת הצורך.
- פרופיל דפדפן: לשימוש מקומי בלבד נשמרת ספריית פרופיל מאוחדת ב־`src/profiles/agent_profile/Default`.
  - אין להעלות קבצי Cache/Models/Telemetry/ShaderCache/GraphiteDawnCache/GrShaderCache/Code Cache/GPUCache/Variations/BrowserMetrics וכד׳.
  - מותר לשמור נתוני Session חיוניים בלבד (למשל `Default/Cookies`, `Default/Local Storage/**`).
  - מומלץ להגדיר נתיב פרופיל דרך משתנה סביבה `PROFILE_DIR`.

## קווים מנחים לבדיקות
- יחידה: Jest (`testEnvironment: jsdom`) + Testing Library. למקם בדיקות תחת `src/**/__tests__/` או כ־`*.test.ts(x)`.
- E2E: Playwright בתיקיית `e2e/`. הקונפיג מפעיל `pnpm dev` אוטומטית; להריץ במקביל `pnpm start:agent` כדי לקבל אירועים חיים.
- שאפו לכיסוי משמעותי (`pnpm test:coverage`). צילומי מסך תחת `e2e/screenshots/` בעת הצורך.

## Commits ו־Pull Requests
- הודעות קומיט בגוף ציווי ותמציתיות (לדוגמה: "Add dashboard metric card"). לקבץ שינויים קשורים.
- PR חייב לכלול: תקציר, נימוק, תוכנית בדיקה (פקודות), Issues מקושרים וצילומי מסך UI במידת האפשר.
- לפני פתיחת PR: ודאו מעבר מקומי של `pnpm lint`, `pnpm test` ואם רלוונטי `pnpm test:e2e`.

## אבטחה והגדרות
- סודות רק ב־`.env`. חובה: `GEMINI_API_KEY` (או `DRY_RUN=1` למצב סימולציה ללא קריאות API). רשות: `TWITTER_LIST_URL`, `START_URL`, `HEADLESS_BROWSER=true` או `INTERACTIVE=0`, `BROWSER_USER_DATA_DIR`.
- דוגמה ל־`.env`:
  - `GEMINI_API_KEY=your-key`
  - `TWITTER_LIST_URL=https://x.com/i/lists/123...`
  - `DRY_RUN=1`
- אין להתחייב cookies, טוקנים או מידע אישי.

---

הערה: להרצה בפרודקשן והקשחות נוספות ראו `PRODUCTION.md`.
