"use client";
import { useEffect, useState } from "react";

type DebtSeverity = "critical" | "major" | "minor";

interface Review {
  codeQuality: {
    score: string;
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
  technicalDebtItems: Array<{
    description: string;
    severity: DebtSeverity;
    estimatedEffort: number;
  }>;
  testCoverageAnalysis: Record<string, string>;
  dependencyHealth: { total: number; outdated: Array<{ name: string; current: string }> };
  timestamp: number;
}

export default function ProjectHealthPage() {
  const [data, setData] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <div className="p-6">שגיאה בטעינת נתוני בריאות הפרויקט: {error}</div>;
  if (!data) return <div className="p-6">טוען לוח בריאות…</div>;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">לוח בריאות הפרויקט</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded border border-neutral-800 bg-neutral-900 p-4">
          <div className="text-neutral-400 text-sm">ציון איכות קוד</div>
          <div className="text-4xl font-bold mt-2">{data.codeQuality.score}</div>
          <div className="text-neutral-400 text-sm mt-2">{data.codeQuality.summary}</div>
        </div>
        <div className="rounded border border-neutral-800 bg-neutral-900 p-4">
          <div className="text-neutral-400 text-sm">תלויות</div>
          <div className="text-4xl font-bold mt-2">{data.dependencyHealth.total}</div>
          <div className="text-neutral-400 text-sm mt-2">פגומות/מיושנות: {data.dependencyHealth.outdated.length}</div>
        </div>
        <div className="rounded border border-neutral-800 bg-neutral-900 p-4">
          <div className="text-neutral-400 text-sm">בדיקות</div>
          <div className="text-4xl font-bold mt-2">{data.codeQuality.metrics.tests}</div>
          <div className="text-neutral-400 text-sm mt-2">קבצי מקור: {data.codeQuality.metrics.srcFiles}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded border border-neutral-800 bg-neutral-900 p-4">
          <div className="font-semibold mb-2">חובות טכניים</div>
          {data.technicalDebtItems.length === 0 ? (
            <div className="text-neutral-500">אין פריטים</div>
          ) : (
            <ul className="list-disc mr-5 space-y-1">
              {data.technicalDebtItems.map((t, i) => (
                <li key={i}>
                  <span className="font-medium">[{t.severity}]</span> {t.description}
                  <span className="text-neutral-400"> (≈{t.estimatedEffort} שעות)</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded border border-neutral-800 bg-neutral-900 p-4">
          <div className="font-semibold mb-2">בעיות אדריכליות</div>
          {data.architecturalIssues.length === 0 ? (
            <div className="text-neutral-500">אין בעיות</div>
          ) : (
            <ul className="list-disc mr-5 space-y-1">
              {data.architecturalIssues.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 rounded border border-neutral-800 bg-neutral-900 p-4">
        <div className="font-semibold mb-2">כיסוי בדיקות (הערכה)</div>
        <ul className="list-disc mr-5 space-y-1">
          {Object.entries(data.testCoverageAnalysis).map(([dir, pct]) => (
            <li key={dir}>
              <span className="font-medium">{dir}:</span> {pct}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded border border-neutral-800 bg-neutral-900 p-4">
        <div className="font-semibold mb-2">תלויות מיושנות (משוערות)</div>
        {data.dependencyHealth.outdated.length === 0 ? (
          <div className="text-neutral-500">לא נמצאו</div>
        ) : (
          <ul className="list-disc mr-5 space-y-1">
            {data.dependencyHealth.outdated.map((d) => (
              <li key={d.name}>
                {d.name} — {d.current}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

