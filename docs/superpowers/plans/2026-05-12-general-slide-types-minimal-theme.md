# General-Purpose Slide Types + Minimal Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename 11 OOD-specific slide types to generic names, add 7 new slide types from the noskillish/slides design system, and add a minimal warm-white theme with a shared `--sl-*` token set.

**Architecture:** Each slide type is a self-contained TS file; `src/slide-types/index.ts` aggregates them into `BUILT_IN_SLIDE_TYPES`. A DB migration renames `type_name` values on existing slides before the seed re-upserts types under their new names. New types use `--sl-*` CSS tokens defined in both the minimal theme and the OOD theme.

**Tech Stack:** SvelteKit, TypeScript, Drizzle ORM (Postgres), Handlebars templates in slide CSS/HTML

---

## File Map

**Create:**
- `drizzle/0006_rename_slide_types.sql` — renames type names in DB
- `src/slide-types/quote.ts`
- `src/slide-types/stat-grid.ts`
- `src/slide-types/timeline.ts`
- `src/slide-types/two-column.ts`
- `src/slide-types/three-column.ts`
- `src/slide-types/dot-flow.ts`
- `src/slide-types/quote-pair.ts`
- `src/themes/minimal.ts`

**Modify:**
- `src/slide-types/title.ts` — rename export to `cover`, change name/label, remove `mark` field + dandelion template
- `src/slide-types/agenda.ts` — label update only
- `src/slide-types/content.ts` — rename export to `bulletList`, change name/label
- `src/slide-types/principles.ts` — rename export to `numberedList`, change name/label
- `src/slide-types/values.ts` — rename export to `columnList`, change name/label
- `src/slide-types/reserve.ts` — rename export to `calloutContent`, change name/label
- `src/slide-types/purposes.ts` — rename export to `cardGrid`, change name/label
- `src/slide-types/section.ts` — rename export to `divider`, change name/label
- `src/slide-types/ownership.ts` — rename export to `teamCards`, change name/label
- `src/slide-types/friction.ts` — rename export to `comparison`, change name/label
- `src/slide-types/discussion.ts` — rename export to `qaList`, change name/label
- `src/slide-types/index.ts` — update all imports + BUILT_IN_SLIDE_TYPES array
- `src/themes/antal-theta-default.ts` — add `--sl-*` tokens mapped to brand palette
- `scripts/seed.ts` — seed minimal theme, update log message

---

## Task 1: DB Migration

**Files:**
- Create: `drizzle/0006_rename_slide_types.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- drizzle/0006_rename_slide_types.sql

-- 1. Rename slide type names in the slide_types table
UPDATE slide_types SET name = 'cover'            WHERE name = 'title'      AND scope = 'global';
UPDATE slide_types SET name = 'bullet-list'      WHERE name = 'content'    AND scope = 'global';
UPDATE slide_types SET name = 'numbered-list'    WHERE name = 'principles' AND scope = 'global';
UPDATE slide_types SET name = 'column-list'      WHERE name = 'values'     AND scope = 'global';
UPDATE slide_types SET name = 'callout-content'  WHERE name = 'reserve'    AND scope = 'global';
UPDATE slide_types SET name = 'card-grid'        WHERE name = 'purposes'   AND scope = 'global';
UPDATE slide_types SET name = 'divider'          WHERE name = 'section'    AND scope = 'global';
UPDATE slide_types SET name = 'team-cards'       WHERE name = 'ownership'  AND scope = 'global';
UPDATE slide_types SET name = 'comparison'       WHERE name = 'friction'   AND scope = 'global';
UPDATE slide_types SET name = 'qa-list'          WHERE name = 'discussion' AND scope = 'global';

-- 2. Rename type_name on existing slides
UPDATE slides SET type_name = 'cover'            WHERE type_name = 'title';
UPDATE slides SET type_name = 'bullet-list'      WHERE type_name = 'content';
UPDATE slides SET type_name = 'numbered-list'    WHERE type_name = 'principles';
UPDATE slides SET type_name = 'column-list'      WHERE type_name = 'values';
UPDATE slides SET type_name = 'callout-content'  WHERE type_name = 'reserve';
UPDATE slides SET type_name = 'card-grid'        WHERE type_name = 'purposes';
UPDATE slides SET type_name = 'divider'          WHERE type_name = 'section';
UPDATE slides SET type_name = 'team-cards'       WHERE type_name = 'ownership';
UPDATE slides SET type_name = 'comparison'       WHERE type_name = 'friction';
UPDATE slides SET type_name = 'qa-list'          WHERE type_name = 'discussion';
```

- [ ] **Step 2: Verify migration runs without error**

```bash
cd /opt/slidt && pnpm db:migrate
```

Expected: exits 0, no errors.

---

## Task 2: Rename `title` → `cover`

**Files:**
- Modify: `src/slide-types/title.ts`

This is the only type with a structural field change — the `mark` field and dandelion template are removed.

- [ ] **Step 1: Replace title.ts content**

Replace entire `src/slide-types/title.ts` with:

```typescript
import type { SlideType } from '../renderer/types.ts';

export const cover: SlideType = {
  name: 'cover',
  label: 'Cover',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext', required: true },
    { name: 'titleAlt', type: 'richtext' },
    { name: 'kicker', type: 'text' },
  ],
  htmlTemplate: `<div class="cover-col">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  <h1>{{fmt title}}{{#if titleAlt}}<br/><span class="alt">{{fmt titleAlt}}</span>{{/if}}</h1>
  {{#if kicker}}<p class="kicker">{{fmt kicker}}</p>{{/if}}
</div>`,
  css: `& { flex-direction: column; justify-content: center; padding: 120px; }
.eyebrow { font-family: 'Neureal', sans-serif; font-size: 40px; color: var(--ood-dark-matter, #363442); margin-bottom: 32px; letter-spacing: 0.02em; }
h1 { font-size: 120px; color: var(--ood-deep-violet, #6E31FF); line-height: 1.02; margin-bottom: 48px; }
h1 .alt { color: var(--ood-dark-matter, #363442); display: block; }
.kicker { font-family: 'Inter', sans-serif; font-weight: 300; font-size: 32px; line-height: 1.4; color: var(--ood-dark-matter, #363442); max-width: 720px; }
@media (max-width: 768px) {
  & { padding: 60px 40px; }
  h1 { font-size: 64px; }
  .eyebrow { font-size: 24px; }
  .kicker { font-size: 20px; }
}`,
};
```

---

## Task 3: Rename the other 9 existing types (name + label only)

**Files:** `content.ts`, `principles.ts`, `values.ts`, `reserve.ts`, `purposes.ts`, `section.ts`, `ownership.ts`, `friction.ts`, `discussion.ts`, `agenda.ts`

These are name/label changes only — CSS and templates are unchanged.

- [ ] **Step 1: Edit `src/slide-types/content.ts`** — change `name`, `label`, export name:

Find and replace:
```typescript
export const content: SlideType = {
  name: 'content',
  label: 'Bullet list with title',
```
With:
```typescript
export const bulletList: SlideType = {
  name: 'bullet-list',
  label: 'Bullet list',
```

- [ ] **Step 2: Edit `src/slide-types/principles.ts`** — change `name`, `label`, export name:

Find and replace:
```typescript
export const principles: SlideType = {
  name: 'principles',
  label: 'Numbered principles list',
```
With:
```typescript
export const numberedList: SlideType = {
  name: 'numbered-list',
  label: 'Numbered list',
```

- [ ] **Step 3: Edit `src/slide-types/values.ts`** — change `name`, `label`, export name:

Find and replace the opening of the export (first 3 lines of the object):
```typescript
export const values: SlideType = {
  name: 'values',
  label: 'Two-column values',
```
With:
```typescript
export const columnList: SlideType = {
  name: 'column-list',
  label: 'Column list',
```

- [ ] **Step 4: Edit `src/slide-types/reserve.ts`** — change `name`, `label`, export name:

Find and replace:
```typescript
export const reserve: SlideType = {
  name: 'reserve',
  label: 'Two-column reserve/callout',
```
With:
```typescript
export const calloutContent: SlideType = {
  name: 'callout-content',
  label: 'Content + callout',
```

- [ ] **Step 5: Edit `src/slide-types/purposes.ts`** — change `name`, `label`, export name:

Find and replace:
```typescript
export const purposes: SlideType = {
  name: 'purposes',
  label: 'Numbered-card grid',
```
With:
```typescript
export const cardGrid: SlideType = {
  name: 'card-grid',
  label: 'Card grid',
```

- [ ] **Step 6: Edit `src/slide-types/section.ts`** — change `name`, `label`, export name:

Find and replace:
```typescript
export const section: SlideType = {
  name: 'section',
  label: 'Section divider',
```
With:
```typescript
export const divider: SlideType = {
  name: 'divider',
  label: 'Section divider',
```

- [ ] **Step 7: Edit `src/slide-types/ownership.ts`** — change `name`, `label`, export name:

Find and replace:
```typescript
export const ownership: SlideType = {
  name: 'ownership',
  label: 'Ownership model (3 cards)',
```
With:
```typescript
export const teamCards: SlideType = {
  name: 'team-cards',
  label: 'Team / info cards',
```

- [ ] **Step 8: Edit `src/slide-types/friction.ts`** — change `name`, `label`, export name:

Find and replace:
```typescript
export const friction: SlideType = {
  name: 'friction',
  label: 'Two-side friction with question',
```
With:
```typescript
export const comparison: SlideType = {
  name: 'comparison',
  label: 'Two-side comparison',
```

- [ ] **Step 9: Edit `src/slide-types/discussion.ts`** — change `name`, `label`, export name:

Find and replace:
```typescript
export const discussion: SlideType = {
  name: 'discussion',
  label: 'Discussion questions',
```
With:
```typescript
export const qaList: SlideType = {
  name: 'qa-list',
  label: 'Q&A list',
```

- [ ] **Step 10: Edit `src/slide-types/agenda.ts`** — label only (name stays `agenda`):

Find and replace:
```typescript
  label: 'Agenda',
```
With:
```typescript
  label: 'Agenda',
```
No change needed — `agenda` name and label are already generic.

---

## Task 4: Add `--sl-*` tokens to OOD theme

**Files:**
- Modify: `src/themes/antal-theta-default.ts`

- [ ] **Step 1: Add `--sl-*` tokens to the tokens object**

In `src/themes/antal-theta-default.ts`, find the tokens object closing brace `},` and insert before it:

```typescript
    // Semantic tokens — used by new general-purpose slide types
    '--sl-bg': '#FFFFFF',
    '--sl-surface': '#EDEDED',
    '--sl-fg': '#363442',
    '--sl-dim': '#807B95',
    '--sl-very-dim': '#D5D3DC',
    '--sl-border': '#D5D3DC',
    '--sl-border-mid': '#807B95',
    '--sl-dark-bg': '#363442',
    '--sl-dark-fg': '#FFFFFF',
    '--sl-dark-dim': '#807B95',
    '--sl-accent': '#6E31FF',
    '--sl-font': "'Neureal', 'Inter', sans-serif",
```

---

## Task 5: Write 7 new slide types

**Files:**
- Create: `src/slide-types/quote.ts`
- Create: `src/slide-types/stat-grid.ts`
- Create: `src/slide-types/timeline.ts`
- Create: `src/slide-types/two-column.ts`
- Create: `src/slide-types/three-column.ts`
- Create: `src/slide-types/dot-flow.ts`
- Create: `src/slide-types/quote-pair.ts`

- [ ] **Step 1: Create `src/slide-types/quote.ts`**

```typescript
import type { SlideType } from '../renderer/types.ts';

export const quote: SlideType = {
  name: 'quote',
  label: 'Quote',
  fields: [
    { name: 'quote', type: 'richtext', required: true },
    { name: 'attribution', type: 'text' },
  ],
  htmlTemplate: `<div class="quote-wrap">
  <blockquote>{{fmt quote}}</blockquote>
  {{#if attribution}}<p class="attribution">— {{fmt attribution}}</p>{{/if}}
</div>`,
  css: `& { justify-content: center; align-items: center; text-align: center; padding: 120px 160px; background: var(--sl-bg, #f5f5f3); }
.quote-wrap { max-width: 1100px; }
blockquote { font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 500; color: var(--sl-fg, #1a1a1a); line-height: 1.15; letter-spacing: -0.025em; margin: 0 0 40px; font-family: var(--sl-font, 'Inter', sans-serif); }
.attribution { font-size: 1rem; font-weight: 400; color: var(--sl-dim, #a0a09a); font-family: var(--sl-font, 'Inter', sans-serif); }
@media (max-width: 768px) {
  & { padding: 60px 40px; }
  blockquote { font-size: 1.75rem; }
}`,
};
```

- [ ] **Step 2: Create `src/slide-types/stat-grid.ts`**

```typescript
import type { SlideType } from '../renderer/types.ts';

export const statGrid: SlideType = {
  name: 'stat-grid',
  label: 'Stat grid',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    {
      name: 'stats',
      type: 'list',
      required: true,
      items: {
        name: 'stat',
        type: 'group',
        fields: [
          { name: 'value', type: 'text', required: true },
          { name: 'label', type: 'text', required: true },
          { name: 'description', type: 'text' },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="stat-slide">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <div class="stat-row">
    {{#each stats}}
    <div class="stat-card">
      <div class="value">{{fmt value}}</div>
      <div class="lbl">{{fmt label}}</div>
      {{#if description}}<div class="desc">{{fmt description}}</div>{{/if}}
    </div>
    {{/each}}
  </div>
</div>`,
  css: `& { flex-direction: column; padding: 80px 120px; background: var(--sl-bg, #f5f5f3); }
.eyebrow { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--sl-dim, #a0a09a); margin-bottom: 16px; font-family: var(--sl-font, 'Inter', sans-serif); }
h2 { font-size: 2.5rem; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 60px; letter-spacing: -0.025em; font-family: var(--sl-font, 'Inter', sans-serif); }
.stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
.stat-card { background: var(--sl-surface, #fafaf8); border: 1px solid var(--sl-border, #e0e0db); border-radius: 10px; padding: 40px 32px; }
.value { font-size: clamp(3rem, 6vw, 5rem); font-weight: 600; color: var(--sl-fg, #1a1a1a); letter-spacing: -0.04em; line-height: 1; margin-bottom: 12px; font-family: var(--sl-font, 'Inter', sans-serif); }
.lbl { font-size: 1rem; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 8px; font-family: var(--sl-font, 'Inter', sans-serif); }
.desc { font-size: 0.875rem; font-weight: 400; color: var(--sl-dim, #a0a09a); font-family: var(--sl-font, 'Inter', sans-serif); line-height: 1.5; }
@media (max-width: 768px) {
  & { padding: 40px 24px; }
  .stat-row { grid-template-columns: 1fr; gap: 16px; }
  h2 { font-size: 1.75rem; margin-bottom: 32px; }
}`,
};
```

- [ ] **Step 3: Create `src/slide-types/timeline.ts`**

```typescript
import type { SlideType } from '../renderer/types.ts';

export const timeline: SlideType = {
  name: 'timeline',
  label: 'Timeline',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    {
      name: 'events',
      type: 'list',
      required: true,
      items: {
        name: 'event',
        type: 'group',
        fields: [
          { name: 'year', type: 'text', required: true },
          { name: 'title', type: 'text', required: true },
          { name: 'body', type: 'text' },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="timeline-slide">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <div class="events">
    {{#each events}}
    <div class="event">
      <div class="year">{{fmt year}}</div>
      <div class="dot-col"><div class="dot"></div></div>
      <div class="content">
        <div class="ev-title">{{fmt title}}</div>
        {{#if body}}<div class="ev-body">{{fmt body}}</div>{{/if}}
      </div>
    </div>
    {{/each}}
  </div>
</div>`,
  css: `& { flex-direction: column; padding: 80px 120px; background: var(--sl-bg, #f5f5f3); overflow: hidden; }
.eyebrow { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--sl-dim, #a0a09a); margin-bottom: 16px; font-family: var(--sl-font, 'Inter', sans-serif); }
h2 { font-size: 2.5rem; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 48px; letter-spacing: -0.025em; font-family: var(--sl-font, 'Inter', sans-serif); }
.events { display: flex; flex-direction: column; }
.event { display: grid; grid-template-columns: 100px 28px 1fr; align-items: start; }
.year { font-size: 0.8rem; font-weight: 500; color: var(--sl-dim, #a0a09a); padding-top: 4px; font-family: var(--sl-font, 'Inter', sans-serif); text-align: right; padding-right: 18px; }
.dot-col { display: flex; flex-direction: column; align-items: center; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: var(--sl-fg, #1a1a1a); flex-shrink: 0; position: relative; }
.dot::after { content: ''; position: absolute; left: 4px; top: 10px; width: 2px; height: 9999px; background: var(--sl-border, #e0e0db); }
.event:last-child .dot::after { display: none; }
.content { padding: 0 0 32px 18px; }
.ev-title { font-size: 1rem; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 4px; font-family: var(--sl-font, 'Inter', sans-serif); }
.ev-body { font-size: 0.875rem; color: var(--sl-dim, #a0a09a); font-family: var(--sl-font, 'Inter', sans-serif); line-height: 1.5; }
@media (max-width: 768px) {
  & { padding: 40px 24px; }
  .event { grid-template-columns: 64px 22px 1fr; }
  h2 { font-size: 1.75rem; margin-bottom: 32px; }
}`,
};
```

- [ ] **Step 4: Create `src/slide-types/two-column.ts`**

```typescript
import type { SlideType } from '../renderer/types.ts';

export const twoColumn: SlideType = {
  name: 'two-column',
  label: 'Two column',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    {
      name: 'left',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'body', type: 'richtext', required: true },
      ],
    },
    {
      name: 'right',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'body', type: 'richtext', required: true },
      ],
    },
  ],
  htmlTemplate: `<div class="two-col-slide">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <div class="cols">
    <div class="col">
      <h4>{{fmt left.heading}}</h4>
      <p>{{fmt left.body}}</p>
    </div>
    <div class="col">
      <h4>{{fmt right.heading}}</h4>
      <p>{{fmt right.body}}</p>
    </div>
  </div>
</div>`,
  css: `& { flex-direction: column; padding: 80px 120px; background: var(--sl-bg, #f5f5f3); }
.eyebrow { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--sl-dim, #a0a09a); margin-bottom: 16px; font-family: var(--sl-font, 'Inter', sans-serif); }
h2 { font-size: 2.5rem; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 48px; letter-spacing: -0.025em; font-family: var(--sl-font, 'Inter', sans-serif); }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
h4 { font-size: 1.1rem; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 16px; font-family: var(--sl-font, 'Inter', sans-serif); padding-bottom: 12px; border-bottom: 1px solid var(--sl-border, #e0e0db); }
p { font-size: 1rem; font-weight: 400; color: var(--sl-dim, #a0a09a); line-height: 1.65; font-family: var(--sl-font, 'Inter', sans-serif); }
@media (max-width: 768px) {
  & { padding: 40px 24px; }
  .cols { grid-template-columns: 1fr; gap: 32px; }
  h2 { font-size: 1.75rem; margin-bottom: 32px; }
}`,
};
```

- [ ] **Step 5: Create `src/slide-types/three-column.ts`**

```typescript
import type { SlideType } from '../renderer/types.ts';

export const threeColumn: SlideType = {
  name: 'three-column',
  label: 'Three column',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    {
      name: 'columns',
      type: 'list',
      required: true,
      items: {
        name: 'col',
        type: 'group',
        fields: [
          { name: 'heading', type: 'text', required: true },
          { name: 'body', type: 'richtext', required: true },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="three-col-slide">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <div class="cols">
    {{#each columns}}
    <div class="col">
      <h4>{{fmt heading}}</h4>
      <p>{{fmt body}}</p>
    </div>
    {{/each}}
  </div>
</div>`,
  css: `& { flex-direction: column; padding: 80px 120px; background: var(--sl-bg, #f5f5f3); }
.eyebrow { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--sl-dim, #a0a09a); margin-bottom: 16px; font-family: var(--sl-font, 'Inter', sans-serif); }
h2 { font-size: 2.5rem; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 48px; letter-spacing: -0.025em; font-family: var(--sl-font, 'Inter', sans-serif); }
.cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
h4 { font-size: 1.1rem; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 14px; font-family: var(--sl-font, 'Inter', sans-serif); padding-bottom: 12px; border-bottom: 1px solid var(--sl-border, #e0e0db); }
p { font-size: 1rem; font-weight: 400; color: var(--sl-dim, #a0a09a); line-height: 1.65; font-family: var(--sl-font, 'Inter', sans-serif); }
@media (max-width: 768px) {
  & { padding: 40px 24px; }
  .cols { grid-template-columns: 1fr; gap: 28px; }
  h2 { font-size: 1.75rem; margin-bottom: 32px; }
}`,
};
```

- [ ] **Step 6: Create `src/slide-types/dot-flow.ts`**

```typescript
import type { SlideType } from '../renderer/types.ts';

export const dotFlow: SlideType = {
  name: 'dot-flow',
  label: 'Process flow',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    {
      name: 'steps',
      type: 'list',
      required: true,
      items: {
        name: 'step',
        type: 'group',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'caption', type: 'text' },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="dot-flow-slide">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <div class="flow">
    {{#each steps}}
    <div class="step">
      <div class="step-dot"></div>
      <div class="step-title">{{fmt title}}</div>
      {{#if caption}}<div class="step-caption">{{fmt caption}}</div>{{/if}}
    </div>
    {{#unless @last}}<div class="connector"></div>{{/unless}}
    {{/each}}
  </div>
</div>`,
  css: `& { flex-direction: column; justify-content: center; padding: 80px 120px; background: var(--sl-bg, #f5f5f3); }
.eyebrow { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--sl-dim, #a0a09a); margin-bottom: 16px; font-family: var(--sl-font, 'Inter', sans-serif); }
h2 { font-size: 2.5rem; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 56px; letter-spacing: -0.025em; font-family: var(--sl-font, 'Inter', sans-serif); }
.flow { display: flex; flex-direction: row; align-items: flex-start; }
.step { display: flex; flex-direction: column; align-items: center; text-align: center; min-width: 120px; }
.step-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--sl-fg, #1a1a1a); margin-bottom: 16px; flex-shrink: 0; }
.connector { flex: 1; height: 2px; background: var(--sl-border, #e0e0db); margin-top: 6px; }
.step-title { font-size: 0.95rem; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 6px; font-family: var(--sl-font, 'Inter', sans-serif); }
.step-caption { font-size: 0.8rem; color: var(--sl-dim, #a0a09a); font-family: var(--sl-font, 'Inter', sans-serif); line-height: 1.4; }
@media (max-width: 768px) {
  & { padding: 40px 24px; }
  .flow { flex-direction: column; align-items: flex-start; gap: 0; }
  .step { flex-direction: row; align-items: flex-start; text-align: left; gap: 16px; min-width: unset; padding-bottom: 24px; }
  .step-dot { margin-bottom: 0; margin-top: 4px; }
  .connector { display: none; }
}`,
};
```

- [ ] **Step 7: Create `src/slide-types/quote-pair.ts`**

```typescript
import type { SlideType } from '../renderer/types.ts';

export const quotePair: SlideType = {
  name: 'quote-pair',
  label: 'Quote pair',
  fields: [
    { name: 'eyebrow', type: 'text' },
    {
      name: 'left',
      type: 'group',
      fields: [
        { name: 'quote', type: 'richtext', required: true },
        { name: 'attribution', type: 'text' },
      ],
    },
    {
      name: 'right',
      type: 'group',
      fields: [
        { name: 'quote', type: 'richtext', required: true },
        { name: 'attribution', type: 'text' },
      ],
    },
  ],
  htmlTemplate: `<div class="quote-pair-slide">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  <div class="cards">
    <div class="card card-light">
      <blockquote>{{fmt left.quote}}</blockquote>
      {{#if left.attribution}}<p class="attr">— {{fmt left.attribution}}</p>{{/if}}
    </div>
    <div class="card card-dark">
      <blockquote>{{fmt right.quote}}</blockquote>
      {{#if right.attribution}}<p class="attr">— {{fmt right.attribution}}</p>{{/if}}
    </div>
  </div>
</div>`,
  css: `& { flex-direction: column; justify-content: center; padding: 80px 120px; background: var(--sl-bg, #f5f5f3); }
.eyebrow { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--sl-dim, #a0a09a); margin-bottom: 32px; font-family: var(--sl-font, 'Inter', sans-serif); }
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.card { padding: 48px 40px; border-radius: 10px; }
.card-light { background: var(--sl-surface, #fafaf8); border: 1px solid var(--sl-border, #e0e0db); }
.card-dark { background: var(--sl-dark-bg, #1a1a1a); }
.card-light blockquote { color: var(--sl-fg, #1a1a1a); }
.card-dark blockquote { color: var(--sl-dark-fg, #f5f5f3); }
blockquote { font-size: clamp(1.25rem, 2.5vw, 1.75rem); font-weight: 500; line-height: 1.3; letter-spacing: -0.02em; margin: 0 0 24px; font-family: var(--sl-font, 'Inter', sans-serif); }
.attr { font-size: 0.85rem; font-weight: 400; font-family: var(--sl-font, 'Inter', sans-serif); }
.card-light .attr { color: var(--sl-dim, #a0a09a); }
.card-dark .attr { color: var(--sl-dark-dim, #888888); }
@media (max-width: 768px) {
  & { padding: 40px 24px; }
  .cards { grid-template-columns: 1fr; gap: 16px; }
  .card { padding: 32px 24px; }
}`,
};
```

---

## Task 6: Write minimal theme

**Files:**
- Create: `src/themes/minimal.ts`

- [ ] **Step 1: Create `src/themes/minimal.ts`**

```typescript
import type { Theme } from '../renderer/types.ts';

export const minimal: Theme = {
  name: 'minimal',
  tokens: {
    '--sl-bg': '#f5f5f3',
    '--sl-surface': '#fafaf8',
    '--sl-fg': '#1a1a1a',
    '--sl-dim': '#a0a09a',
    '--sl-very-dim': '#b5b5b0',
    '--sl-border': '#e0e0db',
    '--sl-border-mid': '#d5d5d0',
    '--sl-dark-bg': '#1a1a1a',
    '--sl-dark-fg': '#f5f5f3',
    '--sl-dark-dim': '#888888',
    '--sl-accent': '#1a1a1a',
    '--sl-font': "'Inter', sans-serif",
  },
};
```

---

## Task 7: Update `index.ts`

**Files:**
- Modify: `src/slide-types/index.ts`

- [ ] **Step 1: Replace entire `src/slide-types/index.ts`**

```typescript
import type { SlideType } from '../renderer/types.ts';
import { cover } from './title.ts';
import { agenda } from './agenda.ts';
import { bulletList } from './content.ts';
import { numberedList } from './principles.ts';
import { columnList } from './values.ts';
import { calloutContent } from './reserve.ts';
import { cardGrid } from './purposes.ts';
import { divider } from './section.ts';
import { teamCards } from './ownership.ts';
import { comparison } from './friction.ts';
import { qaList } from './discussion.ts';
import { closing } from './closing.ts';
import { appendixList } from './appendix-list.ts';
import { quote } from './quote.ts';
import { statGrid } from './stat-grid.ts';
import { timeline } from './timeline.ts';
import { twoColumn } from './two-column.ts';
import { threeColumn } from './three-column.ts';
import { dotFlow } from './dot-flow.ts';
import { quotePair } from './quote-pair.ts';

export const BUILT_IN_SLIDE_TYPES: SlideType[] = [
  cover,
  agenda,
  bulletList,
  numberedList,
  columnList,
  calloutContent,
  cardGrid,
  divider,
  teamCards,
  comparison,
  qaList,
  closing,
  appendixList,
  quote,
  statGrid,
  timeline,
  twoColumn,
  threeColumn,
  dotFlow,
  quotePair,
];

export {
  cover,
  agenda,
  bulletList,
  numberedList,
  columnList,
  calloutContent,
  cardGrid,
  divider,
  teamCards,
  comparison,
  qaList,
  closing,
  appendixList,
  quote,
  statGrid,
  timeline,
  twoColumn,
  threeColumn,
  dotFlow,
  quotePair,
};
```

---

## Task 8: Update `seed.ts`

**Files:**
- Modify: `scripts/seed.ts`

- [ ] **Step 1: Add minimal theme import and seeding**

Add import at the top of the imports block:
```typescript
import { minimal } from '../src/themes/minimal.ts';
```

After the existing OOD theme upsert block (lines 37–55), add:

```typescript
  // Upsert the minimal theme
  const BUILT_IN_THEMES = [antalThetaDefault, minimal];
  for (const theme of BUILT_IN_THEMES) {
    const [existingT] = await db
      .select({ id: themes.id })
      .from(themes)
      .where(eq(themes.name, theme.name))
      .limit(1);
    if (existingT) {
      await db
        .update(themes)
        .set({ tokens: theme.tokens, systemPrompt: theme.systemPrompt ?? null })
        .where(eq(themes.id, existingT.id));
    } else {
      await db.insert(themes).values({
        name: theme.name,
        tokens: theme.tokens,
        systemPrompt: theme.systemPrompt ?? null,
        scope: 'global',
        isPreset: true,
      });
    }
  }
```

Also remove the now-superseded single-theme upsert block (the original `existingTheme` block for `antalThetaDefault` only) so themes are not double-seeded.

Update the log line at the bottom:
```typescript
  console.log(`Seeded ${BUILT_IN_SLIDE_TYPES.length} slide types and ${BUILT_IN_THEMES.length} themes.`);
```

- [ ] **Step 2: Run seed to verify**

```bash
cd /opt/slidt && pnpm db:seed
```

Expected output:
```
Seeded 20 slide types and 2 themes.
```

---

## Task 9: Commit

- [ ] **Step 1: Stage all changes**

```bash
cd /opt/slidt && git add \
  drizzle/0006_rename_slide_types.sql \
  src/slide-types/title.ts \
  src/slide-types/agenda.ts \
  src/slide-types/content.ts \
  src/slide-types/principles.ts \
  src/slide-types/values.ts \
  src/slide-types/reserve.ts \
  src/slide-types/purposes.ts \
  src/slide-types/section.ts \
  src/slide-types/ownership.ts \
  src/slide-types/friction.ts \
  src/slide-types/discussion.ts \
  src/slide-types/index.ts \
  src/slide-types/quote.ts \
  src/slide-types/stat-grid.ts \
  src/slide-types/timeline.ts \
  src/slide-types/two-column.ts \
  src/slide-types/three-column.ts \
  src/slide-types/dot-flow.ts \
  src/slide-types/quote-pair.ts \
  src/themes/antal-theta-default.ts \
  src/themes/minimal.ts \
  scripts/seed.ts
```

- [ ] **Step 2: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(slide-types): rename OOD types to generic + add 7 new types + minimal theme

- Rename 11 slide types (title→cover, content→bullet-list, etc.)
- DB migration 0006 renames slide_types.name and slides.type_name
- Add 7 new types: quote, stat-grid, timeline, two-column, three-column, dot-flow, quote-pair
- Add minimal theme with warm-white --sl-* token set
- OOD theme gains --sl-* tokens for new type compatibility

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>
EOF
)"
```

---

## Self-Review

- **Spec coverage:**
  - Part 1 (renames): Tasks 2 + 3 ✓
  - Part 2 (7 new types): Task 5 ✓
  - Part 3 (minimal theme): Task 6 ✓
  - Part 4 (DB migration): Task 1 ✓
  - OOD theme --sl-* tokens: Task 4 ✓
  - Seed update: Task 8 ✓

- **CLAUDE.md checklist:**
  - i18n: Slide type labels live in the DB (seeded), not in the i18n message registry — no messages.ts changes needed.
  - Mobile: All 7 new types include `@media (max-width: 768px)` blocks ✓. cover.ts renamed type also gets mobile CSS ✓.
  - Docs: No new user-facing routes/commands added — no docs update needed.

- **Type consistency:** `statGrid`, `twoColumn`, `threeColumn`, `dotFlow`, `quotePair` in index.ts match the exported const names in their respective files ✓. `stat-grid`, `two-column`, etc. as the `name` string field are what get stored in the DB ✓.

- **Seed refactor:** After Task 8, the original single-theme upsert block is replaced by the loop — no double-seeding.
