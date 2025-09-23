# Recon Notes

## How Jules runs here

- Follow the automation playbook in [AGENTS.md](AGENTS.md) for install/build/test/lint/typecheck details.
- Run `bash scripts/setup.sh` (or `pwsh scripts/setup.ps1`) to reproduce the CI pipeline locally; the script writes reports under `_reports/`.
- GitHub Actions workflow [`ci.yml`](.github/workflows/ci.yml) mirrors the setup steps and must be green before merging.
