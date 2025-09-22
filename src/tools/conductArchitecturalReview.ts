import fs from "fs";
import path from "path";

export type DebtSeverity = "critical" | "major" | "minor";

export interface TechnicalDebtItem {
  description: string;
  severity: DebtSeverity;
  estimatedEffort: number; // hours
}

export interface ArchitecturalReviewResult {
  codeQuality: {
    score: "A" | "B" | "C" | "D" | "E" | "F";
    summary: string;
    metrics: {
      files: number;
      linesOfCode: number;
      avgFileSize: number;
      longFiles: Array<{ file: string; lines: number }>;
      todos: number;
      tests: number;
      srcFiles: number;
    };
  };
  architecturalIssues: string[];
  technicalDebtItems: TechnicalDebtItem[];
  testCoverageAnalysis: Record<string, string>;
  dependencyHealth: {
    total: number;
    outdated: Array<{ name: string; current: string; latest?: string }>;
  };
  timestamp: number;
}

const EXCLUDES = new Set([
  "node_modules",
  ".next",
  "out",
  "build",
  "coverage",
  "playwright-report",
  "test-results",
  ".git",
  "personal",
  "tools",
]);

function walk(dir: string, acc: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith(".")) {
      if (e.name === ".env" || e.name === ".env.example") continue;
    }
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (EXCLUDES.has(e.name)) continue;
      acc = walk(p, acc);
    } else {
      acc.push(p);
    }
  }
  return acc;
}

function countLines(file: string): number {
  try {
    const content = fs.readFileSync(file, "utf8");
    return content.split(/\r?\n/).length;
  } catch {
    return 0;
  }
}

function estimateCoverageByDir(root: string, files: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  const srcDir = path.join(root, "src");
  const byDir: Record<string, { src: number; tests: number }> = {};
  for (const f of files) {
    const rel = path.relative(root, f);
    if (!rel.startsWith("src")) continue;
    const dir = path.dirname(rel).split(path.sep).slice(0, 2).join("/");
    if (!byDir[dir]) byDir[dir] = { src: 0, tests: 0 };
    const isTest = /(__tests__|\.test\.|\.spec\.)/.test(rel);
    const isCode = /(\.tsx?|\.jsx?)$/.test(rel) && !isTest && !rel.endsWith(".d.ts");
    if (isCode) byDir[dir].src += 1;
    if (isTest) byDir[dir].tests += 1;
  }
  for (const [dir, { src, tests }] of Object.entries(byDir)) {
    const pct = src === 0 ? 0 : Math.min(100, Math.round((tests / src) * 100));
    result["/" + dir] = `${pct}%`;
  }
  if (Object.keys(result).length === 0 && fs.existsSync(path.join(root, "coverage"))) {
    result["/src"] = "from reports";
  }
  return result;
}

function grade(metrics: {
  avgFileSize: number;
  longFiles: number;
  todos: number;
}): ArchitecturalReviewResult["codeQuality"]["score"] {
  let score = 100;
  if (metrics.avgFileSize > 250) score -= 20;
  if (metrics.longFiles >= 3) score -= 20;
  if (metrics.todos > 10) score -= 20;
  if (metrics.todos > 30) score -= 20;
  if (metrics.longFiles >= 10) score -= 20;
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  if (score >= 50) return "E";
  return "F";
}

export async function conductArchitecturalReview(): Promise<ArchitecturalReviewResult> {
  const root = process.cwd();
  const files = walk(root);
  const codeFiles = files.filter((f) => /(\.tsx?|\.jsx?)$/.test(f));
  const tests = files.filter((f) => /(__tests__|\.test\.|\.spec\.)/.test(f));
  const todos = files
    .filter((f) => /(\.tsx?|\.jsx?|\.md|\.yml|\.json)$/.test(f))
    .reduce((acc, f) => {
      try {
        const c = fs.readFileSync(f, "utf8");
        return acc + (c.match(/TODO|FIXME/gi)?.length || 0);
      } catch {
        return acc;
      }
    }, 0);

  const fileLineEntries = codeFiles.map((f) => ({ file: path.relative(root, f), lines: countLines(f) }));
  const linesOfCode = fileLineEntries.reduce((a, b) => a + b.lines, 0);
  const avgFileSize = codeFiles.length ? Math.round(linesOfCode / codeFiles.length) : 0;
  const longFiles = fileLineEntries.filter((x) => x.lines > 500).sort((a, b) => b.lines - a.lines).slice(0, 5);

  const testCoverageAnalysis = estimateCoverageByDir(root, files);

  // Simple architectural issues heuristics
  const architecturalIssues: string[] = [];
  if (!fs.existsSync(path.join(root, ".github", "workflows"))) {
    architecturalIssues.push("Missing CI workflow configuration under .github/workflows");
  }
  if (!fs.existsSync(path.join(root, "docker-compose.yml"))) {
    architecturalIssues.push("Missing docker-compose.yml for dev stack");
  }
  if (!fs.existsSync(path.join(root, "src", "__tests__"))) {
    architecturalIssues.push("Missing unit tests directory src/__tests__");
  }

  // Technical debt items (mocked + heuristic)
  const technicalDebtItems: TechnicalDebtItem[] = [];
  if (longFiles.length > 0) {
    for (const lf of longFiles) {
      technicalDebtItems.push({
        description: `Refactor long file ${lf.file} (${lf.lines} LOC) into smaller modules`,
        severity: lf.lines > 1200 ? "critical" : "major",
        estimatedEffort: Math.min(16, Math.ceil(lf.lines / 200)),
      });
    }
  }
  if (todos > 0) {
    technicalDebtItems.push({
      description: `Address ${todos} TODO/FIXME comments across the codebase`,
      severity: todos > 30 ? "major" : "minor",
      estimatedEffort: Math.ceil(todos / 5),
    });
  }

  // Dependencies
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const depEntries = Object.entries({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }) as Array<[
    string,
    string
  ]>;
  const dependencyHealth = {
    total: depEntries.length,
    outdated: depEntries
      .filter(([_, v]) => typeof v === "string" && !String(v).startsWith("^"))
      .slice(0, 10)
      .map(([name, current]) => ({ name, current })),
  };

  const score = grade({ avgFileSize, longFiles: longFiles.length, todos });
  const result: ArchitecturalReviewResult = {
    codeQuality: {
      score,
      summary: `Approx. ${linesOfCode} LOC across ${codeFiles.length} code files; ${tests.length} tests; ${todos} TODOs.`,
      metrics: {
        files: codeFiles.length,
        linesOfCode,
        avgFileSize,
        longFiles,
        todos,
        tests: tests.length,
        srcFiles: codeFiles.filter((f) => f.includes(`${path.sep}src${path.sep}`)).length,
      },
    },
    architecturalIssues,
    technicalDebtItems,
    testCoverageAnalysis,
    dependencyHealth,
    timestamp: Date.now(),
  };
  return result;
}

