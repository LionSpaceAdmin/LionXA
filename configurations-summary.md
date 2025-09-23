# סיכום קונפיגורציות

| שכבה | קובץ | תיאור |
| --- | --- | --- |
| תשתיות (Terraform/Docker) | `docker-compose.yml` | מגדיר את השירותים של האפליקציה והתלויות ביניהם בסביבת דוקר. |
| ממשק משתמש (Next.js) | `package.json` | מגדיר את התלויות והסקריפטים של הפרויקט. |
| תשתיות (Terraform/Docker) | `infra/terraform/main.tf` | מגדיר את התשתיות של הפרויקט ב-Google Cloud Platform. |
| תשתיות (Terraform/Docker) | `infra/guacamole/user-mapping.xml` | מגדיר את המשתמשים והחיבורים של Guacamole. |
| פרוקסי (שער MCP) | `.mcp/servers.json` | מגדיר את השרתים שהשער של MCP יכול להפעיל. |
| סודות (ENV) | `.env` | מכיל משתני סביבה להגדרת האפליקציה. |
| ממשק משתמש (Next.js) | `next.config.mjs` | קובץ התצורה של Next.js. |
| ממשק משתמש (Next.js) | `tailwind.config.ts` | קובץ התצורה של Tailwind CSS. |
| ממשק משתמש (Next.js) | `tsconfig.json` | קובץ התצורה של TypeScript. |
