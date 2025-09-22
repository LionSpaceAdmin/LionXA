"use client";
import { useState } from "react";

export default function ToolsPage() {
  const [featureDesc, setFeatureDesc] = useState("");
  const [gen, setGen] = useState<Record<string, string> | null>(null);

  const [issueTitle, setIssueTitle] = useState("");
  const [issueBody, setIssueBody] = useState("");
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  const [pipelineYaml, setPipelineYaml] = useState<string | null>(null);

  async function generateFeature(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/tools/generate-feature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featureDescription: featureDesc }),
    });
    const d = await r.json();
    setGen(d.files || {});
  }

  async function createGithubIssue() {
    const r = await fetch("/api/tools/create-github-issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: issueTitle, body: issueBody, labels: ["auto"] }),
    });
    const d = await r.json();
    setExportUrl(d.url);
  }

  async function createJiraTicket() {
    const r = await fetch("/api/tools/create-jira-ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary: issueTitle, description: issueBody, issueType: "Task" }),
    });
    const d = await r.json();
    setExportUrl(d.url);
  }

  async function generateCi() {
    const r = await fetch("/api/tools/generate-cicd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: "github_actions" }),
    });
    const d = await r.json();
    setPipelineYaml(d.yaml);
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">כלי אוטומציה</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={generateFeature} className="rounded border border-neutral-800 bg-neutral-900 p-4 flex flex-col gap-3">
          <div className="font-semibold">Generate Feature Module</div>
          <textarea className="bg-neutral-800 border border-neutral-700 rounded p-2" value={featureDesc} onChange={(e) => setFeatureDesc(e.target.value)} placeholder="תיאור פיצ׳ר: דף פרופיל משתמש + מודל עריכה" />
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1.5 w-fit">צור</button>
        </form>

        <div className="rounded border border-neutral-800 bg-neutral-900 p-4 flex flex-col gap-3">
          <div className="font-semibold">Export Task To…</div>
          <input className="bg-neutral-800 border border-neutral-700 rounded p-2" placeholder="כותרת" value={issueTitle} onChange={(e) => setIssueTitle(e.target.value)} />
          <textarea className="bg-neutral-800 border border-neutral-700 rounded p-2" placeholder="תיאור" value={issueBody} onChange={(e) => setIssueBody(e.target.value)} />
          <div className="flex gap-3">
            <button onClick={createGithubIssue} className="bg-neutral-700 hover:bg-neutral-600 rounded px-3 py-1.5">GitHub</button>
            <button onClick={createJiraTicket} className="bg-neutral-700 hover:bg-neutral-600 rounded px-3 py-1.5">Jira</button>
          </div>
          {exportUrl && (
            <div className="text-sm text-neutral-400">
              נוצר: <span className="text-blue-400">{exportUrl}</span>
            </div>
          )}
        </div>
      </div>

      {gen && (
        <div className="mt-6 space-y-4">
          {Object.entries(gen).map(([p, code]) => (
            <div key={p} className="rounded border border-neutral-800 bg-neutral-900">
              <div className="px-4 py-2 border-b border-neutral-800 text-sm text-neutral-300">{p}</div>
              <pre className="p-4 overflow-x-auto text-xs"><code>{code}</code></pre>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">CI/CD Pipeline</div>
          <button onClick={generateCi} className="bg-neutral-700 hover:bg-neutral-600 rounded px-3 py-1.5">Generate GitHub Actions</button>
        </div>
        {pipelineYaml && (
          <pre className="mt-3 p-4 overflow-x-auto text-xs"><code>{pipelineYaml}</code></pre>
        )}
      </div>
    </div>
  );
}
