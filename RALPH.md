---
agent: happy -p --yolo
commands:
  - name: roadmap-status
    run: .ralph-commands/roadmap-status.sh
  - name: current-plan
    run: .ralph-commands/current-plan.sh
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

You are implementing the **slidt slide webservice** — a 6-subsystem roadmap — one task at a time.

## Reference documents (read these every iteration)

- **Spec:** `docs/superpowers/specs/2026-04-23-slide-webservice-design.md` — full design.
- **Roadmap:** `docs/superpowers/plans/2026-04-23-roadmap.md` — the 6 subsystems and their dependencies.
- **Plans dir:** `docs/superpowers/plans/` — existing plan files.
- **Plan 1 (as template):** `docs/superpowers/plans/2026-04-23-01-core-renderer.md` — structural example.

## Current state

Roadmap status:
```
{{ commands.roadmap-status }}
```

Current active plan: **{{ commands.current-plan }}**

Unchecked steps in current plan: **{{ commands.plan-status }}**

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

Read the roadmap-status output above and pick one of the three cases:

---

### Case A — Current plan has unchecked steps (`plan-status` > 0)

Complete the **entire next Task** (the one shown by `next-task-header`) in this single iteration:

1. Read the full Task section in the plan file — it has numbered Steps, each with code blocks.
2. Execute every Step in order:
   - Write/edit the exact files named, with exactly the code shown.
   - Run the commands shown and check the output.
   - **If a step's expected output doesn't match**: investigate, find the root cause, and fix it. If the plan step itself is wrong, correct it in the plan file and continue. Never stop — always try to solve the problem.
   - **If tests fail**: read the failure output, diagnose the cause, fix the code (and update the plan step if the plan code was wrong), and re-run until passing.
   - **If a command errors**: read the error, fix the underlying issue, retry. Do not skip steps.
3. After all steps succeed and the task's commit is done, **mark every checkbox for that Task as checked** in the plan file (`- [ ]` → `- [x]`).
4. Commit the plan update: `Mark Task N: <short name> complete`
5. Run `git push origin main`. If the push fails (no remote, deploy key not set up), note the error and continue — next iteration will retry.
6. Stop. (Do not start the next Task in this same iteration.)

---

### Case B — No current plan has unchecked steps + roadmap has an unwritten plan

The current-plan command showed "(none — all existing plans complete)". Look at roadmap-status to identify the **next plan** to write. Plans must be written in order (1→2→3→4→5→6) because each depends on the previous.

Write the next plan now, following the **superpowers writing-plans methodology**:

#### Step 1: Read the codebase

Before writing a single line of the plan, read:
- `docs/superpowers/specs/2026-04-23-slide-webservice-design.md` — the full spec
- `docs/superpowers/plans/2026-04-23-roadmap.md` — what this plan must deliver
- All files under `src/` — understand types, function signatures, file layout
- The most recently completed plan — use it as a structural template
- Any relevant config files (`package.json`, `tsconfig.json`, `drizzle.config.ts` if it exists, etc.)

#### Step 2: Design the file structure

Before writing tasks, enumerate every file that will be created or modified, with a one-line note on its responsibility. Lock this in before writing Task 1.

#### Step 3: Write the plan document

Save to: `docs/superpowers/plans/YYYY-MM-DD-NN-<slug>.md`
(Use today's date; NN = 02, 03, … ; slug matches the roadmap entry.)

The plan MUST follow this exact format (same as Plan 1):

```markdown
# Plan N — <Subsystem Name>

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence]

**Architecture:** [2-3 sentences]

**Tech stack:** [Key technologies]

---

## File structure

[tree showing every file to create or modify]

---

### Task 1: [Name]

**Files:**
- Create: `exact/path/to/file.ts`
- Modify: `exact/path/to/existing.ts`
- Test: `tests/exact/path/test.ts`

- [ ] **Step 1: Write the failing test**
[complete test code in code block]

- [ ] **Step 2: Run test to verify it fails**
Run: `pnpm test tests/path/test.ts`
Expected: FAIL — [exact error message]

- [ ] **Step 3: Write minimal implementation**
[complete implementation code in code block]

- [ ] **Step 4: Run test to verify it passes**
Run: `pnpm test tests/path/test.ts`
Expected: PASS — N tests passed

- [ ] **Step 5: Commit**
git add [files]
git commit -m "feat: [description]"
```

**Critical quality rules for plan writing:**
- **No placeholders** — every Step must contain the actual code. Never write "TBD", "similar to above", "implement X", "handle errors appropriately", or any other vague instruction.
- **Complete code in every step** — if a step modifies a file, show the full new file or the exact lines with enough context.
- **Exact commands with expected output** — every `Run:` line has an `Expected:` line with the real output.
- **TDD** — write the failing test before the implementation in every task.
- **Frequent commits** — every task ends with a commit step.
- **One task = one coherent chunk** — roughly 5–15 minutes of work. Split if larger.

#### Step 4: Commit and stop

After saving the plan file:
```
git add docs/superpowers/plans/<filename>.md
git commit -m "Add Plan N: <subsystem name> implementation plan"
```

Then stop. The next iteration will start executing the plan.

---

### Case C — All 6 plans complete

Output: `Roadmap complete.` and stop.

---

## Rules

- **One Task per iteration.** Do NOT start Task N+1 in the same run as Task N. Writing a new plan counts as the full iteration's work.
- **Never stop on errors.** Investigate and fix every failure. If the plan's expected output is wrong, correct the plan and continue. There is no situation where you should stop and report without attempting a fix first.
- **No destructive commands** beyond what the plan explicitly says. No `rm -rf`, no `git reset --hard`, no `git push --force`.
- **Never skip the commit step.** Every task ends with a commit.
- **Only push `main` to `origin`.** Never force-push.
- **No extra dependencies** when executing plans. When writing plans, choose minimal, well-supported packages.
- **No co-author tags in commits.** Commit messages must not include `Co-Authored-By:`, `Generated with`, or any tool attribution.

## Notes on the repo

- Node 20+, pnpm (via corepack).
- **Plan 2** (Data model + API + auth): This is a SvelteKit app. Initialize with `pnpm create svelte@latest` or by hand. Import renderer types from `src/renderer/types.ts`. Use Drizzle ORM + Postgres. Auth: argon2id + HTTP-only session cookies.
- **Plan 3** (Editor UI): SvelteKit pages. Import renderer from Plan 1. Live preview by calling `render()` in the browser directly.
- **Plan 4** (PDF export): Playwright + `pdf-lib`. Add as a route in the Plan 2 SvelteKit app.
- **Plan 5** (Agent): Claude API (Sonnet 4.6), streaming via SSE. Wire into the Plan 3 editor UI.
- **Plan 6** (Migration + deployment): Docker Compose, Caddy, Drizzle migrations, import-deck CLI.
