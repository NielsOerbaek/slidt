---
agent: happy -p --yolo
commands:
  - name: plan-status
    run: "grep -c '^- \\[ \\]' docs/superpowers/plans/2026-04-23-01-core-renderer.md || echo 0"
  - name: next-unchecked
    run: "grep -n '^- \\[ \\]' docs/superpowers/plans/2026-04-23-01-core-renderer.md | head -8"
  - name: next-task-header
    run: "awk '/^### Task/{t=$0} /^- \\[ \\]/{print t; exit}' docs/superpowers/plans/2026-04-23-01-core-renderer.md"
  - name: recent-commits
    run: git log --oneline -8
  - name: repo-status
    run: git status --short
  - name: test-status
    run: "if [ -f package.json ]; then pnpm test 2>&1 | tail -20; else echo '(project not scaffolded yet — Task 1 will scaffold it)'; fi"
---

You are implementing **Plan 1 — Core renderer + template system** of the slidt slide webservice, one task at a time.

## Reference documents (read these every iteration)

- **Plan:** `docs/superpowers/plans/2026-04-23-01-core-renderer.md` — the source of truth for what to do. Contains 16 tasks with complete code, exact file paths, expected command output, and commit messages.
- **Spec:** `docs/superpowers/specs/2026-04-23-slide-webservice-design.md` — design context.
- **Roadmap:** `docs/superpowers/plans/2026-04-23-roadmap.md` — where Plan 1 sits in the bigger picture.

## Current progress

Unchecked steps remaining: **{{ commands.plan-status }}**

Next task with unchecked steps:
```
{{ commands.next-task-header }}
```

First unchecked lines:
```
{{ commands.next-unchecked }}
```

Recent commits:
```
{{ commands.recent-commits }}
```

Working tree status:
```
{{ commands.repo-status }}
```

Test status (for sanity-checking before starting a new task):
```
{{ commands.test-status }}
```

## Your job this iteration

1. **If "Unchecked steps remaining" is 0** — respond with `Plan 1 complete.` and stop. Do nothing else.
2. **Otherwise** — complete the **entire next Task** (the one identified above) in this iteration:
   - Read the full Task section in the plan file. It has numbered Steps, each with code blocks.
   - Execute every Step of that Task in order:
     - Write/edit the exact files named, with exactly the code shown.
     - Run the commands shown and verify output matches the "Expected:" line.
     - Commit using the message shown in the final commit step of the Task.
   - After the Task's final commit, **mark every checkbox for that Task as checked** by editing the plan file (change `- [ ]` to `- [x]` on the lines you just completed).
   - Commit the plan file update with message: `Mark Task N: <short name> complete`.
3. Stop.

## Rules

- **One Task per iteration.** Do NOT start Task N+1 in the same run as Task N.
- **The plan is the contract.** If a step's code, command, or expected output seems wrong or unclear, STOP and report — do NOT "fix" by editing the plan or improvising.
- **No destructive commands** beyond what the plan explicitly says. No `rm -rf`, no `git reset --hard`, no `git push --force`, no branch deletion.
- **Verify expected outputs.** If a step says "Expected: 5 tests pass" and you see 4 or 6, STOP and report.
- **Never skip the commit step.** Every task ends with a commit.
- **Do not push to any remote.** All work stays local.
- **No extra dependencies.** If a step requires a package, the plan will list it. Do not add others.

## Notes on the repo

- Node 20+, pnpm is available (pre-installed via corepack).
- Do NOT edit `RALPH.md` — that's this file, the loop driver.
- The first task (Task 1) scaffolds the project; after it runs, `pnpm test` will become meaningful.
