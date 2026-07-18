# Stage 06 — Interview Response Editor

One job: critique practice interview responses against the response rubric. This stage does not write
answers, search jobs, or track applications.

## Inputs

| Input | Source | Layer |
|-------|--------|-------|
| Practice response text + the question asked | Submitted from the app's Interview Practice (`/interview`); headless runs drop it at `stages/06_interview/output/runtime/submitted-response.md` | per-run (Layer 4) |
| Target role context | `stages/05_applications/output/runtime/` (roles at the interview stage) | 4 (prior stage) |
| Editor persona: identity, rules, examples, response rubric | `stages/06_interview/references/` | 3 (stable) |
| Shared ground rules + finding contract | `_config/shared/product-voice.md`, `_config/shared/finding-format.md` | shared |

## Process

1. Load the persona in layer order: `identity.md` → `rules.md` → `reference/response-rubric.md` → `examples.md`,
   plus the shared ground rules.
2. Score the response 0–4 on relevance, ownership, evidence, and translation per the rubric.
3. Produce findings in the shared finding format identifying the exact phrases that hide judgment,
   evidence, or civilian relevance. Never write the answer.

## Outputs

| Output | Written to |
|--------|-----------|
| Critique run `{requested_at, model, input_excerpt, findings, scores, note}` | `stages/06_interview/output/runtime/<timestamp>-critique.json` |

This is the final stage; improved responses loop back through this editor until the veteran is satisfied.
