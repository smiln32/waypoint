# Stage 03 — Job Tracking (saved roles)

One job: hold roles saved from Job Search until an application starts. This stage does not search for
new roles and does not track submitted applications (that is stage 05).

App surface: merged into stage 05's tracker page (`/applications`, titled "Job Tracking") — saved
roles appear there as rows with stage **Saved** alongside in-flight applications.

## Inputs

| Input | Source | Layer |
|-------|--------|-------|
| Saved roles with fit evidence | `stages/02_job_search/output/` | 4 (prior stage) |
| Pipeline conventions | `stages/03_job_tracking/references/conventions.md` | 3 (stable) |
| Company brief writer's contract | `stages/03_job_tracking/references/brief-guide.md` | 3 (stable) |
| Candidate resume text (for the brief's fit section) | persisted resume document | 4 |

## Process

1. Hold each saved role with its fit score, evidence tags, and the qualification to address.
2. The veteran advances a role's status as research completes: Saved → Researching → Ready to apply.
3. "Start application" promotes the role out of this pipeline into stage 05's tracker.
4. "Prepare for this role" routes to stage 06 for interview practice against the role's gap.

## Outputs

| Output | Written to |
|--------|-----------|
| Roles promoted to started applications | `stages/03_job_tracking/output/` (currently held in app session state; handed to stage 05) |
| AI-generated company briefs (`POST /api/brief`, prompt assembled from `brief-guide.md` + shared voice) | `stages/03_job_tracking/output/<slug>-brief.json`, viewed at `/brief/<slug>` |

Downstream: stage 05 (`stages/05_applications/`) receives started applications; stage 04 targets its cover
letter at the role being readied here.
