# Waypoint

**An AI career-transition workspace for veterans that refines service records into civilian-ready assets.**

Editors, not ghostwriters: every finding cites its evidence, explains the civilian-reader problem, and leaves every fact and revision with the veteran.

More than 200,000 U.S. service members transition to civilian life each year.[^1] Their experience is real; the problem is that military language often does not translate. Acronyms, broad leadership claims, and unclear scope can keep civilian employers from seeing what someone actually did.[^2] Waypoint is for those veterans — most often recently separated enlisted service members — turning a verified record into materials a civilian reader understands.

## Critique, never ghostwrite

Generic AI "fixes" a résumé by rewriting it into fluent text the veteran cannot defend in an interview. Waypoint refuses to. Every editor follows one contract:

- **Findings quote their evidence** — the smallest exact passage with a problem, highlighted in the document.
- **Reasoning is shown** — how a civilian hiring reader will read the passage, and why it costs the veteran.
- **Tasks, not rewrites** — a bounded revision decision; the veteran makes the edit in their own words.
- **No invented facts** — no scale, outcomes, or credentials the record does not support.

A résumé review returns at most seven prioritized findings, then up to three highest-leverage decisions.

![Resume Studio — the editor quotes each problem passage and explains why it fails for a civilian reader](docs/screenshots/resume-studio.png)

## The connected workflow

Waypoint keeps the process connected from the first résumé revision through the interview:

| Step | Workspace | What happens |
|------|-----------|--------------|
| 1 | **Resume Studio** | The editor returns evidence-quoted findings and the highest-leverage decisions; edit in place and resubmit until clear |
| 2 | **Job Search** | Search federal roles by keyword, location, date, schedule, salary, and radius |
| 3 | **Job Tracking** | Saved roles and applications in one tracker — stage, materials, contacts, a next action per row, and a per-position company brief |
| 4 | **Cover Letter** | Draft against a critique-only editor, with a strong finished example one click away |
| 5 | **Interview Prep** | Practice responses scored 0–4 on relevance, ownership, evidence, and translation |

The dashboard ties it together: prioritized next steps, pipeline counts, materials status, and a due-date calendar.

![Dashboard — next steps, pipeline, materials, and the due-date calendar](docs/screenshots/dashboard.png)

![Job Search — sample federal-style roles with the board's real filters](docs/screenshots/job-search.png)

## Sample mode and live operation

The default deployment runs on **fictional sample data** — no credentials, nothing sent anywhere — but it is not a static mockup. The application is fully wired for live operation: Claude-powered résumé, cover-letter, and interview critique; Claude-powered company briefs; live USAJOBS search; and résumé upload/paste when live AI is on.

What sample mode actually does:

- The résumé evaluator is a **bounded demonstration**. It recognizes the seeded problem passages in the fictional James Carter résumé and clears each finding as that passage is revised. It does **not** evaluate an arbitrary replacement résumé — general critique of any résumé requires live AI.
- Job Search returns clearly-labeled **sample roles**, not current postings.
- On-demand **company briefs are disabled** rather than generated from fabricated research.
- Résumé upload and paste are turned off; the demonstration works from the seeded sample.

Live features are opt-in — each needs its own flag **and** its own credentials, so a key alone never activates anything:

```
# Live AI critique + company briefs
WAYPOINT_ENABLE_LIVE_AI=true
ANTHROPIC_API_KEY=

# Live USAJOBS search
WAYPOINT_ENABLE_LIVE_JOBS=true
USAJOBS_API_KEY=
USAJOBS_EMAIL=
```

Sample/public mode requires no credentials. Do not put real keys in this file — set them in `.env.local`; the gate logic is in [`lib/live-config.ts`](lib/live-config.ts).

## Interpretable by design (ICM)

Each editor's reasoning is plain, human-editable Markdown, assembled into the AI prompt at request time. The résumé editor:

```
stages/01_resume/
├── CONTEXT.md
├── references/
│   ├── identity.md
│   ├── rules.md
│   ├── examples.md
│   ├── README.md
│   └── reference/
│       └── review-framework.md
└── output/
```

- `identity.md` defines who the editor is; `rules.md` defines its limits.
- `reference/review-framework.md` defines the review order; `examples.md` shows acceptable output.
- The files load in a defined order, and the shared output shape lives in [`_config/shared/finding-format.md`](_config/shared/finding-format.md).
- Change a Markdown rule and live AI behavior changes with it — the instruction, its reason, and its git history stay visible, never hidden in orchestration code.

## Run it locally

```
npm install
npm run dev        # http://localhost:3000
```

Runs in sample mode with no configuration. To enable live features, copy `.env.example` to `.env.local` and set the flags and credentials above.

## Privacy

Drafts and tracker data stay in the browser (localStorage); no account is needed. In sample mode nothing is sent to an AI provider. When live AI is enabled and you submit text for review, that text is sent to the configured provider and the result returns to the browser. Remove Social Security and service numbers, home addresses, medical information, and any classified or controlled information before submitting anything for live review.

## Sources

[^1]: U.S. Department of Labor — Transition Assistance Program\
https://www.dol.gov/agencies/vets/programs/tap

[^2]: U.S. Government Accountability Office — Military and Veteran Support: Performance Goals Could Strengthen Programs That Help Servicemembers Obtain Civilian Employment\
https://www.gao.gov/products/gao-22-105261
