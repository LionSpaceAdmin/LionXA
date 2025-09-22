"use client";
import { useState } from "react";

interface GenResult { [path: string]: string }

export default function VisionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [instructions, setInstructions] = useState<string>("");
  const [result, setResult] = useState<GenResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("instructions", instructions);
      const r = await fetch("/api/tools/generate-component", { method: "POST", body: fd });
      const data = await r.json();
      setResult(data.files || {});
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">Vision — יצירת רכיב מתמונת Mockup</h1>
      <form onSubmit={onSubmit} className="rounded border border-neutral-800 bg-neutral-900 p-4 flex flex-col gap-3">
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <textarea
          className="bg-neutral-800 border border-neutral-700 rounded p-2"
          placeholder="הוראות עיצוב/התנהגות (אופציונלי)"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
        <button disabled={loading || !file} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded px-3 py-1.5 w-fit">
          {loading ? "יוצר..." : "צור רכיב"}
        </button>
      </form>

      {result && (
        <div className="mt-6 space-y-4">
          {Object.entries(result).map(([p, code]) => (
            <div key={p} className="rounded border border-neutral-800 bg-neutral-900">
              <div className="px-4 py-2 border-b border-neutral-800 text-sm text-neutral-300">{p}</div>
              <pre className="p-4 overflow-x-auto text-xs"><code>{code}</code></pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

