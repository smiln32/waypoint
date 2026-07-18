# Stage 01 — Résumé Editor

One job: critique the veteran's résumé draft into decision-ready findings. This stage does not search for
jobs, write prose, or track applications.

## Inputs

| Input | Source | Layer |
|-------|--------|-------|
| Résumé draft text | Submitted from the app's Résumé Studio (`/resume`) | per-run |
| Editor persona: identity, rules, examples, review framework | `stages/01_resume/references/` | 3 (stable) |
| Shared ground rules + finding contract | `_config/shared/product-voice.md`, `_config/shared/finding-format.md` | shared |

## Process

1. Load the persona in layer order: `identity.md` → `rules.md` → `review-framework.md` → `examples.md`,
   plus the shared ground rules.
2. Review the draft as a civilian hiring reader per the review framework (truth → translation → evidence →
   relevance → readability).
3. Produce at most seven prioritized findings in the shared finding format. Quotes must be verbatim
   substrings of the draft.
4. The veteran accepts, rejects, or revises each finding in the app; checking a finding selects it for the
   next draft — it never edits the résumé.

## Outputs

| Output | Written to |
|--------|-----------|
| Critique run `{requested_at, model, input_excerpt, findings, note}` | `stages/01_resume/output/<timestamp>-critique.json` |

Downstream: stage 02 (`stages/02_job_search/`) reads the latest critique here as its picture of verified,
decision-ready résumé evidence.
