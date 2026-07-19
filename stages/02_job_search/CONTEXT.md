# Stage 02 — Job Search

One job: search federal openings and save selected roles into Job Tracking. This stage does not critique
materials, evaluate fit, or track application progress.

## Inputs

| Input | Source | Layer |
|-------|--------|-------|
| Search criteria: keyword, location, date posted, work schedule, minimum salary, and radius | Entered in the app's Job Search (`/search`) | per-run |
| Shared opportunity identity and field semantics | `_config/shared/opportunity-record.md` | shared |

## Process

1. Search live USAJOBS federal openings by keyword and location, with optional date posted, work schedule,
   minimum salary, and radius filters.
2. Review the returned listing details and open the official USAJOBS posting when its URL is available.
3. Saving a posting creates one stable Waypoint opportunity ID and retains the posting source ID; the same posting cannot be saved twice, while distinct postings with the same title remain independent.
4. A saved opportunity is handed to stage 03; Start Application preserves its ID and transfers status ownership to stage 05.

Current app status: connects to the USAJOBS API (federal listings, veterans' preference) when
credentials are configured; otherwise shows clearly-labeled sample roles.

## Outputs

| Output | Written to |
|--------|-----------|
| Selected roles saved for Job Tracking | `stages/02_job_search/output/runtime/saved-roles.json` (materialized by the app on every change; dev best-effort) |

Downstream: stage 03 (`stages/03_job_tracking/`) reads saved roles from this stage's output.
