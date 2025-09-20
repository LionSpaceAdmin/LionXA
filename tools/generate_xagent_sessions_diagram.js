#!/usr/bin/env node
/**
 * generate_xagent_sessions_diagram.js
 *
 * Scans memory.json and handled_tweets.json for successful sessions,
 * correlates tweet IDs and timestamps, and generates a standalone HTML
 * with animated flow diagrams per session using Mermaid.js.
 *
 * Inputs (relative to repo root):
 *  - memory.json (array of strings and/or tweet IDs)
 *  - handled_tweets.json (array of { tweetId, reply, timestamp })
 *  - cookies.json (optional; not parsed for sessions, but exposed in tooltips if needed)
 *  - README.md, upload_xagent_files.sh (optional context references)
 *
 * Output:
 *  - diag/xagent_sessions_diagram.html
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.resolve(__dirname);
const OUT_FILE = path.join(OUT_DIR, 'xagent_sessions_diagram.html');

function readJsonSafe(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

function loadInputs() {
  const memory = readJsonSafe(path.join(ROOT, 'memory.json'), []);
  const handled = readJsonSafe(path.join(ROOT, 'handled_tweets.json'), []);
  const cookies = readJsonSafe(path.join(ROOT, 'cookies.json'), []);
  // xagent_data.json may no longer exist; optional
  const xagentData = readJsonSafe(path.join(ROOT, 'xagent_data.json'), null);
  return { memory, handled, cookies, xagentData };
}

function isLikelyTweetId(s) {
  return typeof s === 'string' && /^\d{8,20}$/.test(s);
}

function normalizeHandled(handled) {
  // handled entries use tweetId like "username-..." not pure numeric; keep as ID string
  return handled.map(h => ({
    tweetId: String(h.tweetId || ''),
    reply: String(h.reply || ''),
    timestamp: h.timestamp || null,
    status: h.status || 'ok'
  }));
}

function extractTweetIdsFromMemory(memory) {
  const ids = new Set();
  for (const entry of memory) {
    if (isLikelyTweetId(entry)) ids.add(entry);
  }
  return ids;
}

function pickSuccessfulSessions(memory, handled) {
  const handledN = normalizeHandled(handled);
  const sessions = [];
  const memIds = extractTweetIdsFromMemory(memory);

  // Build sessions from handled items with status ok (or no status field)
  for (const h of handledN) {
    if (h.status && h.status !== 'ok') continue; // only success
    // correlate: if handled.tweetId is not numeric, still keep; we use handled entry as source of truth
    const sessionId = h.tweetId;
    const startedAt = h.timestamp || null;
    sessions.push({ sessionId, startedAt, handled: h });
  }

  // de-dup by sessionId
  const seen = new Set();
  return sessions.filter(s => {
    if (seen.has(s.sessionId)) return false;
    seen.add(s.sessionId);
    return true;
  });
}

function mermaidForSession(session, index) {
  // Hebraic, RTL-friendly, valid Mermaid graph
  const ts = session.startedAt ? new Date(session.startedAt).toISOString() : '';
  const line = (s) => s + '\n';
  const parts = [];
  parts.push('graph RL');
  parts.push('  classDef ok fill:#093,stroke:#0b4,stroke-width:1.4,color:#fff');
  parts.push('  classDef warn fill:#924,stroke:#b66,stroke-width:1.4,color:#fff');
  parts.push('  classDef step fill:#0f172a,stroke:#334155,stroke-width:1.2,color:#e6f0ff');

  const t = ts ? `\\n${escapeMermaid(ts)}` : '';
  parts.push(`  start["התחלה${t}"]:::step`);
  parts.push(`  detect["זיהוי ציוץ חדש"]:::step`);
  parts.push(`  rel{"רלוונטי?"}:::step`);
  parts.push(`  browser["פתיחת דפדפן"]:::step`);
  parts.push(`  ctx["הקשר/פרופיל/ידע"]:::step`);
  parts.push(`  ai["סיכום / טיוטה AI"]:::step`);
  parts.push(`  safety{"בדיקות בטיחות"}:::step`);
  parts.push(`  delay["תזמון אנושי"]:::step`);
  parts.push(`  publish["פרסום תגובה"]:::ok`);
  parts.push(`  memory["עדכון זיכרון"]:::step`);
  parts.push(`  endNode["סיום"]:::warn`);

  // default successful path
  parts.push('  start --> detect --> rel');
  parts.push('  rel -- לא --> endNode');
  parts.push('  rel -- כן --> browser --> ctx --> ai --> safety');
  parts.push('  safety -- נדחה --> endNode');
  parts.push('  safety -- OK --> delay --> publish --> memory --> endNode');

  return parts.join('\n');
}

function escapeMermaid(s) {
  return String(s || '')
    .replace(/`/g, '\\`')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateHtml(sessions) {
  // Fallback: if no sessions found, render one placeholder session
  const got = sessions && sessions.length ? sessions : [{ sessionId: 'placeholder', startedAt: null }];

  const tabLabel = (s, i) => {
    const id = (s.sessionId || '').slice(0, 24);
    const ts = s.startedAt ? new Date(s.startedAt).toLocaleString('he-IL') : '—';
    return `סשן ${i+1} — ${escapeHtml(id)} — ${ts}`;
  };

  const tabTitle = (s) => {
    const txt = (s && s.handled && s.handled.reply) ? String(s.handled.reply) : '';
    return escapeHtml(txt.length > 160 ? txt.slice(0,157) + '…' : txt);
  };

  const tabs = got.map((s, i) => `
        <button class="tab" role="tab" id="tab-s${i}" aria-controls="panel-s${i}" aria-selected="${i===0}" title="${tabTitle(s)}">${tabLabel(s,i)}</button>`).join('\n');

  const panels = got.map((s, i) => `
      <section id="panel-s${i}" class="session ${i===0?'active':''}" role="tabpanel" aria-labelledby="tab-s${i}">
        <div class="diag-title">מסלול סשן ${i+1}</div>
        <div class="diagram" id="diag-s${i}" aria-label="דיאגרמת סשן ${i+1}"></div>
        <script type="text/plain" data-mermaid id="mer-s${i}">${mermaidForSession(s, i)}</script>
      </section>`).join('\n\n');

  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>XAgent – דיאגרמות סשנים (Mermaid, RTL)</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #0b0d10;
      --panel: #12161b;
      --ink: #dfe7f1;
      --muted: #91a3b0;
      --accent: #3fbdf1;
      --shadow: 0 6px 18px rgba(0,0,0,.35);
    }
    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji"; background: linear-gradient(180deg, #0a0c10 0%, #0e1217 100%); color: var(--ink); }
    header { padding: 18px 22px; border-bottom: 1px solid rgba(255,255,255,.08); background: radial-gradient(1200px 600px at 90% -50%, rgba(63,189,241,.25), transparent 60%), radial-gradient(1000px 500px at 10% -60%, rgba(34,197,94,.18), transparent 55%), var(--panel); position: sticky; top: 0; z-index: 10; box-shadow: var(--shadow); }
    h1 { margin: 0 0 6px; font-size: 20px; }
    p.sub { margin: 0; color: var(--muted); font-size: 14px; }
    .wrap { max-width: 1100px; margin: 18px auto; padding: 0 16px 32px; }
    .panel { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); border-radius: 14px; padding: 16px; box-shadow: var(--shadow); }
    .tabs { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
    .tab { padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,.12); background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02)); color: var(--ink); cursor: pointer; font-size: 13px; }
    .tab[aria-selected="true"] { outline: 2px solid var(--accent); outline-offset: 1px; border-color: var(--accent); }
    .session { display: none; }
    .session.active { display: block; }
    .diagram { width: 100%; overflow: auto; background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 12px; }
    .diag-title { margin: 8px 2px 10px; font-weight: 600; color: var(--muted); font-size: 13px; }
    script[data-mermaid] { display: none; }
    .tabs { justify-content: flex-start; }
    .diag-title, .tab { text-align: right; }
    .note { margin-top: 10px; color: var(--muted); font-size: 12px; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
</head>
<body>
  <header>
    <h1>XAgent – דיאגרמות סשנים</h1>
    <p class="sub">Flow charts של סשנים מוצלחים: התחלה → זיהוי ציוץ → סיווג → פתיחת דפדפן → הקשר/פרופיל/ידע → סיכום/טיוטה AI → בדיקות בטיחות → תזמון אנושי → פרסום → עדכון זיכרון.</p>
  </header>
  <div class="wrap">
    <div class="panel">
      <div class="tabs" role="tablist" aria-label="בחירת סשן">
${tabs}
      </div>
${panels}
      <div class="note">הערה: אין קוד Mermaid גולמי על המסך. כל דיאגרמה נבנית מתוך תבנית מוסתרת ומעובדת בזמן טעינת העמוד.</div>
    </div>
  </div>
  <script>
    (function(){
      const tabs = Array.from(document.querySelectorAll('.tab'));
      const sessions = Array.from(document.querySelectorAll('.session'));
      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.setAttribute('aria-selected','false'));
          tab.setAttribute('aria-selected','true');
          const id = tab.getAttribute('aria-controls');
          sessions.forEach(p => p.classList.toggle('active', p.id === id));
        });
      });
    })();

    function renderAllMermaid() {
      if (!window.mermaid) {
        document.querySelectorAll('.diagram').forEach(d => {
          d.innerHTML = '<div style="color:#fbbf24">לא ניתן להציג דיאגרמה (Mermaid לא נטענה). פתח דרך שרת מקומי או בדפדפן אחר.</div>';
        });
        return;
      }
      window.mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose', flowchart: { curve: 'basis' } });
      const blocks = Array.from(document.querySelectorAll('script[data-mermaid]'));
      blocks.forEach((blk) => {
        const code = blk.textContent.trim();
        const targetId = blk.id.replace('mer-', 'diag-');
        const target = document.getElementById(targetId);
        if (!target) return;
        const renderId = 'm-' + Math.random().toString(36).slice(2,9);
        window.mermaid.render(renderId, code)
          .then(({svg, bindFunctions}) => { target.innerHTML = svg; if (typeof bindFunctions === 'function') bindFunctions(target); })
          .catch(() => { target.innerHTML = '<div style="color:#f87171">שגיאה בעיבוד Mermaid</div>'; });
      });
    }
    if (document.readyState === 'complete' || document.readyState === 'interactive') { setTimeout(renderAllMermaid, 0); } else { document.addEventListener('DOMContentLoaded', renderAllMermaid); }
  </script>
</body>
</html>`;
}

function main() {
  const { memory, handled } = loadInputs();
  const sessions = pickSuccessfulSessions(memory, handled);
  const html = generateHtml(sessions);
  fs.writeFileSync(OUT_FILE, html, 'utf8');
  console.log(`Wrote ${OUT_FILE} with ${sessions.length} sessions.`);
}

if (require.main === module) {
  main();
}
