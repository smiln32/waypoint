# ICM Conformance Log — Waypoint

## Current Audit

### Structural Conformance

- Root identity and routing preserve the five-step product scope.
- Six numbered stages each retain a contract, references, and inspectable output structure.
- Shared product voice and finding format remain visible under `_config/shared/`.
- Runtime artifacts have one documented location: `stages/*/output/runtime/`.
- Runtime JSON is ignored while runtime README files remain tracked.
- Fictional tracker snapshots live in clearly named `examples/demo-*.json` files.

### Operational Conformance

- Stage 03 owns Saved, Researching, Preparing, and Ready to Apply records.
- Start Application preserves the stable record ID and employer detail while transferring the record to Stage 05.
- Stage 05 owns Application Started, Applied, Screening, Interview, Offer, and Closed records.
- The combined Job Tracking page renders both lifecycle groups without duplicating a record.
- Editor prompts load stage CONTEXT, identity, rules, framework or rubric, examples, shared voice, and shared finding format.
- JSON schema, allowed severities, seven-finding limit, and exact-quote validation remain enforced in TypeScript.
- Privacy language matches the local-browser plus explicit hosted-AI-review behavior.
- Documented runtime paths match application write paths.
- Opportunity records now preserve permanent Waypoint IDs, external posting identity, structured company and role fields, semantic next actions, and ISO dates.
- Version 2 storage migrates legacy arrays once, preserves valid empty state, and never re-appends demo rows.
- Runtime partition checks confirm Stage 03 and Stage 05 records are mutually exclusive.

## Open Findings

None in the ICM foundation repair scope after verification. Later evidence, matching, sourcing, and broader product work remain outside this audit.

## Resolved Findings

- ICM-01: Materialized Stage 02, 03, and 05 handoff files.
- ICM-02: Documented canonical headless input paths.
- ICM-03: Replaced literal backslash-n formatting introduced by PR #1.
- ICM-04: Corrected runtime ignore rules and verified them with `git check-ignore`.
- ICM-05: Aligned all stage contracts with `output/runtime/` paths.
- ICM-06: Moved stale tracker snapshots into clearly labeled example folders.
- ICM-07: Corrected Start Application detail preservation and stage transfer.
- ICM-08: Derived tracker summaries from current data and removed the technical Ownership column.
- ICM-09: Replaced UI-shaped tracker rows with canonical, versioned opportunity records and verified legacy migration, empty-state preservation, duplicate posting identity, and stage handoff integrity.
- ICM-10: Removed stale committed company briefs containing résumé-derived content and aligned all output READMEs with the ignored runtime path.

## Audit History

- 2026-07-17: Initial audit found two issues; score 22/24.
- 2026-07-18: First re-audit after the UI redesign retained the two open issues.
- 2026-07-18: ICM-01 and ICM-02 resolved; structure reached 24/24 under the original rubric.
- 2026-07-18: Foundation pass introduced formatting, runtime-path, stale-artifact, transition, and tracker-summary regressions.
- 2026-07-18: Repair pass resolved ICM-03 through ICM-08 and re-verified structural and operational conformance.
- 2026-07-18: Record Integrity pass resolved ICM-09 and ICM-10 after deterministic migration tests, duplicate-identity checks, live stage partition checks, UI inspection, lint, production build, diff validation, and runtime-ignore verification.
