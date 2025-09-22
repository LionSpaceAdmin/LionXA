#!/usr/bin/env pwsh
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$root = Resolve-Path (Join-Path $scriptDir "..")
$reportDir = Join-Path $root "_reports"
$summaryPath = Join-Path $reportDir "setup-summary.txt"
$pnpmVersion = "10.13.1"
try {
  $nodeTarget = (Get-Content (Join-Path $root ".nvmrc") -ErrorAction Stop | Select-Object -First 1).Trim()
} catch {
  $nodeTarget = "unknown"
}

New-Item -ItemType Directory -Force -Path $reportDir | Out-Null

$summaryLines = New-Object System.Collections.Generic.List[string]

function Write-Summary {
  param()
  $nodeRuntime = "unavailable"
  try { $nodeRuntime = (& node -v) } catch {}
  $pnpmRuntime = "unavailable"
  try { $pnpmRuntime = (& pnpm -v) } catch {}
  $content = @(
    "# Setup Summary",
    "Generated: {0}" -f (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ"),
    "Target Node (from .nvmrc): $nodeTarget",
    "Detected node -v: $nodeRuntime",
    "Detected pnpm -v: $pnpmRuntime",
    ""
  ) + ($summaryLines | ForEach-Object { "- $_" })
  $content | Set-Content -Path $summaryPath -Encoding UTF8
}

function Invoke-Step {
  param(
    [string]$Name,
    [ScriptBlock]$Action
  )

  Write-Host ""
  Write-Host "[setup] $Name"
  try {
    & $Action
    $summaryLines.Add("✔ $Name")
  } catch {
    $summaryLines.Add("✘ $Name ($($_.Exception.Message))")
    Write-Summary
    throw
  }
}

Invoke-Step "Enable Corepack" {
  try {
    corepack enable | Out-Null
  } catch {
    if (-not $_.Exception.Message.Contains('EEXIST')) {
      throw
    }
  }
}
Invoke-Step "Activate pnpm@$pnpmVersion" { corepack prepare pnpm@$pnpmVersion --activate | Out-Null }
Invoke-Step "Install dependencies" { pnpm install --frozen-lockfile }
Invoke-Step "Clean workspace" { pnpm clean }
Invoke-Step "Build project" { pnpm build }
Invoke-Step "Lint source" { pnpm lint }
Invoke-Step "Typecheck" { pnpm typecheck }
Invoke-Step "Run unit tests" { pnpm test }

Write-Summary

Write-Host ""
Write-Host "[setup] Success. Summary written to $summaryPath"
