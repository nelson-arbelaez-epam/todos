<!--
Template for Architecture Decision Records (ADR) used in the Todos monorepo.

Usage:
- Copy this file to `docs/adr/00NN-short-title.md` where `00NN` is the next available
  numeric identifier (zero-padded). Use a concise, hyphen-separated lowercase title.
- Fill the front metadata (Status, Date, Authors) and populate each section below.
-->

# ADR 00NN - Short descriptive title

- Status: Proposed / Accepted / Deprecated / Rejected
- Date: YYYY-MM-DD
- Authors: Name <email>
- Tags: (optional, comma-separated)

## Context

What is the problem or motivation that requires a decision? Describe the current
situation, constraints, and the system boundaries that the decision affects. Include
references to related issues, PRs, spike notes or benchmarking artifacts.

## Decision

State the decision concisely. What are we going to do? Summarize the change in a
single paragraph and include any important configuration values, default settings,
or API contract changes introduced by this decision.

## Consequences

Describe the implications of the decision: operational, security, maintenance,
backwards compatibility, testing, and developer experience impacts.

## Alternatives Considered

List the alternatives that were considered and why they were rejected (briefly).

- Option A — short reason for rejection
- Option B — short reason for rejection

## Rationale

Explain why the chosen decision was selected over alternatives. Include concrete
evidence where available (benchmark numbers, test results, CI outputs, team
capacity, time-to-ship estimates, license constraints, etc.). If the decision is
opinionated, highlight the weakest assumptions and where to revisit them.

## Implementation Notes

Provide guidance for implementers: code locations to change, high-level steps, and
any required config or secrets. Prefer targeted, small steps and list a minimal
increment that proves the decision workable.

## Migration Plan

If this change requires data migration or incremental rollout, break the work into
small steps and describe the rollback / validation criteria for each step.

## Rollback Plan

How to revert the decision if it proves unacceptable in production. Include the
minimal actions required to restore previous behavior.

## Tests and Verification

Describe tests to validate the decision: unit/integration/e2e tests, manual checks,
or smoke tests and observability signals to watch after deployment.

## Related ADRs, Docs and References

- Link to related ADRs (if any): `docs/adr/00XX-other-decision.md`
- Link to spike notes in `docs/spikes/`
- Link to PRs/issues that motivated this decision

## Revision History

- YYYY-MM-DD — Author — Drafted

---

Notes for authors

- Keep ADR text concise and focused on the decision and its impact.
- If the ADR introduces an API contract change, update relevant `@todos/*` DTOs
  or add a compatibility shim and document it in `Implementation Notes`.
- Add cross-links to `constitution.md` or existing ADRs when the decision touches
  previously recorded architectural boundaries.

Example quick command to create a new ADR file (local developer convenience):

```bash
# get the next number (manual step): find max file number in docs/adr then increment
cp docs/adr/template.md docs/adr/0027-my-new-decision.md
open docs/adr/0027-my-new-decision.md # edit and fill metadata
git add docs/adr/0027-my-new-decision.md && git commit -m "docs(adr): add ADR 0027 my new decision"
```
