# Stage 02 — Job Search

One job: find roles and evaluate their fit against verified résumé evidence. This stage does not critique
materials or track application progress.

## Inputs

| Input | Source | Layer |
|-------|--------|-------|
| Verified résumé evidence (latest critique run) | `stages/01_resume/output/` | 4 (prior stage) |
| Search criteria: keywords, location, filters | Entered in the app's Job Search (`/search`) | per-run |
| Fit-evidence conventions | `stages/02_job_search/references/` | 3 (stable) |

## Process

1. Search available roles by keyword, location, date, workplace, experience, employment type, minimum pay,
   and quick-apply filters.
2. Score each role's fit as evidence, not a verdict: which verified skills align, and which qualification
   gap needs attention before applying.
3. Saving a role hands it to stage 03; "Start application" hands it directly to stage 05.

Current app status: connects to the USAJOBS API (federal listings, veterans' preference) when
credentials are configured; otherwise shows clearly-labeled sample roles.

## Outputs

| Output | Written to |
|--------|-----------|
| Saved roles with fit score, evidence tags, and qualification gap | `stages/02_job_search/output/saved-roles.json` (materialized by the app on every change; dev best-effort) |

Downstream: stage 03 (`stages/03_job_tracking/`) reads saved roles from this stage's output.
