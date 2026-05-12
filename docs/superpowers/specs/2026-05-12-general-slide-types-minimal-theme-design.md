# Design: General-Purpose Slide Types + Minimal Theme

**Date:** 2026-05-12
**Status:** Approved

## Overview

Two related changes:

1. **Rename existing OOD-specific slide types** to be general-purpose (name + label changes, one field removal, DB migration for existing slides).
2. **Add 7 new slide types** adapted from the noskillish/slides design system.
3. **Add a minimal theme** (`minimal`) using a warm-white, Inter-based design token set, compatible with new slide types.

---

## Part 1: Existing Type Renames

### Rename table

| Current `name` | New `name` | New `label` | Field changes |
|---|---|---|---|
| `title` | `cover` | Cover | Remove `mark` / `TITLE_MARKS` field (dandelion SVG — OOD-specific) |
| `agenda` | `agenda` | Agenda | Label only |
| `content` | `bullet-list` | Bullet list | Label only |
| `principles` | `numbered-list` | Numbered list | Label only |
| `values` | `column-list` | Column list | Label only |
| `reserve` | `callout-content` | Content + callout | Label only |
| `purposes` | `card-grid` | Card grid | Label only |
| `section` | `divider` | Section divider | Label only |
| `ownership` | `team-cards` | Team / info cards | Label only |
| `friction` | `comparison` | Two-side comparison | Label only |
| `discussion` | `qa-list` | Q&A list | Label only |
| `closing` | `closing` | Closing | No change |
| `appendix-list` | `appendix-list` | Appendix list | No change |

### Implementation

- Each TS file under `src/slide-types/` gets renamed (e.g. `title.ts` → `cover.ts`) and updated in place.
- `src/slide-types/index.ts` updated to export new names.
- A SQL migration updates `slides.type_name` for all changed names.
- The `cover` type loses the `mark` field and its `htmlTemplate`/`css` removes the dandelion column.

---

## Part 2: New Slide Types

All 7 new types use `--sl-*` CSS tokens (defined in both minimal and OOD themes). Templates follow the same `{{#if eyebrow}}…{{/if}}` guard pattern as existing types.

### `quote`
**Purpose:** Bold single-statement slide — storytelling punctuation.
**Fields:** `quote` (richtext, required), `attribution` (text, optional)
**Layout:** Centred, large quote text + small dim attribution below.

### `stat-grid`
**Purpose:** Showcase 3 key numbers.
**Fields:** `eyebrow` (text), `title` (text), `stats` (list of group: `value` + `label` + `description`)
**Layout:** Eyebrow + title row, then 3-column card grid.

### `timeline`
**Purpose:** Vertical chronological flow.
**Fields:** `eyebrow` (text), `title` (text), `events` (list of group: `year` + `title` + `body`)
**Layout:** Left-aligned year labels, dot connectors, content rows.

### `two-column`
**Purpose:** Generic side-by-side comparison (simpler than `column-list`).
**Fields:** `eyebrow` (text), `title` (text), `left` (group: `heading` + `body`), `right` (group: `heading` + `body`)
**Layout:** Two equal columns.

### `three-column`
**Purpose:** Why/How/What or any 3-way breakdown.
**Fields:** `eyebrow` (text), `title` (text), `columns` (list of group: `heading` + `body`, max 3)
**Layout:** Three equal columns.

### `dot-flow`
**Purpose:** Horizontal process steps (max 5).
**Fields:** `eyebrow` (text), `title` (text), `steps` (list of group: `title` + `caption`, max 5)
**Layout:** Dots connected by lines, title + caption under each.

### `quote-pair`
**Purpose:** Two perspectives side-by-side (light + dark card).
**Fields:** `eyebrow` (text, optional), `left` (group: `quote` + `attribution`), `right` (group: `quote` + `attribution`)
**Layout:** Two cards, right card uses dark surface.

---

## Part 3: Minimal Theme

**File:** `src/themes/minimal.ts`
**Theme name:** `minimal`
**No system prompt.**

### Design tokens

| Token | Value | Role |
|---|---|---|
| `--sl-bg` | `#f5f5f3` | Slide background |
| `--sl-surface` | `#fafaf8` | Cards / raised surfaces |
| `--sl-fg` | `#1a1a1a` | Primary text |
| `--sl-dim` | `#a0a09a` | Secondary / dimmed text |
| `--sl-very-dim` | `#b5b5b0` | Headline dim extension |
| `--sl-border` | `#e0e0db` | Hairlines, card borders |
| `--sl-border-mid` | `#d5d5d0` | Stronger borders |
| `--sl-dark-bg` | `#1a1a1a` | Dark slide / callout bg |
| `--sl-dark-fg` | `#f5f5f3` | Text on dark |
| `--sl-dark-dim` | `#888888` | Dimmed text on dark |
| `--sl-accent` | `#1a1a1a` | Accent (ink = truly minimal) |
| `--sl-font` | `'Inter', sans-serif` | Body font |

### Compatibility

- New slide type templates use only `--sl-*` tokens.
- Existing slide type templates continue using `--ood-*` tokens — unchanged, so existing decks on the OOD theme are unaffected.
- The OOD theme gets `--sl-*` tokens added (mapped to brand palette) so new slide types also look correct on the OOD theme.
- Slides using old types on the minimal theme will fall back to browser defaults for `--ood-*` tokens — acceptable, as those templates are visually OOD-specific anyway.

---

## Part 4: DB Migration

A new migration file handles:

```sql
-- Rename type_name on slides table
UPDATE slides SET type_name = 'cover' WHERE type_name = 'title';
UPDATE slides SET type_name = 'bullet-list' WHERE type_name = 'content';
UPDATE slides SET type_name = 'numbered-list' WHERE type_name = 'principles';
UPDATE slides SET type_name = 'column-list' WHERE type_name = 'values';
UPDATE slides SET type_name = 'callout-content' WHERE type_name = 'reserve';
UPDATE slides SET type_name = 'card-grid' WHERE type_name = 'purposes';
UPDATE slides SET type_name = 'divider' WHERE type_name = 'section';
UPDATE slides SET type_name = 'team-cards' WHERE type_name = 'ownership';
UPDATE slides SET type_name = 'comparison' WHERE type_name = 'friction';
UPDATE slides SET type_name = 'qa-list' WHERE type_name = 'discussion';
```

After migration, seed re-upserts all types (using the new names), so the `slide_types` table stays consistent.

---

## Checklist (pre-commit)

- [ ] All new UI labels in `src/lib/i18n/messages.ts` (da + en)
- [ ] All new types have `@media (max-width: 768px)` CSS
- [ ] `docs/` updated if user-facing functionality changes
