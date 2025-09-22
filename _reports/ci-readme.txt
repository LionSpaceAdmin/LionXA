CI pipeline: .github/workflows/ci.yml
Node runtime: actions/setup-node with .nvmrc (v22.11.0)
Package manager: pnpm@10.13.1 via Corepack
Matrix jobs: Build | Lint | Format | Typecheck | Test (all run install→clean before pnpm <task>)
Required statuses for main: CI / Build, CI / Lint, CI / Typecheck, CI / Test (Format is informational)
Artifacts: none; rely on Actions logs. Local parity via `bash scripts/setup.sh` or `pwsh scripts/setup.ps1`.
