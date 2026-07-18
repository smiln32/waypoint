# Finding Format — the contract between editors and the workspace

Every AI editor returns findings in this exact JSON shape. The app renders them directly; the résumé view
also substring-matches `quote` against the document to highlight it, so quotes must be verbatim.

```json
{
  "findings": [
    {
      "level": "High | Medium | Low",
      "title": "One-line statement of the defect",
      "quote": "Smallest exact passage, verbatim from the submitted text",
      "why": "How a civilian reader interprets it and why that costs the veteran",
      "task": "One bounded revision task — never replacement prose"
    }
  ],
  "note": "One-sentence human-readable summary of the evaluation"
}
```

- `level` reflects cost to the candidacy, not effort to fix.
- Maximum seven findings per pass, ordered most consequential first.
- Zero findings is a valid result; `note` should say the review set is clear.

## Interview scores (stage 06 only)

The interview editor additionally returns four dimension scores:

```json
{ "scores": { "relevance": 0, "ownership": 0, "evidence": 0, "translation": 0 } }
```

Scale (see `stages/06_interview/references/response-rubric.md`):
**0** no evidence yet · **1** limited · **2** developing · **3** strong · **4** exceptional
