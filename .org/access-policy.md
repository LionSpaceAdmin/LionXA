# Google Jules Access Policy

This document tracks who can manage the Google Jules GitHub App and what limits apply for the LionXA organization.

## App Authorization
- **App**: Google Jules GitHub App
- **Installation scope**: `danielions/LionXA` (additional repos require owner approval)
- **Least privilege**: grant only `repo`, `workflow`, and `pull_request` scopes needed for PR automation.

## Owners & Escalation
| Role | Handle / Contact | Responsibilities |
| --- | --- | --- |
| Primary Maintainer | @danielions | Approves repo access changes, reviews Jules PRs, rotates secrets |
| Org Admin | @LionSpaceAdmin | Manages organization-level app installation, branch protections, concurrency caps |
| Backup Maintainer | <assign> | Review + approve during primary PTO; keep parity with automation scripts |

Escalation flow: open an internal ticket or ping the owners in Slack `#lionxa-ops`; for outages use PagerDuty “Automation Agents” service.

## Plan & Limits
- **Plan**: Google Jules Cloud (baseline). Update this section if upgraded.
- **Daily task quota**: 50 tasks/day (default). Track usage in Google Jules admin console.
- **Concurrent VMs**: 2 parallel runs. Increase only after confirming budget + infra capacity.
- **Timeout per task**: 45 minutes. Break large efforts into smaller Jules tasks.

## Change Management
1. Create an issue describing requested access change or limit adjustment.
2. Obtain approval from both primary maintainer and org admin.
3. Document the change (date, reason) in this file under “Change Log”.

## Change Log
- 2025-09-22 — Initial policy drafted for Jules migration readiness (LionSpaceAdmin).
