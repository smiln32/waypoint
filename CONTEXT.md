# Task Routing — Stage Map

Layer 1. Start at `CLAUDE.md` for identity; open a stage's `CONTEXT.md` for its contract before working in it.

## Stage map

The career transition flows through six stages. Each stage reads the prior stage's `output/` (and shared
config) and writes only to its own `output/`.

| # | Stage | Job (one only) | App page | AI editor |
|---|-------|----------------|----------|-----------|
| 01 | `stages/01_resume/` | Critique the résumé draft into decision-ready findings | `/resume` | yes — `POST /api/critique/resume` |
| 02 | `stages/02_job_search/` | Find and evaluate roles against verified résumé evidence | `/search` | no |
| 03 | `stages/03_job_tracking/` | Hold saved roles until an application starts | `/applications` (merged into the tracker) | no |
| 04 | `stages/04_cover_letter/` | Critique the cover letter's employer connection | `/cover-letter` | yes — `POST /api/critique/cover-letter` |
| 05 | `stages/05_applications/` | Track saved roles and applications: stage, materials, contacts, next actions, deadlines | `/applications` (page titled "Job Tracking") | no |
| 06 | `stages/06_interview/` | Critique interview responses against the response rubric | `/interview` | yes — `POST /api/critique/interview` |

Two pages sit outside the stages and own no stage work: Start Here (`/start`) orients a new user with
the five-step path, and Dashboard (`/`) is the router view — next steps, pipeline counts, materials
status, and a due-date calendar, all derived from stage data.

## Shared resources

| Path | What it is |
|------|------------|
| `_config/shared/product-voice.md` | Ground rules every AI editor persona loads: critique-only, no invented facts, civilian-reader test |
| `_config/shared/finding-format.md` | The finding JSON contract `{level, title, quote, why, task}` + interview score scale |
| `PRODUCT.md` | Brand, audience, design principles, accessibility bar |

## How the app uses the stages

`lib/icm.server.ts` assembles each AI editor's system prompt from the stage's `references/` in layer order
(identity → rules → rubric/framework → examples) plus `_config/shared/product-voice.md`, then calls Claude.
Successful runs are written to the stage's `output/` as timestamped JSON (dev only, best-effort). Edit the
markdown in `references/` to change an editor's behavior — no code change required.
