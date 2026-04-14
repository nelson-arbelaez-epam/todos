---
description: "Automate an issue-driven development flow: scaffold PBI/PR body, propose branch, run targeted checks, and prepare the PR for creation (no automatic commits or pushes unless consented)."
name: "smart-coding"
argument-hint: "Required: issue number (e.g. 40). Optional flags: --check --run-tests --branch-prefix <prefix>"
agent: "agent"
---

# Smart Coding: Issue-driven developer workflow (skills-driven)

Purpose

Turn a GitHub issue into a ready-to-review branch and PR using a skills-driven workflow that supports configurable autonomy levels. The prompt focuses on small, reversible changes, explicit audit trails, and enforcing repository constitution/ADR boundaries.

- Fetch issue metadata and acceptance criteria
- Propose a branch name and development plan
- Scaffold a PBI file and a `.cache` PR body file in the working tree
- Run targeted validations (lint/format/type checks and package-level tests) with optional autofix and approval
- Produce exact commands and minimal diffs to commit, push, and open a PR via `gh` or `mcp`

Inputs

- `issue` (required): GitHub issue number or URL (e.g. `40` or `https://github.com/owner/repo/issues/40`).
- `--branch-prefix` (optional): branch prefix to use (default: `dev`).
- `--create-pr` (optional): create the GitHub PR after validations (default: `true`).
- `--check` (optional): run quick static checks (`biome`) after scaffolding (default: `true`).
- `--run-tests` (optional): run targeted tests for affected packages (default: `true`).
- `--commit-chunks` (optional): commit changes in stepped chunks with interactive confirmation between chunks (default: `true`).
- `--wait-checks` (optional): wait for GitHub status/check runs to complete before finishing (default: `false`).
- `autonomy` (optional): `low|medium|high` behavior (default: `medium`).
- `GITHUB_REPO` (env, optional): owner/repo override if git remote cannot be parsed.

Quick Plan (skills-driven)

The workflow is divided into small, testable skills. Default autonomy is `medium` (commit-chunks + final confirmation).

1. `discover` → resolve `issue`: fetch title, body, labels, linked issues; infer `owner/repo` from git remote and list affected packages/files.
2. `compliance-check` → read `.github/constitution.md` and `docs/adr/**` and enforce boundaries. If a violation is detected, produce a blocking report and stop automated changes.
3. `research-web` (optional/autonomy-dependent) → fetch up to 3 authoritative docs and summarize best-practices for this task.
4. `scaffold` → write `.cache/pr_<issue>_body.md` and `.cache/pbi/<issue>-<slug>.md` (working tree only).
5. Iteratively run: `lint-fix` (show diff), `test` (report failures), `commit-chunk` (approve per chunk or auto-commit if `autonomy=high`).
6. `push` + `create-pr` (if `--create-pr=true` and final confirmation granted) → push branch, open PR, append PR URL to artifacts, record commit SHAs.
7. `wait-checks` (optional) → poll GitHub status runs for the created PR and report results (timeboxed).
8. `report` → produce final summary, acceptance mapping, and attach `Development Info` metadata.

Repository-specific Tools & Commands

Use these concrete commands for this repository (adapt where necessary):

- Resolve issue: `gh issue view <N> --json title,body,labels,assignees,comments -q .`
- Infer repo: `git config --get remote.origin.url` → parse `owner/repo`
- Branch creation: `git checkout -b "${PREFIX}/issue-${N}-${slug}"`
- Scaffold files (working tree): create `.cache/pr_${N}_body.md` and `.cache/pbi/${N}-${slug}.md`
- Lint/format check: `biome check` (show output). For autofix proposals use `biome format` or linter `--fix` but only apply on approval.
- Typecheck: `npx -y tsc -p <package>/tsconfig.json --noEmit` or workspace `tsc`.
- Targeted tests: `yarn workspace @todos/mobile test` or `npx vitest -c apps/mobile/vitest.config.ts --run`
- PR creation: `gh pr create --title "feat(${N}): <short>" --body-file .cache/pr_${N}_body.md --base main --head <branch>`

Compliance discovery examples:

- Read constitution: `cat .github/constitution.md`
- List ADRs: `ls docs/adr` and view `sed -n '1,200p' docs/adr/00XX-*.md`

Safety & Interaction Rules

1. Present proposed files and unified diffs before committing. Record diffs and decisions in `Development Info`.
2. Default PR creation: `--create-pr` defaults to `true`. The assistant will ask a final interactive confirmation before remote actions; the default confirmation is `Yes` in `medium` autonomy. For `high` autonomy with `auto-approve`, consent is recorded and actions proceed.
3. Networked operations (`gh pr create`, `git push`) only run after final confirmation or explicit `auto-approve` consent; always record consent in the audit.
4. Prefer targeted checks to full CI; run package-level checks first and expand only with explicit user permission.
5. Keep file contents minimal and include a `Links` section with canonical `Issue` and `PR` URLs.

Outputs

Produce the following artifacts in the working tree and the agent output (but do NOT commit unless user approves or `autonomy=high` with consent):

- `.cache/pr_<issue>_body.md` — suggested PR body with acceptance criteria mapping and checklist.
- `.cache/pbi/<issue>-<slug>.md` — PBI placeholder with Issue link and planned change summary.
- `branch` suggestion and exact `git` commands to create, stage, commit, and push the changes.
- Suggested `commit` messages using `feat(<issue>): <summary>` convention.
- Validation summary: lint/format/type/test outputs (PASS/FAIL) with commands to reproduce.
- Acceptance checklist mapping PR/issue criteria to verification steps and tests.
- `.cache/dev_info_<issue>.json` — structured audit trail: autonomy level, consent, files created, local commit SHAs, commands run, research citations, and PR URL if created.

When the user approves commit/push/PR creation (or `autonomy=high` with consent), the assistant will run the exact commands and append the PR URL to the `.cache/pbi` file and the `.cache` PR body and update `.cache/dev_info_<issue>.json`.

Skill Templates

Each skill should be callable with inputs and must output a JSON summary. Use these templates as a minimal contract for automation and testing.

`discover` -> inputs: `{ "issue": 40 }` -> outputs: `{ "title": "...", "affected": ["apps/mobile"], "files": ["..." ] }`

`compliance-check` -> inputs: `{ "affected": ["apps/mobile"] }` -> outputs: `{ "ok": true, "violations": [] }`

`scaffold` -> inputs: `{ "issue": 40, "branch": "dev/issue-40-login" }` -> outputs: `{ "files": [".cache/pr_40_body.md",".cache/pbi/40-login.md"] }`

`lint-fix` -> inputs: `{ "files": ["apps/mobile/src/components/LoginForm.tsx"] }` -> outputs: `{ "fixed": true, "diff": "--- a/... +++ b/..." }`

`commit-chunk` -> inputs: `{ "chunk": 1, "files": [...], "message": "feat(40): add LoginForm" }` -> outputs: `{ "sha": "..." }`

`create-pr` -> inputs: `{ "branch": "dev/issue-40-login", "bodyFile": ".cache/pr_40_body.md" }` -> outputs: `{ "prUrl": "https://github.com/.../pull/NN" }`

`wait-checks` -> inputs: `{ "prUrl": "https://github.com/.../pull/NN", "timeoutMin": 10 }` -> outputs: `{ "status": "passed", "checks": [...] }`

Development Info (audit) example

`{ "issue": 40, "branch": "dev/issue-40-login", "autonomy": "medium", "consent": true, "commits": ["sha1","sha2"], "pr": "https://.../pull/NN" }`

Notes

- The assistant must not silently change remote state. Any action that alters remote state requires recorded consent and updates to `.cache/dev_info_<issue>.json`.
- If `compliance-check` returns violations, the assistant must produce a blocking report and stop further autopilot actions until the user explicitly permits an ADR or constitutional exception.
- Keep the scaffolds small and reviewer-friendly.

---

Generated-by: smart-coding prompt template
