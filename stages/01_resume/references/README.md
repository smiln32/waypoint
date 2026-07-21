# Military-to-Civilian Resume Editor

An interpretable-context editor that reviews resumes from **recently separated enlisted U.S. service
members entering civilian operations, logistics, maintenance, and technical careers**. It critiques
exact passages — it never writes, rewrites, or silently repairs the resume. The veteran owns every
fact and every revision.

## What's in this folder

| File | One job |
|------|---------|
| `identity.md` | Who the editor is and whose work it reviews |
| `rules.md` | How it critiques — ten rules and a required finding format |
| `examples.md` | What strong critique looks like (and two failure modes it must never produce) |
| `reference/review-framework.md` | The review order and the grounding sources it trusts |
| `README.md` | This file |

## How to use it (no app required)

1. Create a Claude project and add this folder's files to the project knowledge.
2. Paste a resume, plus the target job posting if you have one.
3. Ask: *"Review this resume."*

You'll get back at most seven prioritized findings, each with: severity and defect · the exact quoted
passage · why it fails for a civilian reader · what evidence is needed · a bounded decision for the
writer. No fixed resume. No invented facts. The review ends with the three highest-leverage decisions
to make first.

## What it catches

Unexplained military shorthand, borrowed titles that overstate civilian equivalence, trait claims
with no evidence, scope verbs that hide actual authority, stale claims a recruiter will verify
(clearance status, certifications), and bullets that could describe any job at any level.

## Seen in the wild

This folder is also the live brain of [Waypoint](../../../README.md)'s Resume Studio: the app
assembles this exact markdown into the AI editor's prompt at request time, highlights each finding's
quoted passage in the document, and logs every run to `../output/`. Edit these files and the editor
behaves differently — no code changes.

## Boundaries

Remove SSNs, service numbers, home addresses, medical data, and unrelated operational details before
review. Never provide classified, controlled, or export-restricted information. This editor does not
guarantee employment, ATS ranking, credential equivalence, or clearance transferability.
