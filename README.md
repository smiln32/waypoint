# Waypoint

**An AI career-transition workspace for veterans that translates a service record without erasing the person who earned it.**

Every year, roughly 200,000 U.S. service members leave the military and run into the same wall: their experience is real, but their language doesn't translate. "Maintained a 96% MC rate" means nothing to a civilian recruiter. Generic AI tools "fix" this by ghostwriting — replacing the veteran's record with fluent text they can't defend in an interview.

Waypoint takes the opposite bet: **the AI critiques, and never ghostwrites.**

![Resume Studio — the editor highlights exact passages and explains, with evidence, why each one fails for a civilian reader](docs/screenshots/resume-studio.png)

## The principle: critique, never ghostwrite

Every editor in Waypoint follows the same contract:

- **Findings quote their evidence.** Each finding cites the smallest exact passage that has a problem — and the workspace highlights it in the document.
- **Reasoning is shown, not asserted.** Every finding explains how a civilian hiring reader will interpret the passage, and why that costs the veteran.
- **Tasks, not rewrites.** The editor assigns a bounded revision task. The veteran makes the edit, in their own words, and resubmits. Nothing is ever changed for them.
- **No invented facts.** Editors never add scale, outcomes, credentials, or company knowledge the record doesn't support — the goal is a resume the veteran can defend in the interview, not one that merely reads well.

## Interpretable by design (ICM)

Waypoint is built on the **Interpretable Context Methodology** (Van Clief & McDermott, arXiv:2603.16021). The AI's entire "mind" is plain, human-editable markdown:

```
stages/
├── 01_resume/        CONTEXT.md · references/ (identity, rules, review framework, examples) · output/
├── 02_job_search/    CONTEXT.md · references/ · output/
├── 03_job_tracking/  CONTEXT.md · references/ · output/
├── 04_cover_letter/  CONTEXT.md · references/ (incl. the in-app example letter) · output/
├── 05_applications/  CONTEXT.md · references/ · output/
└── 06_interview/     CONTEXT.md · references/ (incl. the 0–4 response rubric) · output/
```

The app assembles each editor's prompt **from these files at request time** and writes every critique run to the stage's `output/` as diffable JSON. Edit `stages/01_resume/references/rules.md` and the resume editor behaves differently — no code change, no redeploy, full git history of who changed the editor's judgment and when. Even the cover-letter example shown in the app is a markdown file in its stage. Conformance is tracked in [`ICM-AUDIT-LOG.md`](ICM-AUDIT-LOG.md) (currently 22/24, fully conformant band).

## The journey

A five-step path from service record to job offer, with one workspace per step:

![Start Here — the five-step path](docs/screenshots/start-here.png)

| Step | Workspace | What happens |
|------|-----------|--------------|
| 1 | **Resume Studio** | Upload or paste a resume; the editor returns evidence-quoted findings; edit in place and resubmit until clear |
| 2 | **Job Search** | Find roles and see fit as evidence, not a verdict |
| 3 | **Job Tracking** | Saved roles and applications in one tracker — stage, materials, contacts, and a clickable next action per row |
| 4 | **Cover Letter** | Draft against a critique-only editor; a strong finished example is one click away |
| 5 | **Interview Prep** | Practice responses scored 0–4 on relevance, ownership, evidence, and translation |

The dashboard ties it together: prioritized next steps, live pipeline counts, materials status, and a month calendar of due dates.

![Dashboard — next steps, pipeline, materials, and the due-date calendar](docs/screenshots/dashboard.png)

![Job Tracking — one tracker for saved roles and applications, with clickable next actions](docs/screenshots/job-tracking.png)

More: [Job Search](docs/screenshots/job-search.png) · [Cover Letter](docs/screenshots/cover-letter.png) · [Interview Prep](docs/screenshots/interview-prep.png)

## The AI layer

The editors are Claude. `POST /api/critique/[stage]` (resume · cover-letter · interview) assembles its system prompt from the stage's ICM references plus shared ground rules and calls Claude with a strict JSON schema — findings must be verbatim substrings of the submitted text, which is what makes in-document highlighting reliable. If the API is ever unreachable, the app degrades to offline demo evaluators so nothing breaks — and those results are **clearly labeled as demo findings** in the UI. The demo is a resilience layer, not a mode.

## Quickstart

```
npm install
cp .env.example .env.local    # set ANTHROPIC_API_KEY — the editors are Claude-powered
npm run dev                   # http://localhost:3000
```

Verification: `npm run lint` · `npm run build`. Without a key the app still runs, with editors showing clearly-labeled demo findings.

## Grounding and boundaries

MOS-to-career mappings are treated as hypotheses, never proof of experience. Production sources should prioritize O*NET, My Next Move for Veterans, Department of Labor resources, Marine Corps COOL, official employer postings, and company primary sources, accessed through permitted APIs or user-provided postings. The interview methodology uses general, independently established principles: identify the employer's underlying need, provide defensible evidence, make individual judgment visible.

## Privacy

Do not upload classified, controlled, export-restricted, medical, or unnecessary personally identifying information. A production release requires authentication, encrypted storage, retention controls, deletion, and access logs. The demo keeps everything in browser session state; uploaded files never leave the machine.

## Built for real use

- **Your work survives.** The resume draft, editor findings, cover letter, interview answer, and the whole tracker persist in the browser (localStorage) — no account needed, and nothing leaves the machine.
- **Real job listings.** Job Search connects to the **USAJOBS API** — federal hiring, where veterans' preference actually applies (free key at developer.usajobs.gov). Without credentials, clearly-labeled sample roles keep the page fully functional.
- **Any resume file.** PDF, DOCX, TXT, MD, RTF, or pasted text — parsed entirely in the browser (pdf.js + mammoth), so the file never leaves the machine.
- **Manual tracking.** Add positions directly in Job Tracking alongside roles saved from search; every next action links to the workspace where it happens.

Roadmap: accounts and cloud sync, additional job boards, materialized ICM `output/` files for the non-AI stages.
