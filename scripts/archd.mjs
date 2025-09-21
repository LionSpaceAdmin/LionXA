#!/usr/bin/env node
// Minimal background server for architecture snapshot (isolated from Next)
// Serves:
//  - GET /api/architecture  -> live snapshot JSON (CORS: *)
//  - /aritcector/*          -> static viewer files from repo (optional)

import express from "express";
import path from "node:path";
import fs from "node:fs";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3003;
const ROOT = path.resolve(process.cwd());
const VIEW_DIR = path.join(ROOT, "tools", "aritcector");

function walk(dir, filter) {
  const items = [];
  (function rec(d) {
    let entries = [];
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) rec(full);
      else if (filter(full)) items.push(full);
    }
  })(dir);
  return items;
}

function isCodeFile(p) {
  return /\.(tsx?|jsx?|mjs|cjs)$/.test(p);
}
function readLines(p) {
  try {
    return fs.readFileSync(p, "utf8").split(/\r?\n/).length;
  } catch {
    return 0;
  }
}
function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, "/");
}
function parseImports(code) {
  const lines = code.split(/\r?\n/);
  const deps = [];
  const re1 = /^\s*import\s+[^'";]+['"]([^'";]+)['"];?/;
  const re2 = /^\s*import\(['"]([^'";]+)['"]\)/;
  const re3 = /^\s*const\s+[^=]+=\s*require\(['"]([^'";]+)['"]\)/;
  for (const l of lines) {
    const m = l.match(re1) || l.match(re2) || l.match(re3);
    if (m) deps.push(m[1]);
  }
  return deps;
}
function resolveImport(fromFile, imp) {
  if (!imp.startsWith(".") && !imp.startsWith("/")) return null;
  const base = path.dirname(fromFile);
  const tryPaths = [
    imp,
    imp + ".ts",
    imp + ".tsx",
    imp + ".js",
    imp + ".jsx",
    imp + "/index.ts",
    imp + "/index.tsx",
  ];
  for (const tp of tryPaths) {
    const full = path.resolve(base, tp);
    if (fs.existsSync(full)) return rel(full);
  }
  return rel(path.resolve(base, imp));
}

function collect() {
  const SCAN_DIRS = ["src", "scripts", "tools", "public"];
  const metas = [];
  let totalFiles = 0,
    totalLines = 0,
    tsFiles = 0;
  for (const d of SCAN_DIRS) {
    const dir = path.join(ROOT, d);
    if (!fs.existsSync(dir)) continue;
    const files = walk(dir, isCodeFile);
    for (const f of files) {
      let code = "";
      try {
        code = fs.readFileSync(f, "utf8");
      } catch {}
      const lines = readLines(f);
      const imps = parseImports(code)
        .map((i) => resolveImport(f, i))
        .filter(Boolean);
      metas.push({ path: rel(f), lines, imports: imps });
      totalFiles += 1;
      totalLines += lines;
      if (/\.tsx?$/.test(f)) tsFiles += 1;
    }
  }
  const sections = [
    {
      id: "app",
      title: "src/app (Next.js)",
      description: "דפים ו־layout של ה־UI",
    },
    {
      id: "components",
      title: "src/components/dashboard",
      description: "רכיבי UI (MetricCard, Header, Sidebar)",
    },
    {
      id: "dashboard",
      title: "src/dashboard.ts",
      description: "שרת Express+Socket.IO לשידור אירועים",
    },
    {
      id: "agent",
      title: "src/watchList.ts",
      description: "לולאת הסוכן (Playwright + Gemini)",
    },
    {
      id: "browser",
      title: "src/browser.ts",
      description: "ניהול סשן כרום מתמיד",
    },
    {
      id: "gemini",
      title: "src/gemini.ts",
      description: "לקוח Google Generative AI",
    },
    { id: "setup", title: "src/setup/", description: "סקריפטים וכלי התקנה" },
    {
      id: "scripts",
      title: "scripts/",
      description: "שירותים (למשל Lighthouse)",
    },
  ];
  return {
    meta: { generatedAt: new Date().toISOString() },
    stats: { totalFiles, totalLines, tsFiles },
    sections,
    modules: metas,
  };
}

// CORS for file:// usage
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.end();
  next();
});

app.get("/api/architecture", (_req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    res.json(collect());
  } catch (e) {
    res.status(500).json({ error: "failed_to_collect" });
  }
});

if (fs.existsSync(VIEW_DIR)) {
  app.use("/aritcector", express.static(VIEW_DIR));
  app.get("/", (_req, res) => res.redirect("/aritcector/index.html"));
}

app.listen(PORT, () => {
  console.log(`archd listening on http://127.0.0.1:${PORT}`);
});
