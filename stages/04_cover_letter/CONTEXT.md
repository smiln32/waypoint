# Stage 04 — Cover Letter Editor

One job: critique whether the cover letter connects verified experience to one specific employer and role.
This stage does not write letters, critique the résumé, or track applications.

## Inputs

| Input | Source | Layer |
|-------|--------|-------|
| Cover letter draft + target role + company | Submitted from the app's Cover Letter Studio (`/cover-letter`) | per-run |
| Verified résumé evidence (latest critique run) | `stages/01_resume/output/` | 4 (prior stage) |
| Target role being readied | `stages/03_job_tracking/output/` | 4 (prior stage) |
| Editor persona: identity, rules, examples, connection framework | `stages/04_cover_letter/references/` | 3 (stable) |
| Letter templates (structure-only skeletons offered in the app) | `stages/04_cover_letter/references/templates.md` | 3 (stable) |
| Shared ground rules + finding contract | `_config/shared/product-voice.md`, `_config/shared/finding-format.md` | shared |

## Process

1. Load the persona in layer order: `identity.md` → `rules.md` → `connection-framework.md` →
   `examples.md`, plus the shared ground rules.
2. Review the letter in framework order: truth → role fit → employer specificity → evidence → tone and
   length.
3. Produce at most seven prioritized findings in the shared finding format. Quotes must be verbatim
   substrings of the draft. Never supply replacement sentences.

## Outputs

| Output | Written to |
|--------|-----------|
| Critique run `{requested_at, model, input_excerpt, findings, note}` | `stages/04_cover_letter/output/<timestamp>-critique.json` |

Downstream: stage 05 (`stages/05_applications/`) records the letter's sent/pending status among the
application's materials.
