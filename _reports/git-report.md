# Git State Report

## git status
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	deleted:    TUTORIAL.md
	deleted:    docs/GEMINI.md
	deleted:    docs/audit-2025-09-22.md
	modified:   next.config.mjs
	modified:   package.json
	deleted:    project-canvas.html
	modified:   src/app/page.tsx

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	GEMINI.md
	TASK_TEMPLATE.md
	_reports/
	architecture_analysis_report.json
	docs/myproxy.html
	docs/project-canvas.html
	docs/project_architecture_map.html
	docs/screenshots/
	fix_and_enhance_report.json
	p1_investigation_report.json
	p3_rebuild_report.json
	project_map.json
	scripts/diagnostics/

no changes added to commit (use "git add" and/or "git commit -a")

## git branch -v
* main 0bda2b7 repo: commit project changes (excluding large terraform providers > 100MB)

## git remote -v
origin	https://github.com/LionSpaceAdmin/LionXA.git (fetch)
origin	https://github.com/LionSpaceAdmin/LionXA.git (push)

## git log --oneline -n 10
0bda2b7 repo: commit project changes (excluding large terraform providers > 100MB)
5d80614 audit: add full activity audit (docs/audit-2025-09-22.md)
d269f80 chore(jules): tune setup for Jules VM per docs (CI=1, skip Playwright download, approve builds, non-blocking lint)
7180691 chore(jules): make setup script docker-aware (sudo fallback + skip), add CI-safe Next build
9c19bbb chore: finalize repo for external studio review
beb3dd0 עדכון קונפיגורציה ופרופילים
27035e3 feat: Integrate Steel Browser API and enhance browser service functionality
b35df88 refactor: Organize repository structure and clean up root directory
92fe83c chore: Clean up repository before Steel Browser installation
3bcb190 Merge pull request #4 from LionSpaceAdmin/lests

## Untracked Files
GEMINI.md
TASK_TEMPLATE.md
_reports/config-report.json
_reports/deps-graph.json
_reports/file_scan.txt
_reports/generate_deps.py
_reports/generate_scripts_report.py
_reports/git-report.md
_reports/inventory.json
_reports/parse_configs.py
_reports/sbom.json
_reports/scripts-report.json
architecture_analysis_report.json
docs/myproxy.html
docs/project-canvas.html
docs/project_architecture_map.html
docs/screenshots/canvas-2025-09-22T18-38-58-035Z.png
docs/screenshots/canvas-2025-09-22T18-41-03-687Z.png
docs/screenshots/canvas-2025-09-22T18-49-05-482Z.png
docs/screenshots/health-2025-09-22T18-38-58-035Z.png
docs/screenshots/health-2025-09-22T18-41-03-687Z.png
docs/screenshots/health-2025-09-22T18-49-05-482Z.png
fix_and_enhance_report.json
p1_investigation_report.json
p3_rebuild_report.json
project_map.json
scripts/diagnostics/snapshot-canvas.cjs
