# ICM Conformance Log — waypoint

_Audited: 2026-07-17 · Standard: ICM (Van Clief & McDermott, arXiv:2603.16021) · Tree inspected: full workspace at C:\Users\smiln\Downloads\apps\waypoint (git repo); read CLAUDE.md, CONTEXT.md, all six stage CONTEXT.md contracts, references/ and output/ contents, _config/shared/_

## Conformance
| Area | Score | Headline |
|---|---|---|
| A. Root layers (0,1) | 4/4 | CLAUDE.md (identity + structure + hard rules) and CONTEXT.md (stage map table, routing, shared resources) both present and substantive |
| B. Stage folders & numbering | 4/4 | `stages/01_resume` … `06_interview`, sequential, no gaps or duplicates, names encode pipeline order |
| C. Stage internals (CONTEXT/references/output) | 4/4 | All six stages carry CONTEXT.md + non-empty references/ + output/ (each output/ documents its artifact convention) |
| D. Stage contracts (Inputs/Process/Outputs) | 4/4 | Every contract has Inputs (table with explicit Layer 3/4 paths) / Process / Outputs naming what lands in output/ |
| E. Stage chaining | 3/4 | Chain declared correctly (02←01, 03←02, 04←01+03, 05←03+04, 06←05) but the non-AI stages' handoffs aren't yet materialized as files (ICM-01) |
| F. Layer discipline & hard rules | 3/4 | references/ stable, output/ per-run, markdown/JSON only, one job per stage, `_config/shared/` present; runtime data flow of non-AI stages bypasses the plain-text interface (ICM-01) |
| **Total** | **22/24** | **fully conformant** |

Bands: 22–24 fully conformant · 17–21 mostly · 11–16 partial · 5–10 weak · 0–4 non-conformant.

## Open findings
| ID | Sev | Area | Location (path) | Problem | ICM rule | Fix |
|----|-----|------|-----------------|---------|----------|-----|
| ICM-01 | Medium | E, F | `stages/02_job_search/output/`, `stages/03_job_tracking/output/`, `stages/05_applications/output/` | The contracts honestly note these outputs are "currently held in app session state" — the output/ dirs contain only READMEs, so downstream Inputs that reference them (e.g. 03's `stages/02_job_search/output/`) have no file to read. Only the three AI editor stages (01, 04, 06) write real artifacts. | Plain-text interface; every output editable; stage N reads N−1 output/ | Have the app persist saved jobs / pipeline promotions / application records as timestamped JSON snapshots into each stage's output/ (dev-mode, best-effort — same guard as the critique writes), so the declared handoffs exist as diffable files. |
| ICM-02 | Low | D | `stages/01_resume/CONTEXT.md`, `04`, `06` | The per-run input rows ("Résumé draft text — submitted from the app") are runtime values, not file paths. Legitimate for an interactive app, but the paper's Inputs tables are file-path based. | Layered loading | Optionally note a canonical drop-file path (e.g. `output/submitted-draft.md`) for headless/agent-driven runs. |

## Resolved
| ID | Sev | Location | What it was | Fixed on |
|----|-----|----------|-------------|----------|

## History
- 2026-07-17: first ICM audit — 2 findings, 22/24 (fully conformant). Workspace restructured to ICM today: editor packages moved from `editors/` into stage references, cover-letter package authored, contracts and root layers written.
- 2026-07-18: re-audit after the UI redesign wave (page merge, Start Here, persona swap, template→example change). Tree verified intact: all six stages carry CONTEXT/references/output; prompt assembly still reads references/ at request time; example letter added as Layer 3 (`stages/04_cover_letter/references/example-letter.md`, contract updated). Fixed drift: Start Here added to Layer 1 routing in root CONTEXT.md. ICM-01 and ICM-02 remain open; score unchanged at 22/24.
