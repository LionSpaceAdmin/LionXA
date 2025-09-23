import json

research_data = {
  "groups": [
    {"id": "g1", "title": "Code"},
    {"id": "g2", "title": "Config"},
    {"id": "g3", "title": "Runtime"}
  ],
  "components": [
    {"id": "c1", "group": "g1", "title": "src/app/page.tsx", "tag": "UI Entrypoint", "coords": {"x": 100, "y": 200}},
    {"id": "c2", "group": "g1", "title": "src/agent.ts", "tag": "Agent Logic", "coords": {"x": 300, "y": 200}},
    {"id": "c3", "group": "g1", "title": "src/dashboard.ts", "tag": "Dashboard Backend", "coords": {"x": 500, "y": 200}},
    {"id": "c4", "group": "g1", "title": "services/mcp-gateway/index.js", "tag": "MCP Gateway", "coords": {"x": 700, "y": 200}},
    {"id": "c5", "group": "g3", "title": "infra/terraform/main.tf", "tag": "Infrastructure", "coords": {"x": 900, "y": 200}},
    {"id": "c6", "group": "g2", "title": "docker-compose.yml", "tag": "Local Runtime", "coords": {"x": 300, "y": 400}},
    {"id": "c7", "group": "g2", "title": ".env.example", "tag": "Environment Config", "coords": {"x": 500, "y": 400}}
  ],
  "connections": [
    {"source": "c1", "target": "c3"},
    {"source": "c3", "target": "c2"},
    {"source": "c2", "target": "c4"},
    {"source": "c4", "target": "c5"},
    {"source": "c6", "target": "c1"},
    {"source": "c6", "target": "c2"},
    {"source": "c6", "target": "c4"},
    {"source": "c7", "target": "c2"},
    {"source": "c7", "target": "c3"},
    {"source": "c7", "target": "c4"}
  ],
  "flowSteps": [
    {"element": "c1", "note": "User interacts with the UI"},
    {"element": "c3", "note": "Dashboard backend handles UI events"},
    {"element": "c2", "note": "Agent logic is triggered"},
    {"element": "c4", "note": "Agent communicates through MCP Gateway"},
    {"element": "c5", "note": "Infrastructure is managed by Terraform"}
  ]
}

with open('/Users/danielions/LionXA/_reports/research-data.json', 'w') as f:
    json.dump(research_data, f, indent=2)
