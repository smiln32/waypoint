# Waypoint

Waypoint is a military-to-civilian career transition workspace for recently separated enlisted Marines
pursuing technical and operational roles. Editors critique exact passages and return bounded decisions to
the veteran; they never rewrite. Drafting is a separate step and applies only changes the user accepts.

## Setup

```
npm install
npm run dev      # http://localhost:3000
```

Verification: `npm run lint` and `npm run build`.

### AI critique (optional)

Copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`. The résumé, cover-letter, and interview
editors then run real Claude critiques assembled from the ICM persona packages in `stages/*/references/`.
Without a key (or on any API failure) the editors fall back to grounded demo findings — the app always
works offline.

## Workspace structure (ICM)

This workspace follows the Interpretable Context Methodology (Van Clief & McDermott, arXiv:2603.16021).
Start at `CLAUDE.md` (identity) and `CONTEXT.md` (stage map). Six numbered stages under `stages/` carry the
career-transition pipeline; each holds its contract (`CONTEXT.md`), stable references, and per-run outputs:

| Stage | App page |
|-------|----------|
| `01_resume` — résumé editor | `/resume` |
| `02_job_search` — find and evaluate roles | `/search` |
| `03_job_tracking` — saved-jobs pipeline | `/jobs` |
| `04_cover_letter` — cover-letter editor | `/cover-letter` |
| `05_applications` — applications tracker | `/applications` |
| `06_interview` — interview response editor | `/interview` |

The Next.js app (`app/`, `components/`, `lib/`, `styles/`) is the execution layer: it reads
`stages/*/references/` to build editor prompts at request time and writes critique runs to
`stages/*/output/`. Editing the markdown in `references/` changes editor behavior with no code change.

## Grounding and boundaries

MOS-to-career mappings are treated as hypotheses, never proof of experience. Production sources should
prioritize O*NET, My Next Move for Veterans, Department of Labor resources, Marine Corps COOL, official
employer postings, and company primary sources. Job sources must be accessed through permitted APIs or
user-provided postings; the product should not scrape sites in violation of their terms.

The interview methodology uses general, independently established principles such as identifying the
employer's underlying need, providing defensible evidence, and making individual judgment visible.

## Privacy

Do not upload classified, controlled, export-restricted, medical, or unnecessary personally identifying
information. A production release requires authentication, encrypted storage, retention controls, deletion,
access logs, and explicit consent for any audio or video processing.

## Current limitations

- State is in-memory demo state; it resets on hard refresh. Job results are grounded sample data — no live
  job-board API.
- PDF/DOCX résumé parsing is not implemented (TXT/MD/RTF and paste work).
- "Add application" intake form is future work.
