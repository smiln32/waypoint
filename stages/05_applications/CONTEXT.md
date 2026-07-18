# Stage 05 — Applications Tracker

One job: track every submitted or in-preparation application — stage, materials, contacts, next actions,
and due dates — so nothing gets lost. This stage does not critique materials or manage pre-application
research (that is stage 03).

## Inputs

| Input | Source | Layer |
|-------|--------|-------|
| Started applications | `stages/03_job_tracking/output/` (or directly from Job Search's "Start application") | 4 (prior stage) |
| Tailored materials status (résumé version, cover letter) | `stages/01_resume/output/`, `stages/04_cover_letter/output/` | 4 |
| Tracker conventions | `stages/05_applications/references/` | 3 (stable) |

## Process

1. Hold each application with its hiring stage (Preparing / Applied / Interview), materials status,
   contact, next action, and due date.
2. Surface the actions due this week; every application always has exactly one next action.
3. When an interview is scheduled, hand the role to stage 06 for practice.

Current app status: "Add application" shows a status message only; the intake form is future work.

## Outputs

| Output | Written to |
|--------|-----------|
| Application records with stage, materials, contacts, next actions, due dates | `stages/05_applications/output/` (currently held in app session state) |

Downstream: stage 06 (`stages/06_interview/`) practices against roles that reach the interview stage here.
