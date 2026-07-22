# Waypoint operating model

Waypoint's user-facing scope is exactly five steps: Resume, Job Search, Job Tracking, Cover Letter, and Interview Practice. React and browser local storage run the app; ICM files define stage responsibilities, editor behavior, and interpretable handoffs. Stage folders are not required to map one-to-one to pages. Imports are parsed locally; explicit AI review sends relevant text to the configured hosted provider.

# Task Routing — Stage Map

Layer 1. Start at `IDENTITY.md` for the workspace map (`CLAUDE.md` holds global identity + agent rules);
open a stage's `CONTEXT.md` for its contract before working in it.

## Stage map

The career transition flows through six stages. Each stage reads the prior stage's `output/` (and shared
config) and writes only to its own `output/`.

| # | Stage | Job (one only) | App page | AI editor |
|---|-------|----------------|----------|-----------|
| 01 | `stages/01_resume/` | Critique the résumé draft into decision-ready findings | `/resume` | yes — `POST /api/critique/resume` |
| 02 | `stages/02_job_search/` | Search live USAJOBS openings and save selected roles into Job Tracking | `/search` | no |
| 03 | `stages/03_job_tracking/` | Hold saved roles until an application starts; generate pre-interview company briefs | `/applications` (merged into the tracker) · briefs at `/brief/<slug>` | yes — `POST /api/brief` |
| 04 | `stages/04_cover_letter/` | Critique the cover letter's employer connection | `/cover-letter` | yes — `POST /api/critique/cover-letter` |
| 05 | `stages/05_applications/` | Own true applications after **Start Application**: stage, materials, contacts, next actions, deadlines | `/applications` (page titled "Job Tracking") | no |
| 06 | `stages/06_interview/` | Critique interview responses against the response rubric | `/interview` | yes — `POST /api/critique/interview` |

Two pages sit outside the stages and own no stage work: Start Here (`/start`) orients a new user with
the five-step path, and Dashboard (`/`) is the router view — next steps, pipeline counts, materials
status, and a due-date calendar, all derived from stage data.

## Shared resources

| Path | What it is |
|------|------------|
| `_config/shared/product-voice.md` | Ground rules every AI editor persona loads: critique-only, no invented facts, civilian-reader test |
| `_config/shared/finding-format.md` | The finding JSON contract `{level, title, quote, why, task}` + interview score scale |
| `_config/shared/opportunity-record.md` | Stable opportunity identity, structured fields, ISO dates, and Stage 03/05 ownership rules |
| `references/product.md` | Brand, audience, design principles, accessibility bar (product description, Layer 3) |

## How the app uses the stages

`lib/icm.server.ts` assembles each AI editor prompt from the stage `CONTEXT.md`, identity, rules, rubric or framework, and examples, plus `_config/shared/product-voice.md` and `_config/shared/finding-format.md`. Successful runs are written to the stage `output/runtime/` as timestamped JSON (development only, best-effort). Editing the declared ICM markdown changes editor behavior without a code change.
