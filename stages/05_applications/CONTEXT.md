# Stage 05 — Applications Tracker

One job: own and track true applications after the user clicks Start Application — stage, materials, contacts, next actions, and due
dates — so nothing gets lost. This stage does not critique materials.

App surface: `/applications`, titled **Job Tracking** (it also displays stage 03's saved roles as
Saved rows). Each next action links to the workspace where that step happens.

## Inputs

| Input | Source | Layer |
|-------|--------|-------|
| Started applications | `stages/03_job_tracking/output/runtime/tracked-roles.json` (roles leave it when they become applications) | 4 (prior stage) |
| Tailored materials status (résumé version, cover letter) | `stages/01_resume/output/runtime/`, `stages/04_cover_letter/output/runtime/` | 4 |
| Tracker conventions | `stages/05_applications/references/` | 3 (stable) |
| Shared opportunity identity, ISO dates, contacts, and next actions | `_config/shared/opportunity-record.md` | shared |

## Process

1. Hold each canonical opportunity record with its permanent ID, hiring status (Application Started / Applied / Screening / Interview / Offer / Closed), structured materials,
   contact, next action, and due date.
2. Surface the actions due this week; every application always has exactly one next action.
3. When an interview is scheduled, hand the role to stage 06 for practice.

Current app status: "Add Position" opens a real intake form (role, company, status, contact, next
action kind, due date) that creates a versioned canonical opportunity record.

## Outputs

| Output | Written to |
|--------|-----------|
| Application records with stage, materials, contacts, next actions, due dates | `stages/05_applications/output/runtime/applications.json` (materialized by the app on every change; dev best-effort) |

Downstream: stage 06 (`stages/06_interview/`) practices against roles that reach the interview stage here.
