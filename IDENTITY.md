# Waypoint — Workspace Map (ICM Layer 0)

**Where am I?** The Waypoint workspace. It helps recently separated enlisted U.S. Marines and other
veterans translate verified military experience into civilian technical and operational careers. Editors
critique; they never rewrite. Every recommendation shows its reasoning, and the veteran owns every fact
and revision.

This workspace follows the **Interpretable Context Methodology** (ICM — Van Clief & McDermott,
arXiv:2603.16021). Folder structure *is* the agent architecture.

## Two coexisting layers

- **Knowledge layer (ICM)** — `stages/`, `_config/shared/`, `references/`. Plain markdown/JSON only,
  human-editable, git-diffable. Defines editor behavior, stage responsibilities, and interpretable handoffs.
- **Execution layer (Next.js app)** — `app/`, `components/`, `lib/`, `styles/` (plus `public/`, `types/`,
  `tests/`, and build config). The app *reads* `stages/*/references/` to assemble AI editor prompts at
  request time and *writes* critique runs to `stages/*/output/runtime/`. Stages never contain executable code.

## The five ICM layers

| Layer | Location | Job — "the question it answers" |
|-------|----------|---------------------------------|
| **0 Identity** | `IDENTITY.md` (this file), `CLAUDE.md` | Where am I? Workspace map + global agent rules |
| **1 Context** | `CONTEXT.md` | Where do I go? Routes tasks to stages (the stage map) |
| **2 Stage** | `stages/0N_<name>/CONTEXT.md` | One stage's Inputs / Process / Outputs contract |
| **3 Config & References** | `_config/shared/`, `references/`, `stages/*/references/` | Operating rules + stable descriptive material |
| **4 Output** | `stages/*/output/` | Per-run working artifacts (safe to edit or delete) |

Layer 3 splits by **purpose**: `_config/` holds operating **rules** (how to build — voice, finding format,
conventions, glossary); `references/` holds descriptive material (what you're working with — the product
description, personas, rubrics).

## The workspace at a glance

```
IDENTITY.md                 Layer 0 — this map
CLAUDE.md                   Layer 0 — global identity + agent/harness entry
CONTEXT.md                  Layer 1 — task routing: stage map + shared resources
references/
  product.md                Layer 3 — product description (brand, audience, a11y bar)
_config/shared/
  product-voice.md          Layer 3 — editor ground rules (critique-only, no invented facts)
  finding-format.md         Layer 3 — finding JSON contract {level,title,quote,why,task}
  opportunity-record.md     Layer 3 — opportunity identity + Stage 03/05 ownership rules
stages/
  01_resume/                Layer 2 — critique the résumé draft
  02_job_search/            Layer 2 — search USAJOBS, save selected roles
  03_job_tracking/          Layer 2 — hold saved roles; generate company briefs
  04_cover_letter/          Layer 2 — critique the cover letter's employer connection
  05_applications/          Layer 2 — own true applications after Start Application
  06_interview/             Layer 2 — critique interview responses vs. the rubric
    CONTEXT.md              Layer 2 — stage contract (Inputs / Process / Outputs)
    references/             Layer 3 — persona: identity, rules, framework/rubric, examples
    output/runtime/         Layer 4 — timestamped critique runs (dev-only, git-ignored)
```

## Where to go next

Open `CONTEXT.md` for the stage map and routing. Before working inside a stage, open that stage's
`CONTEXT.md` for its contract.

> `CLAUDE.md` remains the agent/harness entry point (auto-loaded project instructions); this file is the
> human-and-agent ICM map.
