# Waypoint

**A critique-only resume editor for veterans entering civilian careers — and the career-transition workspace built around it.**

More than 200,000 U.S. service members transition to civilian life each
year.[^1] The record is real. The problem is that military language often
does not translate: acronyms, broad leadership claims, and unclear scope
can keep civilian employers from seeing what someone actually did.[^2]

Many AI tools respond by rewriting the résumé. Waypoint takes the opposite
approach. It identifies the exact wording that may confuse a civilian
reader, explains the impact, and hands the veteran a bounded revision task
without supplying replacement prose. The veteran remains the author and
the authority on every fact.

## The editor

The heart of Waypoint is a resume editor for recently separated enlisted
U.S. service members entering civilian operations, logistics, maintenance,
and technical careers. It lives in one small folder of plain markdown —
[`stages/01_resume/references/`](stages/01_resume/references/) — and each
file does one job:

```
stages/01_resume/references/
├── README.md                        How to use it
├── identity.md                      Who the editor is, whose work it reviews
├── rules.md                         How it critiques — ten rules and a required finding format
├── examples.md                      What strong critique looks like, and what it never looks like
└── reference/
    └── review-framework.md          The review order and the grounding sources it trusts
```

It needs no app to run. Add the folder's files to a Claude project, paste
a resume (plus the target job posting if you have one), and ask for a
review. What comes back is at most seven prioritized findings — each with
severity and defect, the exact quoted passage, why it fails for a civilian
reader, the evidence needed, and a decision that belongs to the writer —
followed by the three highest-leverage decisions to make first.

## Critique, never ghostwrite

Every Waypoint editor follows the same contract:

- **Quote the evidence.** Each finding points to the smallest exact passage with a problem.
- **Explain the civilian impact.** The editor shows how the wording may be understood and why it matters.
- **Give a task, not a rewrite.** The veteran decides how to revise it.
- **Do not invent facts.** No added scale, outcomes, credentials, or unsupported company knowledge.
- **Keep the review bounded.** No more than seven findings, then up to three highest-leverage decisions.

In practice:

> **High — Translation gap**
>
> Passage: "Maintained a 96% MC rate across 12 aircraft."
>
> Why it fails: "MC" is unexplained, and a civilian hiring reader cannot
> determine what the percentage measures, over what period, or what
> responsibility the candidate personally held for the result.
>
> Evidence needed: The verified meaning of "MC," the measurement period,
> the candidate's role, and which factors they directly influenced.
>
> Writer's decision: Explain the verified measure in civilian language and
> decide which part of your own contribution matters for the target role.
> Draft the revision yourself.

The editor never supplies the fixed sentence. A line the veteran did not
write is a line they cannot defend in an interview.

## The same files run a working app

Those markdown files are also the live brain of Waypoint, a five-step
career-transition workspace. The app assembles `identity.md` → `rules.md`
→ `reference/review-framework.md` → `examples.md` into the AI editor's
instructions at request time, highlights each finding's quoted passage in
the document, and logs every run to `stages/01_resume/output/`. Edit the
markdown and the editor behaves differently — no code changes.

![Resume Studio showing evidence-grounded findings beside an editable résumé](docs/screenshots/resume-studio.png)

| Step | Workspace | What happens |
|---|---|---|
| 1 | **Resume Studio** | Review evidence-quoted findings, edit the résumé in place, and resubmit |
| 2 | **Job Search** | Explore sample federal-style roles or search live federal listings when enabled |
| 3 | **Job Tracking** | Keep saved roles, applications, contacts, materials, due dates, and next actions together |
| 4 | **Cover Letter** | Draft against a critique-only editor without turning the letter into generic AI prose |
| 5 | **Interview Prep** | Practice responses scored on relevance, ownership, evidence, and translation |

The dashboard brings the workflow, pipeline, materials, and deadlines into
one view. The cover-letter and interview editors are built from the same
small-folder pattern
([`stages/04_cover_letter/references/`](stages/04_cover_letter/references/),
[`stages/06_interview/references/`](stages/06_interview/references/)), so
the approach holds as the work grows.

![Job Search showing role discovery and filtering](docs/screenshots/job-search.png)

![Dashboard showing next steps, application status, materials, and due dates](docs/screenshots/dashboard.png)

> **Demo note:** The public version uses fictional sample data to show the
> full workflow. Resume Studio demonstrates the review process with seeded
> passages, Job Search uses sample roles, and company briefs are not
> generated from invented research.

## How the repository is organized

Two layers share this repository, and they touch only through markdown:

| Layer | Where | What it is |
|---|---|---|
| **Knowledge** | [`stages/`](stages/), [`_config/shared/`](_config/shared/) | Plain markdown and JSON. Each numbered stage owns one job: its contract (`CONTEXT.md`), stable references (`references/`), and per-run artifacts (`output/`) |
| **Execution** | [`app/`](app/), [`components/`](components/), [`lib/`](lib/) | Next.js and browser local storage. Reads `stages/*/references/` to build editor instructions; writes critique runs to `stages/*/output/` |

Every editor decision is visible and version-controlled instead of hidden
in a prompt. See [`CONTEXT.md`](CONTEXT.md) for the stage map and
[`docs/`](docs/) for the conformance log.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The sample experience requires no configuration. To enable live
integrations (AI critique, company briefs, live federal job search, résumé
upload), copy `.env.example` to `.env.local` and add the required
credentials. Never commit real keys.

Verification, also run in CI:

```bash
npm test          # unit tests
npm run test:a11y # accessibility checks
npm run lint
npm run build
```

## Privacy and boundaries

Drafts and tracking data are stored in the browser. In the public sample,
nothing is sent to an external AI provider. When live AI is enabled, only
text submitted for review is sent to the configured provider.

Do not submit Social Security or service numbers, home addresses, medical
information, classified material, controlled information,
export-restricted information, or anything unnecessary for the review.

Waypoint does not guarantee employment, applicant-tracking-system ranking,
civilian credential equivalence, or clearance transferability.

## Sources

[^1]: [U.S. Department of Labor — Transition Assistance Program](https://www.dol.gov/agencies/vets/programs/tap)
[^2]: [U.S. Government Accountability Office — Military and Veteran Support: Performance Goals Could Strengthen Programs That Help Servicemembers Obtain Civilian Employment](https://www.gao.gov/products/gao-22-105261)
