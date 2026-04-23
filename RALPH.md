---
agent: happy -p --yolo
commands:
  - name: plan-status
    run: .ralph-commands/plan-status.sh
  - name: next-unchecked
    run: .ralph-commands/next-unchecked.sh
  - name: next-task-header
    run: .ralph-commands/next-task-header.sh
  - name: recent-commits
    run: git log --oneline -8
  - name: repo-status
    run: git status --short
  - name: test-status
    run: .ralph-commands/test-status.sh
---

You are implementing **Plan 1 — Core renderer + template system** of the slidt slide webservice, one task at a time.

## Reference documents (read these every iteration)

- **Plan:** `docs/superpowers/plans/2026-04-23-01-core-renderer.md` — source of truth for what to do. 16 tasks with complete code, exact file paths, expected command output, and commit messages.
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

Test status:
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
   - Run `git push origin main` to publish progress. If it fails (remote not reachable, deploy key not added yet), note the error and continue — the next iteration will retry.
3. Stop.

## Rules

- **One Task per iteration.** Do NOT start Task N+1 in the same run as Task N.
- **The plan is the contract.** If a step's code, command, or expected output seems wrong or unclear, STOP and report — do NOT "fix" by editing the plan or improvising.
- **No destructive commands** beyond what the plan explicitly says. No `rm -rf`, no `git reset --hard`, no `git push --force`, no branch deletion.
- **Verify expected outputs.** If a step says "Expected: 5 tests pass" and you see 4 or 6, STOP and report.
- **Never skip the commit step.** Every task ends with a commit.
- **Only push `main` to `origin`.** Never push any other branch and never force-push.
- **No extra dependencies.** If a step requires a package, the plan will list it. Do not add others.

## Notes on the repo

- Node 20+, pnpm is available (pre-installed via corepack).
- Do NOT edit `RALPH.md` or anything under `.ralph-commands/` — those drive the loop.
- The first task (Task 1) scaffolds the project; after it runs, `pnpm test` will become meaningful.
