#!/usr/bin/env node
// Generate architecture snapshot for tools/aritcector/architecture.data.js (no server needed)
// Scans the repo, counts files/lines, and extracts simple import relations (src only)

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "tools", "aritcector", "architecture.data.js");
const SCAN_DIRS = ["src", "scripts", "tools", "public"];

function walk(dir, filter = () => true) {
  const items = [];
  (function rec(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
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
  return path.relative(ROOT, p).replaceAll("\\", "/");
}

function parseImports(code) {
  const lines = code.split(/\r?\n/);
  const deps = [];
  const re1 = /^\s*import\s+[^'";]+['"]([^'";]+)['"];?/;
  const re2 = /^\s*import\(['"]([^'";]+)['"]\)/; // dynamic import
  const re3 = /^\s*const\s+[^=]+=\s*require\(['"]([^'";]+)['"]\)/; // cjs
  for (const l of lines) {
    const m = l.match(re1) || l.match(re2) || l.match(re3);
    if (m) deps.push(m[1]);
  }
  return deps;
}

function resolveImport(fromFile, imp) {
  if (!imp.startsWith(".") && !imp.startsWith("/")) return null; // ignore packages
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
  // unresolved relative — return relative normalized
  return rel(path.resolve(base, imp));
}

function collect() {
  const metas = [];
  let totalFiles = 0,
    totalLines = 0,
    tsFiles = 0;
  for (const d of SCAN_DIRS) {
    const dir = path.join(ROOT, d);
    if (!fs.existsSync(dir)) continue;
    const files = walk(dir, (p) => isCodeFile(p));
    for (const f of files) {
      const code = fs.readFileSync(f, "utf8");
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

  // Section summaries
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

  const data = {
    meta: { generatedAt: new Date().toISOString() },
    stats: { totalFiles, totalLines, tsFiles },
    sections,
    modules: metas,
  };
  return data;
}

function ensureDirOf(p) {
  try {
    fs.mkdirSync(path.dirname(p), { recursive: true });
  } catch {}
}
function writeOut(data) {
  const header = `// AUTO-GENERATED. Do not edit by hand.\n`;
  const body = `window.XAGENT_ARCH = ${JSON.stringify(data, null, 2)};\n`;
  ensureDirOf(OUT);
  fs.writeFileSync(OUT, header + body, "utf8");
  console.log(
    `✅ Wrote snapshot: ${rel(OUT)} (files=${data.stats.totalFiles}, lines=${data.stats.totalLines})`,
  );
}

function main() {
  const watch = process.argv.includes("--watch");
  writeOut(collect());
  if (!watch) return;
  console.log("👀 Watching for changes...");
  const dirs = SCAN_DIRS.map((d) => path.join(ROOT, d)).filter(fs.existsSync);
  const debounce = (fn, ms = 300) => {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
  };
  const run = debounce(() => {
    try {
      writeOut(collect());
    } catch (e) {
      console.error("Error:", e);
    }
  }, 300);
  for (const d of dirs) fs.watch(d, { recursive: true }, run);
}

main();
