---
title: PBI 36 — Web List Todos
issue: https://github.com/nelson-arbelaez-epam/todos/issues/36
---

# PBI 36 — Web List Todos

Issue: https://github.com/nelson-arbelaez-epam/todos/issues/36

PR: (add PR URL here after creation)

Summary
-------
Add a Todos listing view to the Web app that shows active todos and
handles loading, empty, and error states. Archived todos are excluded by default.

Acceptance Criteria
-------------------

- Web users can see active todos in a stable list view
- Loading/empty/error states are properly handled
- Archived todos are excluded by default
- Tests cover list rendering, empty state, and failure handling

Proposed implementation notes
----------------------------

- UI files to add/modify (proposed):
  - apps/web/src/pages/todos/ (new page/container)
  - apps/web/src/components/organisms/todo-list/ (TodoList organism + item molecule)
  - apps/web/src/components/molecules/todo-item/ (presentational)
  - apps/web/src/services/todosClient.ts (service wrapper for API calls) or adapt `@todos/store`

- Tests to add:
  - `apps/web/src/components/organisms/todo-list/TodoList.spec.tsx` (rendering)
  - `apps/web/src/components/organisms/todo-list/TodoList.empty.spec.tsx`
  - `apps/web/src/components/organisms/todo-list/TodoList.error.spec.tsx`

Links
-----
- Issue: https://github.com/nelson-arbelaez-epam/todos/issues/36
- Draft PR body: .cache/pr_36_body.md

Development Info (to update during work)
--------------------------------------

- Branch: `dev/issue-36-web-list-todos`
- Commits: (record SHAs here after commit)
- PR: (add PR URL here after creation)
