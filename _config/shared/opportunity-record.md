# Shared opportunity record contract

An opportunity record represents one specific job posting or manually entered position as it moves through Waypoint's existing Job Search and Job Tracking flow. The same record remains authoritative from the moment it is saved through every later hiring status.

## Identity and source

- The Waypoint record ID is permanent. Starting an application changes ownership and status, never the ID.
- A source ID identifies the external posting when one is available. It prevents duplicate saves of the same posting while allowing identical titles from different companies or postings.
- Company and role are separate authoritative values. Location is separate from contact information.
- Fictional seed records are marked as demo data. Private user records belong only in ignored runtime output and browser storage.

## Status ownership

Stage 03 owns pre-application statuses: Saved, Researching, Preparing, and Ready to Apply. Stage 05 owns Application Started, Applied, Screening, Interview, Offer, and Closed. No active record belongs to both runtime outputs.

## Dates

Creation and status-change times use ISO timestamps. Applied dates, action due dates, and contact dates use ISO `YYYY-MM-DD` values. Friendly dates are presentation only and are derived when the interface renders.

## Structured details

Materials keep resume and cover-letter state separately. Contacts keep a name and optional relationship, contact methods, dates, and notes. A next action has a semantic kind, label, optional detail, and optional due date.

CSS classes, React routes, composed display strings, and derived company-brief links are presentation concerns. They are never persisted as opportunity domain data.
