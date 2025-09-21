// AUTO-GENERATED. Do not edit by hand.
window.XAGENT_ARCH = {
  "meta": {
    "generatedAt": "2025-09-20T22:21:01.163Z"
  },
  "stats": {
    "totalFiles": 43,
    "totalLines": 4449,
    "tsFiles": 36
  },
  "sections": [
    {
      "id": "app",
      "title": "src/app (Next.js)",
      "description": "דפים ו־layout של ה־UI"
    },
    {
      "id": "components",
      "title": "src/components/dashboard",
      "description": "רכיבי UI (MetricCard, Header, Sidebar)"
    },
    {
      "id": "dashboard",
      "title": "src/dashboard.ts",
      "description": "שרת Express+Socket.IO לשידור אירועים"
    },
    {
      "id": "agent",
      "title": "src/watchList.ts",
      "description": "לולאת הסוכן (Playwright + Gemini)"
    },
    {
      "id": "browser",
      "title": "src/browser.ts",
      "description": "ניהול סשן כרום מתמיד"
    },
    {
      "id": "gemini",
      "title": "src/gemini.ts",
      "description": "לקוח Google Generative AI"
    },
    {
      "id": "setup",
      "title": "src/setup/",
      "description": "סקריפטים וכלי התקנה"
    },
    {
      "id": "scripts",
      "title": "scripts/",
      "description": "שירותים (למשל Lighthouse)"
    }
  ],
  "modules": [
    {
      "path": "src/__tests__/Header.test.tsx",
      "lines": 23,
      "imports": []
    },
    {
      "path": "src/__tests__/MetricCard.test.tsx",
      "lines": 42,
      "imports": [
        "src/components/dashboard/MetricCard.tsx"
      ]
    },
    {
      "path": "src/__tests__/Sidebar.test.tsx",
      "lines": 50,
      "imports": []
    },
    {
      "path": "src/__tests__/dashboard.test.ts",
      "lines": 60,
      "imports": [
        "src/dashboard.ts"
      ]
    },
    {
      "path": "src/__tests__/setup.ts",
      "lines": 57,
      "imports": []
    },
    {
      "path": "src/accounts.ts",
      "lines": 20,
      "imports": []
    },
    {
      "path": "src/app/layout.tsx",
      "lines": 23,
      "imports": []
    },
    {
      "path": "src/app/page.tsx",
      "lines": 175,
      "imports": []
    },
    {
      "path": "src/backup.ts",
      "lines": 103,
      "imports": [
        "src/config.ts"
      ]
    },
    {
      "path": "src/browser.ts",
      "lines": 218,
      "imports": [
        "src/config.ts"
      ]
    },
    {
      "path": "src/components/dashboard/Header.tsx",
      "lines": 43,
      "imports": []
    },
    {
      "path": "src/components/dashboard/MetricCard.tsx",
      "lines": 165,
      "imports": []
    },
    {
      "path": "src/components/dashboard/Sidebar.tsx",
      "lines": 125,
      "imports": []
    },
    {
      "path": "src/config.ts",
      "lines": 102,
      "imports": []
    },
    {
      "path": "src/dashboard.ts",
      "lines": 174,
      "imports": []
    },
    {
      "path": "src/gemini.ts",
      "lines": 108,
      "imports": [
        "src/config.ts"
      ]
    },
    {
      "path": "src/knowledge.ts",
      "lines": 25,
      "imports": []
    },
    {
      "path": "src/logging.ts",
      "lines": 43,
      "imports": [
        "src/config.ts"
      ]
    },
    {
      "path": "src/memory.ts",
      "lines": 106,
      "imports": [
        "src/config.ts"
      ]
    },
    {
      "path": "src/mockFeed.ts",
      "lines": 27,
      "imports": [
        "src/dashboard.ts"
      ]
    },
    {
      "path": "src/profiles/AbujomaaGaza.ts",
      "lines": 24,
      "imports": [
        "src/profiles/index.ts"
      ]
    },
    {
      "path": "src/profiles/AdameMedia.ts",
      "lines": 23,
      "imports": [
        "src/profiles/index.ts"
      ]
    },
    {
      "path": "src/profiles/AyatollahKhamenei.ts",
      "lines": 24,
      "imports": [
        "src/profiles/index.ts"
      ]
    },
    {
      "path": "src/profiles/FuckIsrEveryHr.ts",
      "lines": 24,
      "imports": [
        "src/profiles/index.ts"
      ]
    },
    {
      "path": "src/profiles/IlhanMN.ts",
      "lines": 25,
      "imports": [
        "src/profiles/index.ts"
      ]
    },
    {
      "path": "src/profiles/JacksonHinklle.ts",
      "lines": 25,
      "imports": [
        "src/profiles/index.ts"
      ]
    },
    {
      "path": "src/profiles/MaxBlumenthal.ts",
      "lines": 25,
      "imports": [
        "src/profiles/index.ts"
      ]
    },
    {
      "path": "src/profiles/RashidaTlaib.ts",
      "lines": 24,
      "imports": [
        "src/profiles/index.ts"
      ]
    },
    {
      "path": "src/profiles/SuppressedNws.ts",
      "lines": 25,
      "imports": [
        "src/profiles/index.ts"
      ]
    },
    {
      "path": "src/profiles/Vikingwarrior20.ts",
      "lines": 25,
      "imports": [
        "src/profiles/index.ts"
      ]
    },
    {
      "path": "src/profiles/index.ts",
      "lines": 56,
      "imports": [
        "src/profiles/AyatollahKhamenei.ts",
        "src/profiles/IlhanMN.ts",
        "src/profiles/JacksonHinklle.ts",
        "src/profiles/MaxBlumenthal.ts",
        "src/profiles/RashidaTlaib.ts",
        "src/profiles/SuppressedNws.ts",
        "src/profiles/FuckIsrEveryHr.ts",
        "src/profiles/Vikingwarrior20.ts",
        "src/profiles/AdameMedia.ts",
        "src/profiles/AbujomaaGaza.ts"
      ]
    },
    {
      "path": "src/safety.ts",
      "lines": 9,
      "imports": []
    },
    {
      "path": "src/setup/devAll.ts",
      "lines": 53,
      "imports": []
    },
    {
      "path": "src/setup/openChrome.ts",
      "lines": 47,
      "imports": [
        "src/browser.ts",
        "src/config.ts"
      ]
    },
    {
      "path": "src/setup/validatePlaywright.ts",
      "lines": 39,
      "imports": []
    },
    {
      "path": "src/watchList.ts",
      "lines": 459,
      "imports": [
        "src/browser.ts",
        "src/memory.ts",
        "src/gemini.ts",
        "src/profiles",
        "src/config.ts",
        "src/backup.ts",
        "src/dashboard.ts"
      ]
    },
    {
      "path": "scripts/archd.mjs",
      "lines": 120,
      "imports": []
    },
    {
      "path": "scripts/generate-architecture.mjs",
      "lines": 120,
      "imports": []
    },
    {
      "path": "scripts/run-lighthouse.mjs",
      "lines": 119,
      "imports": []
    },
    {
      "path": "tools/aritcector/architecture.data.js",
      "lines": 324,
      "imports": []
    },
    {
      "path": "tools/generate_xagent_analytics_dashboard.js",
      "lines": 657,
      "imports": []
    },
    {
      "path": "tools/generate_xagent_flow_diagram.js",
      "lines": 246,
      "imports": []
    },
    {
      "path": "tools/generate_xagent_sessions_diagram.js",
      "lines": 267,
      "imports": []
    }
  ]
};
