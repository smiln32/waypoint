# Waypoint — Veteran Career Transition Workspace

Waypoint helps recently separated enlisted U.S. Marines and other veterans translate verified military
experience into civilian technical and operational careers. Editors critique; they never rewrite. Every
recommendation shows its reasoning, and the veteran owns every fact and revision.

This workspace follows the **Interpretable Context Methodology** (ICM — Van Clief & McDermott,
arXiv:2603.16021). See `IDENTITY.md` for the Layer 0 workspace map, then `CONTEXT.md` for the stage map
and routing.

## Structure

Two layers coexist at this root:

- **Knowledge layer (ICM)** — `stages/` and `_config/shared/`. Plain markdown/JSON only, human-editable,
  git-diffable. Each numbered stage owns one job and carries its contract (`CONTEXT.md`), stable reference
  material (`references/`), and per-run working artifacts (`output/`).
- **Execution layer (Next.js app)** — `app/`, `components/`, `lib/`, `styles/`. React and browser local storage run the interactive application. The app *reads*
  `stages/*/references/` to assemble AI editor prompts at request time and *writes* critique runs to
  `stages/*/output/`. ICM files define editor behavior, stage responsibilities, and interpretable handoffs; stages do not need to be separate user-facing pages. Uploaded files are parsed and stored locally. Only text selected by an explicit AI-review action is sent to the configured hosted provider. Stages never contain executable code.

```
IDENTITY.md          Layer 0 — workspace map ("Where am I?")
CLAUDE.md            Layer 0 — global identity + agent/harness entry (this file)
CONTEXT.md           Layer 1 — task routing: stage map + shared resources
references/          Layer 3 — root-level descriptive material (e.g. product.md)
stages/0N_<name>/    Layer 2 — CONTEXT.md stage contract (Inputs / Process / Outputs)
  references/        Layer 3 — stable reference material (editor personas, rules, rubrics)
  output/            Layer 4 — per-run artifacts (critique runs; safe to edit or delete)
_config/shared/      Layer 3 — operating rules shared by more than one stage (voice, finding format)
```

## Hard rules

1. One stage, one job.
2. Stages communicate only through markdown/JSON files — no binaries, no database coupling.
3. Load only the context the current stage needs.
4. Every output is a file a human can open, edit, and save before the next stage runs.
5. Configure once, run repeatedly: personas and rules live in `references/`; runs land in `output/`.
6. Everything is plain text and diffable.

## Working agreements

- Do not remove, rename, reposition, recolor, or rewrite existing app content unless the user explicitly
  requests that exact change. For larger revisions, inventory the affected content first and confirm the
  coordinated change list.
- Editors are critique-only: findings quote exact passages and assign bounded tasks; they never supply
  replacement prose. See `_config/shared/product-voice.md`.
- Brand: calm, exacting, respectful. No camouflage, flags-as-decoration, stencil type, or motivational
  slogans (see `references/product.md`). Target WCAG 2.2 AA.

## Running the app

```
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

Optional AI critique: copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`. Without a key the
editors fall back to grounded demo findings.
