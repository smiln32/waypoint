# ICM Conformance Log — waypoint

_Audited: 2026-07-18 (re-audit) · Standard: ICM (Van Clief & McDermott, arXiv:2603.16021) · Tree inspected: full workspace at C:\Users\smiln\Downloads\apps\waypoint (git repo); read root layers, all six stage CONTEXT contracts, references/ and output/ contents, _config/shared/, and verified materialized output files against the running app_

## Conformance
| Area | Score | Headline |
|---|---|---|
| A. Root layers (0,1) | 4/4 | CLAUDE.md (identity + structure + hard rules) and CONTEXT.md (stage map table, routing incl. Start Here/Dashboard and brief pages) both substantive |
| B. Stage folders & numbering | 4/4 | `stages/01_resume` … `06_interview`, sequential, no gaps or duplicates, names encode pipeline order |
| C. Stage internals (CONTEXT/references/output) | 4/4 | All six stages carry CONTEXT.md + non-empty references/ (five-part editor packages with `reference/` subfolders) + output/ |
| D. Stage contracts (Inputs/Process/Outputs) | 4/4 | Every contract has Inputs/Process/Outputs with explicit file paths; per-run inputs name canonical drop-file paths for headless runs |
| E. Stage chaining | 4/4 | Declared handoffs exist as files: 02→03 (`saved-roles.json`), 03→05 (`tracked-roles.json`), 05 (`applications.json`), plus AI critique/brief runs in 01/03/04/06 outputs |
| F. Layer discipline & hard rules | 4/4 | references/ stable, output/ per-run and human-editable JSON/markdown, plain-text interfaces throughout, one job per stage, `_config/shared/` present |
| **Total** | **24/24** | **fully conformant** |

Bands: 22–24 fully conformant · 17–21 mostly · 11–16 partial · 5–10 weak · 0–4 non-conformant.

## Open findings
| ID | Sev | Area | Location (path) | Problem | ICM rule | Fix |
|----|-----|------|-----------------|---------|----------|-----|
| — | | | | none | | |

## Resolved
| ID | Sev | Location | What it was | Fixed on |
|----|-----|----------|-------------|----------|
| ICM-01 | Medium | `stages/{02,03,05}/output/` | Non-AI stage outputs lived only in app session state; declared handoffs had no files | 2026-07-18 — the app materializes `saved-roles.json`, `tracked-roles.json`, and `applications.json` on every tracker change (dev best-effort, same guard as critique writes); contracts updated to name the files |
| ICM-02 | Low | `stages/{01,04,06}/CONTEXT.md` | Per-run input rows were runtime values with no file path | 2026-07-18 — Inputs name canonical drop-file paths (`output/submitted-draft.md`, `output/submitted-letter.md`, `output/submitted-response.md`) for headless/agent runs |

## History
- 2026-07-17: first ICM audit — 2 findings, 22/24 (fully conformant). Workspace restructured to ICM today: editor packages moved from `editors/` into stage references, cover-letter package authored, contracts and root layers written.
- 2026-07-18: re-audit after the UI redesign wave (page merge, Start Here, persona swap, template→example change). Tree verified intact; Start Here added to Layer 1 routing. ICM-01/ICM-02 remained open; 22/24.
- 2026-07-18: ICM-01 and ICM-02 resolved — tracker state materializes into stage output files (verified against the running app: three snapshots written and correctly partitioned), per-run drop-file paths documented, stale stage-05 status corrected. **24/24.**
