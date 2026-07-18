# Waypoint

Waypoint is a military-to-civilian career transition workspace for recently separated enlisted Marines pursuing technical and operational roles. The application demonstrates two portable ICM editors: one reviews military-to-civilian resumes, and one reviews civilian interview responses.

## Competition editors

- `editors/resume-editor/` critiques exact resume passages that hide scope, rely on military shorthand, overstate civilian equivalence, or lack defensible evidence.
- `editors/interview-editor/` critiques exact interview language that hides judgment, ownership, evidence, or civilian relevance.

Neither editor rewrites. Each identifies a passage, explains the hiring consequence, and returns a bounded decision to the veteran. Drafting is a separate step and applies only changes the user accepts.

## Current stage

The responsive application shell includes an overview, interactive resume review, grounded job-match explanations, application tracking, and interview-response practice. The interface works on desktop and mobile browser layouts.

## Staged roadmap

1. **Editor proof:** portable ICM folders and an interactive competition demonstration.
2. **Evidence intake:** structured service history, education, credentials, civilian experience, and privacy screening.
3. **Document workflow:** PDF/DOCX import, verified-fact ledger, resume generation, accepted-change drafting, version history, and export.
4. **Job intelligence:** official occupational mappings, permitted job-board feeds, saved postings, qualification-gap analysis, and source-linked company research.
5. **Application operations:** durable application records, reminders, contacts, materials, and communication history.
6. **Interview lab:** question sets licensed or independently authored, optional audio/video practice, transcript review, accessible learning modes, and longitudinal rubric evidence.

## Grounding and boundaries

MOS-to-career mappings are treated as hypotheses, never proof of experience. Production sources should prioritize O*NET, My Next Move for Veterans, Department of Labor resources, Marine Corps COOL, official employer postings, and company primary sources. Job sources must be accessed through permitted APIs or user-provided postings; the product should not scrape sites in violation of their terms.

The interview methodology uses general, independently established principles such as identifying the employer's underlying need, providing defensible evidence, and making individual judgment visible. It does not reproduce Martin John Yate's proprietary question banks or book text.

## Privacy

Do not upload classified, controlled, export-restricted, medical, or unnecessary personally identifying information. A production release requires authentication, encrypted storage, retention controls, deletion, access logs, and explicit consent for any audio or video processing.
