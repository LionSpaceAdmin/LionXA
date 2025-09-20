#!/usr/bin/env node
/**
 * generate_xagent_flow_diagram.js
 * 
 * Creates a simple, clear flow diagram showing how XAgent actually works
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.resolve(__dirname);
const OUT_FILE = path.join(OUT_DIR, 'xagent_flow_diagram.html');

function generateFlowDiagram() {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XAgent - דיאגרמת זרימה</title>
    <style>
        body {
            margin: 0;
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #0a0e17 0%, #1a1f2e 100%);
            color: #e2e8f0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 20px;
            text-align: center;
        }
        
        .header h1 {
            margin: 0;
            font-size: 32px;
            background: linear-gradient(135deg, #3b82f6, #10b981);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .subtitle {
            color: #94a3b8;
            margin: 8px 0 0;
            font-size: 18px;
        }
        
        .container {
            flex: 1;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .diagram-container {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 30px;
            margin: 20px 0;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .description {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        
        .description h3 {
            margin: 0 0 10px;
            color: #3b82f6;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #10b981;
            margin: 0;
        }
        
        .stat-label {
            color: #94a3b8;
            font-size: 14px;
            margin: 8px 0 0;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
</head>
<body>
    <div class="header">
        <h1>🤖 XAgent - זרימת עבודה</h1>
        <div class="subtitle">איך המערכת עובדת במציאות</div>
    </div>

    <div class="container">
        <div class="description">
            <h3>איך XAgent עובד?</h3>
            <p>המערכת פועלת ברצף אוטומטי: מזהה ציוצים רלוונטיים → מנתחת אותם → יוצרת תגובה מותאמת → מפרסמת בתזמון אנושי</p>
        </div>

        <div class="diagram-container">
            <div id="flowchart"></div>
            <script type="text/plain" id="mermaid-code">
flowchart TD
    A[🔍 ניטור רשימת חשבונות<br/>מטרה ב-X.com] --> B{ציוץ חדש<br/>נמצא?}
    
    B -->|לא| A
    B -->|כן| C[📖 קריאת תוכן הציוץ<br/>והקשר]
    
    C --> D{האם הציוץ<br/>רלוונטי?}
    
    D -->|לא רלוונטי| A
    D -->|רלוונטי| E[🌐 פתיחת דפדפן<br/>אוטומטית]
    
    E --> F[📋 איסוף פרופיל<br/>ומידע על המפרסם]
    
    F --> G[🤖 שליחה ל-OpenAI<br/>לניתוח וכתיבה]
    
    G --> H[✍️ יצירת תגובה<br/>מותאמת ומחודדת]
    
    H --> I[🛡️ בדיקות בטיחות<br/>ומשפט]
    
    I -->|נדחה| A
    I -->|אושר| J[⏱️ המתנה אקראית<br/>2-8 דקות]
    
    J --> K[📤 פרסום התגובה<br/>ב-X.com]
    
    K --> L[💾 שמירת פרטי הסשן<br/>במערכת הזיכרון]
    
    L --> A

    classDef startNode fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    classDef aiNode fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff
    classDef safetyNode fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
    classDef successNode fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#fff
    classDef decisionNode fill:#6b7280,stroke:#4b5563,stroke-width:2px,color:#fff

    class A startNode
    class G,H aiNode
    class I safetyNode
    class K,L successNode
    class B,D decisionNode
            </script>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">🔄</div>
                <div class="stat-label">תהליך אוטומטי<br/>24/7</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">2-8</div>
                <div class="stat-label">דקות המתנה<br/>בין תגובות</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">🛡️</div>
                <div class="stat-label">בדיקות בטיחות<br/>אוטומטיות</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">🤖</div>
                <div class="stat-label">AI מתקדם<br/>לכתיבה</div>
            </div>
        </div>

        <div class="description">
            <h3>נקודות מפתח בתהליך:</h3>
            <p>
                🎯 <strong>רלוונטיות:</strong> המערכת בודקת שהציוץ מתאים למטרות<br/>
                🧠 <strong>הקשר:</strong> מנתחת את הפרופיל והרקע של המפרסם<br/>
                ⚡ <strong>מהירות:</strong> מגיבה תוך דקות מפרסום הציוץ<br/>
                🎭 <strong>אנושיות:</strong> תזמון אקראי כדי להיראות טבעי
            </p>
        </div>
    </div>

    <script>
        mermaid.initialize({ 
            startOnLoad: false, 
            theme: 'dark',
            securityLevel: 'loose',
            flowchart: {
                curve: 'basis',
                padding: 20
            }
        });

        function renderDiagram() {
            const code = document.getElementById('mermaid-code').textContent;
            const container = document.getElementById('flowchart');
            
            mermaid.render('flowchart-svg', code)
                .then(({svg}) => {
                    container.innerHTML = svg;
                })
                .catch((error) => {
                    container.innerHTML = '<div style="color: #f87171; text-align: center; padding: 40px;">שגיאה בטעינת הדיאגרמה</div>';
                    console.error('Mermaid error:', error);
                });
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', renderDiagram);
        } else {
            renderDiagram();
        }
    </script>
</body>
</html>`;
}

function main() {
  const html = generateFlowDiagram();
  fs.writeFileSync(OUT_FILE, html, 'utf8');
  console.log(`✅ נוצרה דיאגרמת זרימה: ${OUT_FILE}`);
  console.log(`🔄 הדיאגרמה מציגה את התהליך המלא של XAgent`);
}

if (require.main === module) {
  main();
}