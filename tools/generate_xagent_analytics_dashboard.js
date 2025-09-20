#!/usr/bin/env node
/**
 * generate_xagent_analytics_dashboard.js
 *
 * Creates a comprehensive analytics dashboard for XAgent showing:
 * - Performance metrics (replies per hour, target analysis)
 * - Response quality indicators
 * - Timeline visualizations 
 * - Target account breakdown
 * - Success patterns
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.resolve(__dirname);
const OUT_FILE = path.join(OUT_DIR, 'xagent_analytics_dashboard.html');

function readJsonSafe(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

function loadData() {
  const handled = readJsonSafe(path.join(ROOT, 'handled_tweets.json'), []);
  const memory = readJsonSafe(path.join(ROOT, 'memory.json'), []);
  const cookies = readJsonSafe(path.join(ROOT, 'cookies.json'), []);
  return { handled, memory, cookies };
}

function analyzeData(handled) {
  const sessions = handled.map(h => ({
    ...h,
    timestamp: new Date(h.timestamp),
    account: h.tweetId.split('-')[0],
    replyLength: h.reply ? h.reply.length : 0,
    hour: new Date(h.timestamp).getHours()
  }));

  // Group by account
  const byAccount = {};
  sessions.forEach(s => {
    if (!byAccount[s.account]) byAccount[s.account] = [];
    byAccount[s.account].push(s);
  });

  // Timeline analysis
  const hourlyData = new Array(24).fill(0);
  sessions.forEach(s => hourlyData[s.hour]++);

  // Response length distribution
  const lengthBuckets = { short: 0, medium: 0, long: 0 };
  sessions.forEach(s => {
    if (s.replyLength < 100) lengthBuckets.short++;
    else if (s.replyLength < 200) lengthBuckets.medium++;
    else lengthBuckets.long++;
  });

  return {
    totalSessions: sessions.length,
    accounts: Object.keys(byAccount),
    byAccount,
    hourlyData,
    lengthBuckets,
    timeSpan: {
      start: Math.min(...sessions.map(s => s.timestamp)),
      end: Math.max(...sessions.map(s => s.timestamp))
    },
    avgReplyLength: Math.round(sessions.reduce((acc, s) => acc + s.replyLength, 0) / sessions.length)
  };
}

function generateDashboard(analysis) {
  const { totalSessions, accounts, byAccount, hourlyData, lengthBuckets, timeSpan, avgReplyLength } = analysis;
  
  const accountStats = accounts.map(acc => ({
    name: acc,
    count: byAccount[acc].length,
    avgLength: Math.round(byAccount[acc].reduce((sum, s) => sum + s.replyLength, 0) / byAccount[acc].length),
    lastReply: Math.max(...byAccount[acc].map(s => s.timestamp))
  })).sort((a, b) => b.count - a.count);

  const maxHourly = Math.max(...hourlyData);
  
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XAgent Analytics Dashboard | דשבורד אנליטיקה</title>
    <style>
        :root {
            --bg: #0a0e17;
            --panel: #12161f;
            --card: #1a1f2e;
            --text: #e2e8f0;
            --muted: #94a3b8;
            --accent: #3b82f6;
            --success: #10b981;
            --warning: #f59e0b;
            --border: #334155;
        }
        
        * { box-sizing: border-box; }
        
        body {
            margin: 0;
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, var(--bg) 0%, #0f172a 100%);
            color: var(--text);
            min-height: 100vh;
        }
        
        .header {
            background: var(--panel);
            border-bottom: 1px solid var(--border);
            padding: 20px;
            text-align: center;
        }
        
        .header h1 {
            margin: 0;
            font-size: 28px;
            background: linear-gradient(135deg, var(--accent), var(--success));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .subtitle {
            color: var(--muted);
            margin: 8px 0 0;
            font-size: 16px;
        }
        
        .dashboard {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }
        
        .card-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 16px;
            color: var(--accent);
        }
        
        .stat-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }
        
        .stat {
            text-align: center;
            padding: 16px;
            background: var(--panel);
            border-radius: 8px;
            border: 1px solid var(--border);
        }
        
        .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: var(--success);
            margin: 0;
        }
        
        .stat-label {
            color: var(--muted);
            font-size: 14px;
            margin: 4px 0 0;
        }
        
        .chart-container {
            margin: 16px 0;
            position: relative;
        }
        
        .bar-chart {
            display: flex;
            align-items: end;
            justify-content: space-between;
            height: 120px;
            gap: 2px;
        }
        
        .bar {
            background: linear-gradient(to top, var(--accent), var(--success));
            border-radius: 2px 2px 0 0;
            min-width: 8px;
            position: relative;
            transition: all 0.3s ease;
        }
        
        .bar:hover {
            filter: brightness(1.2);
        }
        
        .bar-label {
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: var(--muted);
        }
        
        .account-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .account-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            margin: 8px 0;
            background: var(--panel);
            border-radius: 8px;
            border: 1px solid var(--border);
            transition: all 0.2s ease;
        }
        
        .account-item:hover {
            border-color: var(--accent);
        }
        
        .account-name {
            font-weight: 500;
            color: var(--text);
            direction: ltr;
            text-align: left;
        }
        
        .account-stats {
            display: flex;
            gap: 16px;
            align-items: center;
        }
        
        .badge {
            background: var(--accent);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .timeline-info {
            color: var(--muted);
            font-size: 14px;
            text-align: center;
            margin-top: 16px;
        }
        
        .pie-chart {
            width: 120px;
            height: 120px;
            margin: 16px auto;
            position: relative;
        }
        
        .wide-card {
            grid-column: 1 / -1;
        }
        
        .flow-diagram {
            background: var(--panel);
            border-radius: 12px;
            padding: 20px;
            margin: 16px 0;
            overflow-x: auto;
        }
        
        .flow-step {
            display: inline-block;
            background: linear-gradient(135deg, var(--accent), var(--success));
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 0 8px;
            font-weight: 500;
            position: relative;
            min-width: 120px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .flow-step::after {
            content: '←';
            position: absolute;
            right: -20px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--accent);
            font-size: 20px;
            font-weight: bold;
        }
        
        .flow-step:last-child::after {
            display: none;
        }
        
        .flow-step.success {
            background: linear-gradient(135deg, var(--success), #059669);
        }
        
        .flow-step.warning {
            background: linear-gradient(135deg, var(--warning), #d97706);
        }
        
        .flow-step.ai {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }
        
        .network-diagram {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 200px;
            margin: 20px 0;
            position: relative;
        }
        
        .central-node {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, var(--accent), var(--success));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            text-align: center;
            position: relative;
            z-index: 2;
        }
        
        .target-node {
            width: 60px;
            height: 60px;
            background: var(--card);
            border: 2px solid var(--accent);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text);
            font-size: 10px;
            font-weight: 500;
            position: absolute;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .target-node:hover {
            transform: scale(1.1);
            border-color: var(--success);
        }
        
        .connection-line {
            position: absolute;
            height: 2px;
            background: linear-gradient(90deg, var(--accent), transparent);
            z-index: 1;
        }
        
        .timeline-graph {
            height: 100px;
            background: var(--panel);
            border-radius: 8px;
            position: relative;
            margin: 16px 0;
            overflow: hidden;
        }
        
        .timeline-point {
            position: absolute;
            width: 8px;
            height: 8px;
            background: var(--success);
            border-radius: 50%;
            bottom: 20px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.2); }
        }
        
        @media (max-width: 768px) {
            .dashboard {
                grid-template-columns: 1fr;
            }
            .stat-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 XAgent Analytics Dashboard</h1>
        <div class="subtitle">דשבורד ביצועים ואנליטיקה מתקדמת</div>
    </div>

    <div class="dashboard">
        <!-- Overview Stats -->
        <div class="card">
            <h2 class="card-title">📊 סטטיסטיקות כלליות</h2>
            <div class="stat-grid">
                <div class="stat">
                    <div class="stat-value">${totalSessions}</div>
                    <div class="stat-label">סה"כ תגובות</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${accounts.length}</div>
                    <div class="stat-label">חשבונות ממוקדים</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${avgReplyLength}</div>
                    <div class="stat-label">אורך תגובה ממוצע</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${Math.round((totalSessions / Math.max(1, (timeSpan.end - timeSpan.start) / (1000 * 60 * 60))) * 10) / 10}</div>
                    <div class="stat-label">תגובות לשעה</div>
                </div>
            </div>
        </div>

        <!-- Hourly Activity -->
        <div class="card">
            <h2 class="card-title">⏰ פעילות לפי שעות</h2>
            <div class="chart-container">
                <div class="bar-chart">
                    ${hourlyData.map((count, hour) => `
                        <div class="bar" style="height: ${(count / maxHourly) * 100}%" title="${count} תגובות בשעה ${hour}:00">
                            <div class="bar-label">${hour}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="timeline-info">
                שעות שיא: ${hourlyData.indexOf(maxHourly)}:00 (${maxHourly} תגובות)
            </div>
        </div>

        <!-- Top Accounts -->
        <div class="card">
            <h2 class="card-title">🎯 חשבונות מובילים</h2>
            <ul class="account-list">
                ${accountStats.slice(0, 8).map(acc => `
                    <li class="account-item">
                        <div class="account-name">@${acc.name}</div>
                        <div class="account-stats">
                            <span class="badge">${acc.count}</span>
                            <span style="color: var(--muted); font-size: 12px;">${acc.avgLength} תווים</span>
                        </div>
                    </li>
                `).join('')}
            </ul>
        </div>

        <!-- Response Length Distribution -->
        <div class="card">
            <h2 class="card-title">📏 התפלגות אורך תגובות</h2>
            <div class="stat-grid">
                <div class="stat">
                    <div class="stat-value">${lengthBuckets.short}</div>
                    <div class="stat-label">קצרות (&lt;100)</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${lengthBuckets.medium}</div>
                    <div class="stat-label">בינוניות (100-200)</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${lengthBuckets.long}</div>
                    <div class="stat-label">ארוכות (&gt;200)</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${Math.round((lengthBuckets.medium / totalSessions) * 100)}%</div>
                    <div class="stat-label">אחוז אופטימלי</div>
                </div>
            </div>
        </div>

        <!-- XAgent Flow Diagram -->
        <div class="card wide-card">
            <h2 class="card-title">🔄 דיאגרמת תהליך XAgent</h2>
            <div class="flow-diagram">
                <div class="flow-step">🔍 זיהוי ציוץ</div>
                <div class="flow-step">🎯 בדיקת רלוונטיות</div>
                <div class="flow-step">🌐 פתיחת דפדפן</div>
                <div class="flow-step ai">🤖 ניתוח AI</div>
                <div class="flow-step ai">✍️ יצירת תגובה</div>
                <div class="flow-step warning">🛡️ בדיקות בטיחות</div>
                <div class="flow-step">⏱️ תזמון אנושי</div>
                <div class="flow-step success">📤 פרסום</div>
                <div class="flow-step">💾 עדכון זיכרון</div>
            </div>
            <div style="text-align: center; color: var(--muted); margin-top: 16px;">
                התהליך הכולל לוקח בממוצע ${Math.round(((timeSpan.end - timeSpan.start) / totalSessions) / (1000 * 60))} דקות לתגובה
            </div>
        </div>

        <!-- Target Network Diagram -->
        <div class="card wide-card">
            <h2 class="card-title">🕸️ רשת חשבונות ממוקדים</h2>
            <div class="network-diagram">
                <div class="central-node">XAgent<br/>🤖</div>
                ${accountStats.slice(0, 6).map((acc, i) => {
                    const angle = (i * 60) * Math.PI / 180; // 60 degrees apart
                    const radius = 120;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    return `
                        <div class="target-node" style="left: calc(50% + ${x}px); top: calc(50% + ${y}px);" title="${acc.count} תגובות">
                            @${acc.name.slice(0, 8)}
                        </div>
                        <div class="connection-line" style="
                            left: 50%; 
                            top: calc(50% + ${y/2}px); 
                            width: ${Math.abs(x)}px; 
                            transform: rotate(${Math.atan2(y, x) * 180 / Math.PI}deg) translateY(-50%);
                            transform-origin: left center;
                        "></div>
                    `;
                }).join('')}
            </div>
            <div style="text-align: center; color: var(--muted); margin-top: 16px;">
                רשת של ${accounts.length} חשבונות ממוקדים עם ${totalSessions} תגובות מוצלחות
            </div>
        </div>

        <!-- Recent Activity Timeline -->
        <div class="card wide-card">
            <h2 class="card-title">🕒 ציר זמן של פעילות אחרונה</h2>
            
            <!-- Timeline Graph -->
            <div class="timeline-graph">
                ${analysis.byAccount[accountStats[0]?.name]?.slice(-10).map((session, i) => {
                    const position = (i / 9) * 90 + 5; // Spread across 90% of width
                    return `<div class="timeline-point" style="left: ${position}%; animation-delay: ${i * 0.2}s;" title="${new Date(session.timestamp).toLocaleString('he-IL')}"></div>`;
                }).join('') || ''}
                <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--accent), transparent);"></div>
            </div>
            
            <div style="background: var(--panel); border-radius: 8px; padding: 16px; margin: 16px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="color: var(--muted);">תחילת פעילות:</span>
                    <span>${new Date(timeSpan.start).toLocaleString('he-IL')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="color: var(--muted);">פעילות אחרונה:</span>
                    <span>${new Date(timeSpan.end).toLocaleString('he-IL')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: var(--muted);">משך זמן כולל:</span>
                    <span>${Math.round((timeSpan.end - timeSpan.start) / (1000 * 60 * 60))} שעות</span>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <h3 style="color: var(--accent); margin-bottom: 12px;">תגובות אחרונות:</h3>
                ${analysis.byAccount[accountStats[0]?.name]?.slice(-3).reverse().map(session => `
                    <div style="background: var(--panel); border-radius: 8px; padding: 12px; margin: 8px 0; border-left: 3px solid var(--success);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: var(--accent); font-weight: 500;">@${session.account}</span>
                            <span style="color: var(--muted); font-size: 12px;">${new Date(session.timestamp).toLocaleString('he-IL')}</span>
                        </div>
                        <div style="color: var(--muted); font-size: 14px; line-height: 1.4;">
                            "${session.reply.slice(0, 120)}${session.reply.length > 120 ? '...' : ''}"
                        </div>
                        <div style="margin-top: 8px; color: var(--muted); font-size: 12px;">
                            ${session.replyLength} תווים
                        </div>
                    </div>
                `).join('') || '<div style="color: var(--muted); text-align: center; padding: 20px;">אין נתונים זמינים</div>'}
            </div>
        </div>
    </div>

    <script>
        // Add some interactivity
        document.addEventListener('DOMContentLoaded', function() {
            // Animate counters
            const counters = document.querySelectorAll('.stat-value');
            counters.forEach(counter => {
                const target = parseInt(counter.textContent);
                let current = 0;
                const increment = target / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        counter.textContent = target;
                        clearInterval(timer);
                    } else {
                        counter.textContent = Math.floor(current);
                    }
                }, 30);
            });

            // Add hover effects to bars
            const bars = document.querySelectorAll('.bar');
            bars.forEach(bar => {
                bar.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.1)';
                });
                bar.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                });
            });
        });
    </script>
</body>
</html>`;
}

function main() {
  const data = loadData();
  const analysis = analyzeData(data.handled);
  const html = generateDashboard(analysis);
  
  fs.writeFileSync(OUT_FILE, html, 'utf8');
  console.log(`✅ נוצר דשבורד אנליטיקה: ${OUT_FILE}`);
  console.log(`📊 ${analysis.totalSessions} סשנים נותחו מ-${analysis.accounts.length} חשבונות`);
  console.log(`🎯 החשבון הפעיל ביותר: @${Object.keys(analysis.byAccount).sort((a, b) => analysis.byAccount[b].length - analysis.byAccount[a].length)[0]} (${Math.max(...Object.values(analysis.byAccount).map(arr => arr.length))} תגובות)`);
}

if (require.main === module) {
  main();
}

module.exports = { analyzeData, generateDashboard };