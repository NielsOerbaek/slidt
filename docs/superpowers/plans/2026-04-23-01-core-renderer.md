# Plan 1 — Core renderer + template system

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pure-TypeScript slide rendering library — `render(deck, theme, templates) → HTML` — that runs unchanged in both Node and the browser. Includes Handlebars with custom helpers, field-schema validation, CSS auto-scoping, 13 seeded built-in SlideTypes ported from the existing `generate.py`, and an ANTAL-Theta default theme extracted from `styles.css`.

**Architecture:** Single-package library, ESM, no framework. Pure functions only — the renderer never reaches out to disk, network, or DOM. Handlebars compiles templates on first use; results are cached per-SlideType. CSS is auto-scoped per SlideType via a small PostCSS plugin. Fonts and global base styles are bundled into the rendered HTML so the output is self-contained (no relative URLs).

**Tech stack:** TypeScript 5.4+, Node 20, pnpm, Handlebars 4.7, PostCSS 8, Vitest 1.5.

**Source of truth for the ports:** the existing generator lives at `/home/niec/ogtal.onedrive/osogdata/møde_bilag/antal-diskussion-april-2026/slides/generate.py` (13 template functions) and `/home/niec/ogtal.onedrive/osogdata/møde_bilag/antal-diskussion-april-2026/slides/styles.css` (theme tokens + per-type CSS). The engineer executing this plan should read those two files before starting Task 11.

## File structure

```
slidt/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .gitignore
├── src/
│   ├── index.ts                    # public API re-exports
│   ├── renderer/
│   │   ├── index.ts                # render() main function
│   │   ├── types.ts                # Deck, Slide, SlideType, Field, Theme
│   │   ├── fmt.ts                  # **bold**/*em*/\n helper
│   │   ├── handlebars.ts           # helper registration
│   │   ├── validate.ts             # validate(data, fields)
│   │   ├── theme-css.ts            # theme tokens -> :root CSS
│   │   ├── scope-css.ts            # auto-prefix CSS selectors
│   │   ├── slide-wrap.ts           # page chrome (corner logo, page num)
│   │   ├── page-shell.ts           # full HTML document wrapper
│   │   └── base-styles.ts          # global stylesheet (@font-face, .slide, etc.)
│   ├── slide-types/
│   │   ├── index.ts                # BUILT_IN_SLIDE_TYPES export
│   │   ├── title.ts
│   │   ├── agenda.ts
│   │   ├── content.ts
│   │   ├── principles.ts
│   │   ├── values.ts
│   │   ├── reserve.ts
│   │   ├── purposes.ts
│   │   ├── section.ts
│   │   ├── ownership.ts
│   │   ├── friction.ts
│   │   ├── discussion.ts
│   │   ├── closing.ts
│   │   └── appendix-list.ts
│   └── themes/
│       └── antal-theta-default.ts  # Theme object
└── tests/
    ├── fmt.test.ts
    ├── handlebars.test.ts
    ├── validate.test.ts
    ├── theme-css.test.ts
    ├── scope-css.test.ts
    ├── slide-wrap.test.ts
    ├── page-shell.test.ts
    ├── render.test.ts
    ├── slide-types.test.ts         # parametrized over all 13
    └── fixtures/
        ├── deck-antal.json         # from the ANTAL deck's slides.json
        └── golden-deck-antal.html  # expected full render output
```

Rationale for this layout: each renderer concern (fmt, validate, scoping, wrapping, shell) is a small module with a pure function and a matching test file. Slide types live in their own directory so each one is a ~30-line focused unit that's easy to scan. Themes are kept separate from renderer logic because more themes will be added later.

---

### Task 1: Scaffold the project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `src/index.ts`
- Create: `README.md`

- [x] **Step 1: Write `package.json`**

Create `package.json`:

```json
{
  "name": "slidt",
  "version": "0.0.0",
  "private": true,
  "description": "Slide webservice — core renderer + template system",
  "type": "module",
  "main": "./src/index.ts",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "handlebars": "^4.7.8",
    "postcss": "^8.4.35"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "tsx": "^4.7.0",
    "typescript": "^5.4.2",
    "vitest": "^1.5.0"
  },
  "engines": {
    "node": ">=20"
  }
}
```

- [x] **Step 2: Write `tsconfig.json`**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  },
  "include": ["src/**/*", "tests/**/*"]
}
```

- [x] **Step 3: Write `vitest.config.ts`**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    globals: false,
  },
});
```

- [x] **Step 4: Write `.gitignore`**

Create `.gitignore`:

```
node_modules/
dist/
coverage/
.DS_Store
*.log
```

- [x] **Step 5: Write `src/index.ts` (empty public API for now)**

Create `src/index.ts`:

```ts
export {};
```

- [x] **Step 6: Write a minimal `README.md`**

Create `README.md`:

```markdown
# slidt

Slide webservice. Core renderer + template system (Plan 1 of 6).

See `docs/superpowers/specs/2026-04-23-slide-webservice-design.md` for the full spec
and `docs/superpowers/plans/2026-04-23-roadmap.md` for the plan roadmap.

## Dev

```sh
pnpm install
pnpm test
pnpm typecheck
```
```

- [x] **Step 7: Install deps and verify the toolchain works**

Run: `cd ~/Documents/repos/slidt && pnpm install && pnpm typecheck`
Expected: install succeeds and produces `pnpm-lock.yaml`; `tsc --noEmit` exits with code 0 and no output (nothing to type-check yet).

Run: `pnpm test`
Expected: vitest exits successfully with "No test files found" (since `tests/` doesn't exist yet — this is fine; the next task adds the first test).

- [x] **Step 8: Commit**

```sh
cd ~/Documents/repos/slidt
git add package.json pnpm-lock.yaml tsconfig.json vitest.config.ts .gitignore src/index.ts README.md
git commit -m "Scaffold slidt project with TS, Vitest, and deps"
```

---

### Task 2: Core types

**Files:**
- Create: `src/renderer/types.ts`
- Create: `tests/types.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/types.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import type { Deck, Slide, SlideType, Field, Theme } from '../src/renderer/types.ts';

describe('types', () => {
  it('allows a valid Deck literal', () => {
    const deck: Deck = {
      title: 'Test',
      lang: 'da',
      slides: [{ typeName: 'title', data: { title: 'Hello' } }],
    };
    expect(deck.title).toBe('Test');
  });

  it('allows a Theme with tokens', () => {
    const theme: Theme = {
      name: 'default',
      tokens: { '--ood-white': '#FFFFFF' },
    };
    expect(theme.tokens['--ood-white']).toBe('#FFFFFF');
  });

  it('allows a SlideType with fields and template', () => {
    const t: SlideType = {
      name: 'content',
      label: 'Content',
      fields: [{ name: 'title', type: 'text' }],
      htmlTemplate: '<h2>{{title}}</h2>',
      css: '',
    };
    expect(t.name).toBe('content');
  });

  it('supports list fields with nested items', () => {
    const f: Field = {
      name: 'items',
      type: 'list',
      items: { name: 'bullet', type: 'richtext' },
    };
    expect(f.type).toBe('list');
  });

  it('supports group fields with sub-fields', () => {
    const f: Field = {
      name: 'card',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'body', type: 'richtext' },
      ],
    };
    expect(f.type).toBe('group');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/types.test.ts`
Expected: FAIL with "Cannot find module '../src/renderer/types.ts'".

- [ ] **Step 3: Write `src/renderer/types.ts`**

Create `src/renderer/types.ts`:

```ts
export type FieldKind =
  | 'text'
  | 'richtext'
  | 'markdown'
  | 'bool'
  | 'select'
  | 'image'
  | 'list'
  | 'group';

export interface Field {
  name: string;
  type: FieldKind;
  label?: string;
  help?: string;
  required?: boolean;
  default?: unknown;

  /** for `select` */
  options?: string[];

  /** for `image` */
  accept?: string;

  /** for `list` — the shape each item takes */
  items?: Field;

  /** for `group` */
  fields?: Field[];
}

export interface SlideType {
  name: string;
  label: string;
  fields: Field[];
  htmlTemplate: string;
  /** CSS written without an outer wrapper — the renderer auto-scopes it to `.st-<name>` */
  css: string;
}

export interface Theme {
  name: string;
  /** CSS custom-property name to value, e.g. `{ "--ood-white": "#FFFFFF" }` */
  tokens: Record<string, string>;
}

export interface Slide {
  typeName: string;
  data: Record<string, unknown>;
}

export interface AppendixItem {
  path: string;
  mark: string;
  title: string;
  subtitle: string;
}

export interface Deck {
  title: string;
  lang: string;
  slides: Slide[];
  appendix?: AppendixItem[];
  appendixEyebrow?: string;
  appendixTitle?: string;
}

export interface RenderOptions {
  /** Omit appendix list slide even if appendix items are present. Default false. */
  skipAppendixList?: boolean;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test tests/types.test.ts && pnpm typecheck`
Expected: 5 tests pass; typecheck exits 0.

- [ ] **Step 5: Commit**

```sh
git add src/renderer/types.ts tests/types.test.ts
git commit -m "Define core renderer types (Deck, Slide, SlideType, Field, Theme)"
```

---

### Task 3: `fmt` helper (inline markup)

This ports the Python `fmt` function from `generate.py`. It HTML-escapes text, then converts `**bold**` → `<strong>`, `*em*` → `<em>`, and `\n` → `<br/>`. The output is raw HTML; Handlebars will get it wrapped in `SafeString` in Task 4.

**Files:**
- Create: `src/renderer/fmt.ts`
- Create: `tests/fmt.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/fmt.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { fmt } from '../src/renderer/fmt.ts';

describe('fmt', () => {
  it('returns empty string for null/undefined/empty', () => {
    expect(fmt(null)).toBe('');
    expect(fmt(undefined)).toBe('');
    expect(fmt('')).toBe('');
  });

  it('escapes HTML chars', () => {
    expect(fmt('a < b & c > d')).toBe('a &lt; b &amp; c &gt; d');
    expect(fmt('"q" \'s')).toBe('&quot;q&quot; &#x27;s');
  });

  it('converts **bold** to <strong>', () => {
    expect(fmt('**hello**')).toBe('<strong>hello</strong>');
    expect(fmt('x **a** y')).toBe('x <strong>a</strong> y');
  });

  it('converts *em* to <em>', () => {
    expect(fmt('x *a* y')).toBe('x <em>a</em> y');
  });

  it('keeps double-star bold from being consumed by em rule', () => {
    expect(fmt('**only bold**')).toBe('<strong>only bold</strong>');
  });

  it('converts \\n to <br/>', () => {
    expect(fmt('a\nb\nc')).toBe('a<br/>b<br/>c');
  });

  it('handles combinations', () => {
    expect(fmt('**bold**\nand *em*'))
      .toBe('<strong>bold</strong><br/>and <em>em</em>');
  });

  it('allows bold across newlines', () => {
    expect(fmt('**line1\nline2**')).toBe('<strong>line1\nline2</strong>'.replace('\n', '<br/>'));
  });

  it('does NOT match em across newlines', () => {
    expect(fmt('*line1\nline2*')).toBe('*line1<br/>line2*');
  });

  it('leaves lone * alone', () => {
    expect(fmt('lone * star')).toBe('lone * star');
  });

  it('escapes HTML inside bold markers', () => {
    expect(fmt('**a < b**')).toBe('<strong>a &lt; b</strong>');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test tests/fmt.test.ts`
Expected: FAIL with "Cannot find module '../src/renderer/fmt.ts'".

- [ ] **Step 3: Implement `fmt`**

Create `src/renderer/fmt.ts`:

```ts
const BOLD_RE = /\*\*([\s\S]+?)\*\*/g;
// em: a `*` not preceded by `*`, content without `*` or newline, closing `*` not followed by `*`
const EM_RE = /(?<!\*)\*([^*\n]+?)\*(?!\*)/g;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * HTML-escape text, then convert `**bold**`, `*em*`, and `\n` to inline HTML.
 * Output is raw HTML. Callers that pass output into Handlebars should use a
 * SafeString wrapper (see handlebars.ts).
 */
export function fmt(text: string | null | undefined): string {
  if (!text) return '';
  let out = escapeHtml(text);
  out = out.replace(BOLD_RE, (_m, inner: string) => `<strong>${inner}</strong>`);
  out = out.replace(EM_RE, (_m, inner: string) => `<em>${inner}</em>`);
  return out.replace(/\n/g, '<br/>');
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test tests/fmt.test.ts`
Expected: 11 tests pass.

- [ ] **Step 5: Commit**

```sh
git add src/renderer/fmt.ts tests/fmt.test.ts
git commit -m "Port fmt helper (bold, em, linebreak inline markup)"
```

---

### Task 4: Handlebars helper registration

**Files:**
- Create: `src/renderer/handlebars.ts`
- Create: `tests/handlebars.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/handlebars.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { compile } from '../src/renderer/handlebars.ts';

describe('handlebars helpers', () => {
  it('fmt helper emits safe HTML (no double-escape)', () => {
    const tpl = compile('{{fmt text}}');
    expect(tpl({ text: '**bold**' })).toBe('<strong>bold</strong>');
  });

  it('fmt helper escapes HTML in raw text', () => {
    const tpl = compile('{{fmt text}}');
    expect(tpl({ text: 'a < b' })).toBe('a &lt; b');
  });

  it('eq helper compares values', () => {
    const tpl = compile('{{#if (eq a b)}}yes{{else}}no{{/if}}');
    expect(tpl({ a: 1, b: 1 })).toBe('yes');
    expect(tpl({ a: 1, b: 2 })).toBe('no');
  });

  it('default helper returns fallback when value is missing', () => {
    const tpl = compile('{{default x "fallback"}}');
    expect(tpl({ x: 'value' })).toBe('value');
    expect(tpl({})).toBe('fallback');
    expect(tpl({ x: '' })).toBe('fallback');
    expect(tpl({ x: null })).toBe('fallback');
  });

  it('iterates lists with each', () => {
    const tpl = compile('{{#each items}}-{{this}}{{/each}}');
    expect(tpl({ items: ['a', 'b'] })).toBe('-a-b');
  });

  it('fmt applied per-item inside each', () => {
    const tpl = compile('{{#each items}}<li>{{fmt this}}</li>{{/each}}');
    expect(tpl({ items: ['**a**', 'b'] })).toBe('<li><strong>a</strong></li><li>b</li>');
  });

  it('compile caches repeated calls', () => {
    const src = '<p>{{x}}</p>';
    const a = compile(src);
    const b = compile(src);
    expect(a).toBe(b);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test tests/handlebars.test.ts`
Expected: FAIL with "Cannot find module '../src/renderer/handlebars.ts'".

- [ ] **Step 3: Implement handlebars setup**

Create `src/renderer/handlebars.ts`:

```ts
import Handlebars from 'handlebars';
import { fmt } from './fmt.ts';

// Use an isolated Handlebars environment so multiple render() calls in the
// same process don't accidentally share state with user code.
const env = Handlebars.create();

env.registerHelper('fmt', (value: unknown) => {
  const text = typeof value === 'string' ? value : value == null ? '' : String(value);
  return new env.SafeString(fmt(text));
});

env.registerHelper('eq', (a: unknown, b: unknown) => a === b);

env.registerHelper('default', (value: unknown, fallback: unknown) => {
  if (value === null || value === undefined || value === '') return fallback;
  return value;
});

type CompiledTemplate = (ctx: Record<string, unknown>) => string;

const cache = new Map<string, CompiledTemplate>();

export function compile(source: string): CompiledTemplate {
  const cached = cache.get(source);
  if (cached) return cached;
  const fn = env.compile(source, { noEscape: false, strict: false });
  cache.set(source, fn);
  return fn;
}

export { env as handlebars };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test tests/handlebars.test.ts`
Expected: 7 tests pass.

- [ ] **Step 5: Commit**

```sh
git add src/renderer/handlebars.ts tests/handlebars.test.ts
git commit -m "Set up isolated Handlebars env with fmt, eq, default helpers"
```

---

### Task 5: Field validation

Validates a slide's `data` against the referenced `SlideType.fields`. This is the runtime guard — if the data shape is off, interpolation gets garbage, so we throw early with a helpful message.

**Files:**
- Create: `src/renderer/validate.ts`
- Create: `tests/validate.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/validate.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { validate, ValidationError } from '../src/renderer/validate.ts';
import type { Field } from '../src/renderer/types.ts';

describe('validate', () => {
  it('accepts valid scalar data', () => {
    const fields: Field[] = [{ name: 'title', type: 'text' }];
    expect(() => validate({ title: 'Hello' }, fields)).not.toThrow();
  });

  it('accepts missing optional fields', () => {
    const fields: Field[] = [{ name: 'title', type: 'text' }];
    expect(() => validate({}, fields)).not.toThrow();
  });

  it('rejects missing required fields', () => {
    const fields: Field[] = [{ name: 'title', type: 'text', required: true }];
    expect(() => validate({}, fields)).toThrow(ValidationError);
    expect(() => validate({}, fields)).toThrow(/title/);
  });

  it('rejects wrong scalar type', () => {
    const fields: Field[] = [{ name: 'n', type: 'text' }];
    expect(() => validate({ n: 42 }, fields)).toThrow(/text/);
  });

  it('rejects wrong bool type', () => {
    const fields: Field[] = [{ name: 'b', type: 'bool' }];
    expect(() => validate({ b: 'yes' }, fields)).toThrow(/bool/);
  });

  it('accepts valid lists of scalars', () => {
    const fields: Field[] = [
      { name: 'bullets', type: 'list', items: { name: 'b', type: 'richtext' } },
    ];
    expect(() => validate({ bullets: ['a', 'b'] }, fields)).not.toThrow();
  });

  it('rejects list that is not an array', () => {
    const fields: Field[] = [
      { name: 'bullets', type: 'list', items: { name: 'b', type: 'richtext' } },
    ];
    expect(() => validate({ bullets: 'hello' }, fields)).toThrow(/list/);
  });

  it('validates nested group items in a list', () => {
    const fields: Field[] = [
      {
        name: 'cards',
        type: 'list',
        items: {
          name: 'card',
          type: 'group',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'body', type: 'richtext' },
          ],
        },
      },
    ];
    expect(() =>
      validate({ cards: [{ title: 'a', body: 'x' }, { title: 'b' }] }, fields),
    ).not.toThrow();
    expect(() => validate({ cards: [{ body: 'no title' }] }, fields)).toThrow(/title/);
  });

  it('rejects select values not in options', () => {
    const fields: Field[] = [
      { name: 'mark', type: 'select', options: ['green', 'violet'] },
    ];
    expect(() => validate({ mark: 'green' }, fields)).not.toThrow();
    expect(() => validate({ mark: 'red' }, fields)).toThrow(/mark/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test tests/validate.test.ts`
Expected: FAIL with "Cannot find module '../src/renderer/validate.ts'".

- [ ] **Step 3: Implement `validate`**

Create `src/renderer/validate.ts`:

```ts
import type { Field } from './types.ts';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function checkField(value: unknown, field: Field, path: string): void {
  const isEmpty =
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value === '') ||
    (Array.isArray(value) && value.length === 0);

  if (field.required && isEmpty) {
    throw new ValidationError(`Required field missing: ${path}`);
  }
  if (isEmpty) return;

  switch (field.type) {
    case 'text':
    case 'richtext':
    case 'markdown': {
      if (typeof value !== 'string') {
        throw new ValidationError(`Field ${path} must be text, got ${typeof value}`);
      }
      return;
    }
    case 'bool': {
      if (typeof value !== 'boolean') {
        throw new ValidationError(`Field ${path} must be bool, got ${typeof value}`);
      }
      return;
    }
    case 'select': {
      if (typeof value !== 'string' || !field.options?.includes(value)) {
        throw new ValidationError(
          `Field ${path} must be one of ${JSON.stringify(field.options ?? [])}, got ${JSON.stringify(value)}`,
        );
      }
      return;
    }
    case 'image': {
      if (typeof value !== 'string') {
        throw new ValidationError(`Field ${path} must be image (string ref), got ${typeof value}`);
      }
      return;
    }
    case 'list': {
      if (!Array.isArray(value)) {
        throw new ValidationError(`Field ${path} must be list, got ${typeof value}`);
      }
      if (!field.items) {
        throw new ValidationError(`List field ${path} missing 'items' schema`);
      }
      value.forEach((el, i) => {
        if (field.items!.type === 'group') {
          checkGroup(el, field.items!, `${path}[${i}]`);
        } else {
          checkField(el, field.items!, `${path}[${i}]`);
        }
      });
      return;
    }
    case 'group': {
      checkGroup(value, field, path);
      return;
    }
  }
}

function checkGroup(value: unknown, field: Field, path: string): void {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`Field ${path} must be an object, got ${typeof value}`);
  }
  if (!field.fields) {
    throw new ValidationError(`Group field ${path} missing 'fields' schema`);
  }
  const obj = value as Record<string, unknown>;
  for (const sub of field.fields) {
    checkField(obj[sub.name], sub, `${path}.${sub.name}`);
  }
}

export function validate(data: unknown, fields: Field[]): void {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new ValidationError('slide data must be an object');
  }
  const obj = data as Record<string, unknown>;
  for (const f of fields) {
    checkField(obj[f.name], f, f.name);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test tests/validate.test.ts`
Expected: 10 tests pass.

- [ ] **Step 5: Commit**

```sh
git add src/renderer/validate.ts tests/validate.test.ts
git commit -m "Add field validation with nested list/group support"
```

---

### Task 6: Theme CSS generation

Turns a `Theme.tokens` map into a `:root` block with CSS custom properties.

**Files:**
- Create: `src/renderer/theme-css.ts`
- Create: `tests/theme-css.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/theme-css.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { themeCss } from '../src/renderer/theme-css.ts';

describe('themeCss', () => {
  it('returns empty :root for empty tokens', () => {
    expect(themeCss({ name: 't', tokens: {} })).toBe(':root {\n}\n');
  });

  it('emits a single token', () => {
    expect(themeCss({ name: 't', tokens: { '--x': '#fff' } }))
      .toBe(':root {\n  --x: #fff;\n}\n');
  });

  it('emits multiple tokens in insertion order', () => {
    const css = themeCss({
      name: 't',
      tokens: { '--a': '1px', '--b': '2px' },
    });
    expect(css).toBe(':root {\n  --a: 1px;\n  --b: 2px;\n}\n');
  });

  it('throws on token name without leading --', () => {
    expect(() => themeCss({ name: 't', tokens: { 'bad': 'x' } }))
      .toThrow(/custom property/);
  });

  it('rejects values with semicolons (cheap injection guard)', () => {
    expect(() => themeCss({
      name: 't',
      tokens: { '--x': 'red; background: url(/evil)' },
    })).toThrow(/semicolon/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test tests/theme-css.test.ts`
Expected: FAIL with "Cannot find module '../src/renderer/theme-css.ts'".

- [ ] **Step 3: Implement `themeCss`**

Create `src/renderer/theme-css.ts`:

```ts
import type { Theme } from './types.ts';

export function themeCss(theme: Theme): string {
  const lines: string[] = [':root {'];
  for (const [key, value] of Object.entries(theme.tokens)) {
    if (!key.startsWith('--')) {
      throw new Error(`Theme token name must be a CSS custom property (start with "--"): ${key}`);
    }
    if (value.includes(';')) {
      throw new Error(`Theme token value must not contain semicolon: ${key} = ${value}`);
    }
    lines.push(`  ${key}: ${value};`);
  }
  lines.push('}', '');
  return lines.join('\n');
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test tests/theme-css.test.ts`
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```sh
git add src/renderer/theme-css.ts tests/theme-css.test.ts
git commit -m "Emit theme tokens as :root CSS custom properties"
```

---

### Task 7: CSS scoping with PostCSS

Auto-prefix every selector in a SlideType's `css` block with `.st-<name> `. Handles `@media` nested rules, leaves `:root`, `@font-face`, `@keyframes` alone. Drops `@import` and reports if dangerous properties show up (stub for Plan 5's full guardrails — here we only need the correctness piece).

**Files:**
- Create: `src/renderer/scope-css.ts`
- Create: `tests/scope-css.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/scope-css.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { scopeCss } from '../src/renderer/scope-css.ts';

describe('scopeCss', () => {
  it('prefixes a simple selector', async () => {
    const out = await scopeCss('.eyebrow { color: red; }', 'content');
    expect(out).toContain('.st-content .eyebrow');
  });

  it('prefixes multiple selectors in a comma list', async () => {
    const out = await scopeCss('.a, .b { color: red; }', 'c');
    expect(out).toContain('.st-c .a');
    expect(out).toContain('.st-c .b');
  });

  it('prefixes element selectors', async () => {
    const out = await scopeCss('h2 { font-size: 60px; }', 'content');
    expect(out).toContain('.st-content h2');
  });

  it('handles @media by prefixing inner rules', async () => {
    const out = await scopeCss('@media print { h2 { color: black; } }', 'c');
    expect(out).toMatch(/@media print\s*\{\s*\.st-c h2/);
  });

  it('leaves @font-face alone', async () => {
    const src = "@font-face { font-family: 'X'; src: url('x.woff2'); }";
    const out = await scopeCss(src, 'c');
    expect(out).toContain('@font-face');
    expect(out).not.toContain('.st-c @font-face');
  });

  it('leaves :root alone', async () => {
    const out = await scopeCss(':root { --x: 1; }', 'c');
    expect(out).toContain(':root');
    expect(out).not.toContain('.st-c :root');
  });

  it('throws on @import (security guard)', async () => {
    await expect(scopeCss("@import 'evil.css';", 'c')).rejects.toThrow(/@import/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test tests/scope-css.test.ts`
Expected: FAIL with "Cannot find module '../src/renderer/scope-css.ts'".

- [ ] **Step 3: Implement `scopeCss`**

Create `src/renderer/scope-css.ts`:

```ts
import postcss, { type Plugin } from 'postcss';

const LEAVE_ALONE_AT = new Set(['font-face', 'keyframes', 'page', 'counter-style']);

function scopePlugin(scope: string): Plugin {
  const prefix = `.st-${scope}`;
  return {
    postcssPlugin: 'scope-css',
    Once(root) {
      root.walkAtRules((rule) => {
        if (rule.name === 'import') {
          throw new Error('CSS @import is not allowed');
        }
      });
      root.walkRules((rule) => {
        // Skip rules inside untouched at-rules.
        let parent = rule.parent;
        while (parent && parent.type !== 'root') {
          if (parent.type === 'atrule' && LEAVE_ALONE_AT.has((parent as any).name)) {
            return;
          }
          parent = parent.parent;
        }

        // Don't prefix :root — it's global.
        rule.selectors = rule.selectors.map((sel) => {
          const s = sel.trim();
          if (s === ':root' || s === 'html' || s === 'body') return s;
          return `${prefix} ${s}`;
        });
      });
    },
  };
}
// Declare the plugin as a function plugin for postcss typing
(scopePlugin as unknown as { postcss: boolean }).postcss = true;

export async function scopeCss(css: string, scope: string): Promise<string> {
  const result = await postcss([scopePlugin(scope)]).process(css, { from: undefined });
  return result.css;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test tests/scope-css.test.ts`
Expected: 7 tests pass.

- [ ] **Step 5: Commit**

```sh
git add src/renderer/scope-css.ts tests/scope-css.test.ts
git commit -m "Add PostCSS-based CSS scoping for slide types"
```

---

### Task 8: Slide wrapping with page chrome

`wrapSlide(content, { name, pageNum, total })` wraps a SlideType's rendered HTML in `<section class="slide st-<name>">...</section>` and adds the corner logo + page counter (`03 / 17`).

**Files:**
- Create: `src/renderer/slide-wrap.ts`
- Create: `tests/slide-wrap.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/slide-wrap.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { wrapSlide } from '../src/renderer/slide-wrap.ts';

describe('wrapSlide', () => {
  it('wraps content in a <section class="slide st-<name>">', () => {
    const out = wrapSlide('<h2>Hello</h2>', { name: 'title', pageNum: 1, total: 3 });
    expect(out).toContain('<section class="slide st-title">');
    expect(out).toContain('<h2>Hello</h2>');
    expect(out).toMatch(/<\/section>\s*$/);
  });

  it('includes the page counter', () => {
    const out = wrapSlide('<div />', { name: 'content', pageNum: 3, total: 17 });
    expect(out).toContain('<div class="page-num">03 / 17</div>');
  });

  it('zero-pads page numbers', () => {
    const out = wrapSlide('<div />', { name: 'content', pageNum: 1, total: 9 });
    expect(out).toContain('>01 / 09<');
  });

  it('includes the corner logo unless opted out', () => {
    const out = wrapSlide('<div />', { name: 'content', pageNum: 1, total: 1 });
    expect(out).toContain('class="corner-logo"');
  });

  it('omits the corner logo when showCorner is false', () => {
    const out = wrapSlide('<div />', { name: 'section', pageNum: 1, total: 1, showCorner: false });
    expect(out).not.toContain('corner-logo');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test tests/slide-wrap.test.ts`
Expected: FAIL with "Cannot find module '../src/renderer/slide-wrap.ts'".

- [ ] **Step 3: Implement `wrapSlide`**

Create `src/renderer/slide-wrap.ts`:

```ts
export interface WrapOptions {
  name: string;
  pageNum: number;
  total: number;
  /** Section-divider slides drop the corner logo. Default true. */
  showCorner?: boolean;
}

const CORNER = '<div class="corner-logo"><span>OS &amp;</span><span>DATA</span></div>';

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function wrapSlide(content: string, opts: WrapOptions): string {
  const showCorner = opts.showCorner !== false;
  const counter = `<div class="page-num">${pad2(opts.pageNum)} / ${pad2(opts.total)}</div>`;
  const corner = showCorner ? CORNER : '';
  return `<section class="slide st-${opts.name}">\n${content}\n${corner}${counter}\n</section>`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test tests/slide-wrap.test.ts`
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```sh
git add src/renderer/slide-wrap.ts tests/slide-wrap.test.ts
git commit -m "Wrap slide content with page chrome (corner logo + page counter)"
```

---

### Task 9: Base styles + page shell

`baseStyles` is a module-level string constant with the global stylesheet — `@page`, `html`/`body`, `.slide` base, `.corner-logo`, `.page-num`. It's the piece that all slide types share. Ported from the head of `styles.css`.

`pageShell(lang, title, css, body)` produces the final `<!doctype html>...` wrapper.

**Files:**
- Create: `src/renderer/base-styles.ts`
- Create: `src/renderer/page-shell.ts`
- Create: `tests/page-shell.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/page-shell.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { pageShell } from '../src/renderer/page-shell.ts';

describe('pageShell', () => {
  it('produces a valid HTML document', () => {
    const out = pageShell({
      lang: 'da',
      title: 'Test',
      css: 'body { margin: 0; }',
      body: '<section>one</section>',
    });
    expect(out).toMatch(/^<!doctype html>/i);
    expect(out).toContain('<html lang="da">');
    expect(out).toContain('<title>Test</title>');
    expect(out).toContain('<style>body { margin: 0; }</style>');
    expect(out).toContain('<section>one</section>');
  });

  it('escapes title', () => {
    const out = pageShell({
      lang: 'da',
      title: '<script>',
      css: '',
      body: '',
    });
    expect(out).toContain('<title>&lt;script&gt;</title>');
    expect(out).not.toContain('<title><script>');
  });

  it('escapes lang', () => {
    const out = pageShell({
      lang: 'da"><script>',
      title: 'T',
      css: '',
      body: '',
    });
    expect(out).not.toContain('<script>');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test tests/page-shell.test.ts`
Expected: FAIL with "Cannot find module '../src/renderer/page-shell.ts'".

- [ ] **Step 3: Write `src/renderer/base-styles.ts`**

Create `src/renderer/base-styles.ts` (this is the global stylesheet — a port of the "base" half of the existing `styles.css`):

```ts
/**
 * Global stylesheet included in every rendered deck. Covers:
 *   - @page size (1920x1080)
 *   - html/body reset
 *   - .slide base (the 1920x1080 frame)
 *   - .corner-logo
 *   - .page-num
 *   - .eyebrow
 *   - Shared typography defaults
 *
 * Per-slide-type styles live in each SlideType.css and are auto-scoped to
 * `.st-<name>` at render time. Fonts are expected to be loaded by the host
 * (Plan 2 serves them from /fonts).
 */
export const baseStyles = `
@page { size: 1920px 1080px; margin: 0; }

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  width: 1920px;
  background: var(--ood-big-cloud);
  font-family: 'Inter', sans-serif;
  font-weight: 300;
  color: var(--ood-dark-matter);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.slide {
  width: 1920px;
  height: 1080px;
  position: relative;
  overflow: hidden;
  page-break-after: always;
  break-after: page;
  display: flex;
  padding: 80px 120px;
  background: var(--ood-big-cloud);
}

.corner-logo {
  position: absolute;
  right: 60px;
  bottom: 60px;
  font-family: 'Neureal Mono', monospace;
  font-size: 14px;
  line-height: 1.15;
  color: var(--ood-dark-matter-light);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.page-num {
  position: absolute;
  left: 60px;
  bottom: 60px;
  font-family: 'Neureal Mono', monospace;
  font-size: 12px;
  color: var(--ood-dark-matter-light);
}

.eyebrow {
  font-family: 'Neureal Mono', monospace;
  font-size: 18px;
  letter-spacing: 0.1em;
  color: var(--ood-deep-violet);
  margin-bottom: 24px;
}
`;
```

Note: this is a minimal port. When Task 15 runs the full golden test against the ANTAL deck, the engineer should copy additional shared rules from the original `styles.css` into `baseStyles` as needed — anything referenced by multiple slide types or by page chrome. The original file is at `/home/niec/ogtal.onedrive/osogdata/møde_bilag/antal-diskussion-april-2026/slides/styles.css`.

- [ ] **Step 4: Write `src/renderer/page-shell.ts`**

Create `src/renderer/page-shell.ts`:

```ts
function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface PageShellOptions {
  lang: string;
  title: string;
  css: string;
  body: string;
}

export function pageShell(opts: PageShellOptions): string {
  return `<!doctype html>
<html lang="${escape(opts.lang)}">
<head>
<meta charset="utf-8" />
<title>${escape(opts.title)}</title>
<style>${opts.css}</style>
</head>
<body>
${opts.body}
</body>
</html>
`;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test tests/page-shell.test.ts`
Expected: 3 tests pass.

- [ ] **Step 6: Commit**

```sh
git add src/renderer/base-styles.ts src/renderer/page-shell.ts tests/page-shell.test.ts
git commit -m "Add baseStyles global stylesheet and pageShell document wrapper"
```

---

### Task 10: Core `render()` function

Ties everything together: for each slide in the deck, looks up its SlideType, validates data, interpolates the Handlebars template, wraps with page chrome. Assembles base styles + theme + per-type scoped CSS into one `<style>` block. Handles the auto-appended appendix-list slide.

**Files:**
- Create: `src/renderer/index.ts`
- Create: `tests/render.test.ts`

- [ ] **Step 1: Write failing tests (using a minimal made-up slide type, before the real ones are seeded)**

Create `tests/render.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { render } from '../src/renderer/index.ts';
import type { Deck, SlideType, Theme } from '../src/renderer/types.ts';

const minimalType: SlideType = {
  name: 'test',
  label: 'Test',
  fields: [{ name: 'title', type: 'text', required: true }],
  htmlTemplate: '<h1>{{fmt title}}</h1>',
  css: 'h1 { color: red; }',
};

const emptyTheme: Theme = { name: 'empty', tokens: {} };

describe('render', () => {
  it('renders a single-slide deck', async () => {
    const deck: Deck = {
      title: 'Doc',
      lang: 'da',
      slides: [{ typeName: 'test', data: { title: 'Hello' } }],
    };
    const html = await render(deck, emptyTheme, [minimalType]);
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<section class="slide st-test">');
    expect(html).toContain('<h1>Hello</h1>');
  });

  it('includes scoped CSS for used slide types', async () => {
    const deck: Deck = {
      title: 'Doc',
      lang: 'da',
      slides: [{ typeName: 'test', data: { title: 'Hi' } }],
    };
    const html = await render(deck, emptyTheme, [minimalType]);
    expect(html).toContain('.st-test h1');
  });

  it('includes theme tokens as :root block', async () => {
    const deck: Deck = {
      title: 'Doc',
      lang: 'da',
      slides: [{ typeName: 'test', data: { title: 'Hi' } }],
    };
    const theme: Theme = { name: 't', tokens: { '--c': 'red' } };
    const html = await render(deck, theme, [minimalType]);
    expect(html).toContain(':root');
    expect(html).toContain('--c: red');
  });

  it('numbers slides correctly', async () => {
    const deck: Deck = {
      title: 'Doc',
      lang: 'da',
      slides: [
        { typeName: 'test', data: { title: 'A' } },
        { typeName: 'test', data: { title: 'B' } },
        { typeName: 'test', data: { title: 'C' } },
      ],
    };
    const html = await render(deck, emptyTheme, [minimalType]);
    expect(html).toContain('>01 / 03<');
    expect(html).toContain('>02 / 03<');
    expect(html).toContain('>03 / 03<');
  });

  it('throws if a slide references an unknown type', async () => {
    const deck: Deck = {
      title: 'Doc',
      lang: 'da',
      slides: [{ typeName: 'missing', data: {} }],
    };
    await expect(render(deck, emptyTheme, [minimalType])).rejects.toThrow(/missing/);
  });

  it('throws if required data is missing', async () => {
    const deck: Deck = {
      title: 'Doc',
      lang: 'da',
      slides: [{ typeName: 'test', data: {} }],
    };
    await expect(render(deck, emptyTheme, [minimalType])).rejects.toThrow(/title/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test tests/render.test.ts`
Expected: FAIL with "Cannot find module '../src/renderer/index.ts'".

- [ ] **Step 3: Implement `render`**

Create `src/renderer/index.ts`:

```ts
import type { Deck, SlideType, Theme, Slide, RenderOptions } from './types.ts';
import { compile } from './handlebars.ts';
import { validate } from './validate.ts';
import { themeCss } from './theme-css.ts';
import { scopeCss } from './scope-css.ts';
import { wrapSlide } from './slide-wrap.ts';
import { pageShell } from './page-shell.ts';
import { baseStyles } from './base-styles.ts';

export * from './types.ts';

export async function render(
  deck: Deck,
  theme: Theme,
  templates: SlideType[],
  options: RenderOptions = {},
): Promise<string> {
  const byName = new Map(templates.map((t) => [t.name, t]));
  const slides = buildSlideList(deck, options);
  const usedTypeNames = new Set<string>();

  const slideHtml: string[] = [];
  const total = slides.length;
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]!;
    const type = byName.get(slide.typeName);
    if (!type) {
      throw new Error(`Unknown slide type: ${slide.typeName}`);
    }
    usedTypeNames.add(type.name);
    validate(slide.data, type.fields);
    const tpl = compile(type.htmlTemplate);
    const inner = tpl(slide.data);
    slideHtml.push(
      wrapSlide(inner, {
        name: type.name,
        pageNum: i + 1,
        total,
        showCorner: type.name !== 'section',
      }),
    );
  }

  const perTypeCss: string[] = [];
  for (const name of usedTypeNames) {
    const type = byName.get(name)!;
    if (type.css.trim()) {
      perTypeCss.push(await scopeCss(type.css, name));
    }
  }

  const css = [themeCss(theme), baseStyles, ...perTypeCss].join('\n');

  return pageShell({
    lang: deck.lang,
    title: deck.title,
    css,
    body: slideHtml.join('\n\n'),
  });
}

function buildSlideList(deck: Deck, options: RenderOptions): Slide[] {
  const slides: Slide[] = [...deck.slides];
  if (!options.skipAppendixList && deck.appendix && deck.appendix.length > 0) {
    slides.push({
      typeName: 'appendix-list',
      data: {
        eyebrow: deck.appendixEyebrow ?? 'Bilag',
        title: deck.appendixTitle ?? 'Tilhørende materiale',
        items: deck.appendix,
      },
    });
  }
  return slides;
}
```

Also update the public API — overwrite `src/index.ts`:

```ts
export * from './renderer/index.ts';
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test tests/render.test.ts`
Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```sh
git add src/renderer/index.ts src/index.ts tests/render.test.ts
git commit -m "Add render() tying together validate, compile, scope, and wrap"
```

---

### Task 11: Built-in slide types (batch 1 — simple layouts)

Port 4 slide types that have the simplest shape: `title`, `closing`, `section`, `agenda`. Each gets its own module.

**Source of truth:** read the corresponding `tmpl_*` functions in `/home/niec/ogtal.onedrive/osogdata/møde_bilag/antal-diskussion-april-2026/slides/generate.py` and the matching CSS rules in `/home/niec/ogtal.onedrive/osogdata/møde_bilag/antal-diskussion-april-2026/slides/styles.css` before writing the Handlebars + CSS ports. The HTML structure should be preserved; selectors that were nested under `.title-slide`, `.agenda`, etc. in the original CSS become flat (the auto-scoper prepends `.st-title` etc.).

**Files:**
- Create: `src/slide-types/title.ts`
- Create: `src/slide-types/closing.ts`
- Create: `src/slide-types/section.ts`
- Create: `src/slide-types/agenda.ts`
- Create: `tests/slide-types.test.ts`

- [ ] **Step 1: Write failing parametrized tests**

Create `tests/slide-types.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { render } from '../src/renderer/index.ts';
import { title } from '../src/slide-types/title.ts';
import { closing } from '../src/slide-types/closing.ts';
import { section } from '../src/slide-types/section.ts';
import { agenda } from '../src/slide-types/agenda.ts';
import type { Deck, Theme, SlideType } from '../src/renderer/types.ts';

const emptyTheme: Theme = { name: 'empty', tokens: {} };

async function renderOne(type: SlideType, data: Record<string, unknown>): Promise<string> {
  const deck: Deck = {
    title: 'T',
    lang: 'da',
    slides: [{ typeName: type.name, data }],
  };
  return render(deck, emptyTheme, [type]);
}

describe('title slide type', () => {
  it('renders eyebrow, title, titleAlt, kicker, and a mark', async () => {
    const html = await renderOne(title, {
      eyebrow: 'Diskussionsoplæg',
      title: 'ANTAL',
      titleAlt: 'og Theta',
      kicker: 'Hvordan ANTAL passer ind',
      mark: 'dandelion-green',
    });
    expect(html).toContain('Diskussionsoplæg');
    expect(html).toContain('ANTAL');
    expect(html).toContain('og Theta');
    expect(html).toContain('Hvordan ANTAL passer ind');
    expect(html).toContain('ood-mark-green.svg');
  });

  it('falls back to violet mark when none specified', async () => {
    const html = await renderOne(title, {
      title: 'X',
      titleAlt: 'Y',
    });
    expect(html).toContain('ood-mark-violet.svg');
  });
});

describe('closing slide type', () => {
  it('renders title and optional subtitle', async () => {
    const html = await renderOne(closing, { title: 'Tak', subtitle: 'for i dag' });
    expect(html).toContain('Tak');
    expect(html).toContain('for i dag');
  });
});

describe('section slide type', () => {
  it('renders bigMark, title, subtitle and omits corner logo', async () => {
    const html = await renderOne(section, {
      bigMark: 'ϑ',
      title: 'Theta',
      subtitle: 'into the picture',
    });
    expect(html).toContain('ϑ');
    expect(html).toContain('Theta');
    expect(html).toContain('into the picture');
    expect(html).not.toContain('corner-logo');
  });
});

describe('agenda slide type', () => {
  it('renders title and ordered list of items', async () => {
    const html = await renderOne(agenda, {
      title: 'Indhold',
      items: ['Recap', 'Helikopter', 'Theta'],
    });
    expect(html).toContain('Indhold');
    expect(html).toContain('<li>Recap</li>');
    expect(html).toContain('<li>Helikopter</li>');
    expect(html).toContain('<li>Theta</li>');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test tests/slide-types.test.ts`
Expected: FAIL with "Cannot find module '../src/slide-types/title.ts'".

- [ ] **Step 3: Implement `title`**

Asset URL selection inside Handlebars is awkward, so the pattern is: callers resolve `mark` to an absolute `markUrl` before handing the slide to `render()`. The `TITLE_MARKS` export gives them the lookup table. The template uses `{{default markUrl "..."}}` with the violet mark as fallback.

Create `src/slide-types/title.ts`:

```ts
import type { SlideType } from '../renderer/types.ts';

export const TITLE_MARKS: Record<string, string> = {
  'dandelion-green': 'assets/ood-mark-green.svg',
  'dandelion-violet': 'assets/ood-mark-violet.svg',
  'dandelion-white': 'assets/ood-mark.svg',
};

export const title: SlideType = {
  name: 'title',
  label: 'Title slide',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext', required: true },
    { name: 'titleAlt', type: 'richtext' },
    { name: 'kicker', type: 'text' },
    { name: 'mark', type: 'select', options: Object.keys(TITLE_MARKS), default: 'dandelion-violet' },
    { name: 'markUrl', type: 'text' },
  ],
  htmlTemplate: `<div class="title-col">
  <div class="eyebrow">{{fmt eyebrow}}</div>
  <h1>{{fmt title}}<br/><span class="alt">{{fmt titleAlt}}</span></h1>
  <p class="kicker">{{fmt kicker}}</p>
</div>
<div class="dandelion">
  <img src="{{default markUrl "assets/ood-mark-violet.svg"}}" alt="" />
</div>`,
  css: `.title-col { flex: 1; }
h1 { font-family: 'Neureal', sans-serif; font-size: 180px; line-height: 0.95; }
.alt { color: var(--ood-deep-violet); }
.kicker { font-size: 32px; margin-top: 32px; max-width: 900px; }
.dandelion { flex: 0 0 600px; display: flex; align-items: center; justify-content: center; }
.dandelion img { width: 500px; height: auto; }`,
};
```

Also update the tests to pass `markUrl` through (the "renders eyebrow, title..." test uses the green mark). Replace the first test in `tests/slide-types.test.ts` with:

```ts
  it('renders eyebrow, title, titleAlt, kicker, and a mark', async () => {
    const html = await renderOne(title, {
      eyebrow: 'Diskussionsoplæg',
      title: 'ANTAL',
      titleAlt: 'og Theta',
      kicker: 'Hvordan ANTAL passer ind',
      mark: 'dandelion-green',
      markUrl: 'assets/ood-mark-green.svg',
    });
    expect(html).toContain('Diskussionsoplæg');
    expect(html).toContain('ANTAL');
    expect(html).toContain('og Theta');
    expect(html).toContain('Hvordan ANTAL passer ind');
    expect(html).toContain('ood-mark-green.svg');
  });
```

The "falls back" test is already correct as written above — when `markUrl` is absent, the template's `{{default}}` fallback produces `ood-mark-violet.svg`.

- [ ] **Step 4: Implement `closing`**

Create `src/slide-types/closing.ts`:

```ts
import type { SlideType } from '../renderer/types.ts';

export const closing: SlideType = {
  name: 'closing',
  label: 'Closing slide',
  fields: [
    { name: 'title', type: 'richtext', required: true },
    { name: 'subtitle', type: 'richtext' },
  ],
  htmlTemplate: `<h1>{{fmt title}}</h1>
<p>{{fmt subtitle}}</p>`,
  css: `& { flex-direction: column; align-items: center; justify-content: center; text-align: center; }
h1 { font-family: 'Neureal', sans-serif; font-size: 220px; }
p { font-size: 36px; margin-top: 32px; color: var(--ood-dark-matter-light); }`,
};
```

Note: `& { ... }` is a CSS Nesting Level-4 syntax that means "the scope root itself". PostCSS doesn't implement nesting by default — we'll convert leading `& {` into a rule targeting `.st-<name>` directly during scoping. Update `src/renderer/scope-css.ts` to handle this:

Add the following inside the `Once(root)` callback in `scope-css.ts`, before the `walkRules` loop:

```ts
      // Translate leading "& { ... }" (scope-root selector) into the bare
      // prefix so the walker below doesn't prepend twice.
      root.walkRules((rule) => {
        rule.selectors = rule.selectors.map((s) =>
          s.trim() === '&' ? '__SCOPE_ROOT__' : s,
        );
      });
```

And change the selector mapping inside the existing `walkRules`:

```ts
        rule.selectors = rule.selectors.map((sel) => {
          const s = sel.trim();
          if (s === ':root' || s === 'html' || s === 'body') return s;
          if (s === '__SCOPE_ROOT__') return prefix;
          return `${prefix} ${s}`;
        });
```

Add a test for `&` handling in `tests/scope-css.test.ts`:

```ts
  it('treats "&" as the scope root', async () => {
    const out = await scopeCss('& { flex-direction: column; }', 'closing');
    expect(out).toContain('.st-closing {');
    expect(out).not.toContain('.st-closing & {');
  });
```

- [ ] **Step 5: Implement `section`**

Create `src/slide-types/section.ts`:

```ts
import type { SlideType } from '../renderer/types.ts';

export const section: SlideType = {
  name: 'section',
  label: 'Section divider',
  fields: [
    { name: 'bigMark', type: 'text', required: true },
    { name: 'title', type: 'richtext', required: true },
    { name: 'subtitle', type: 'richtext' },
  ],
  htmlTemplate: `<div class="num-col">
  <div class="big-num">{{fmt bigMark}}</div>
</div>
<div class="title-col">
  <div>
    <h2>{{fmt title}}</h2>
    <span class="subtitle">{{fmt subtitle}}</span>
  </div>
</div>`,
  css: `& { background: var(--ood-dark-matter); color: var(--ood-big-cloud); }
.num-col { flex: 1; display: flex; align-items: center; justify-content: center; }
.big-num { font-family: 'Neureal', sans-serif; font-size: 400px; color: var(--ood-deep-violet-light); line-height: 1; }
.title-col { flex: 1; display: flex; align-items: center; }
h2 { font-size: 120px; line-height: 1; }
.subtitle { font-size: 28px; color: var(--ood-dark-matter-bright); margin-top: 24px; display: block; }`,
};
```

- [ ] **Step 6: Implement `agenda`**

Create `src/slide-types/agenda.ts`:

```ts
import type { SlideType } from '../renderer/types.ts';

export const agenda: SlideType = {
  name: 'agenda',
  label: 'Agenda',
  fields: [
    { name: 'title', type: 'richtext', required: true },
    {
      name: 'items',
      type: 'list',
      required: true,
      items: { name: 'item', type: 'richtext' },
    },
  ],
  htmlTemplate: `<div style="width:100%;">
  <h1>{{fmt title}}</h1>
  <ol>
    {{#each items}}<li>{{fmt this}}</li>{{/each}}
  </ol>
</div>`,
  css: `h1 { font-family: 'Neureal', sans-serif; font-size: 120px; margin-bottom: 60px; }
ol { counter-reset: item; list-style: none; font-size: 44px; line-height: 1.4; }
ol li { counter-increment: item; padding-left: 80px; position: relative; margin-bottom: 16px; }
ol li::before { content: counter(item, decimal-leading-zero); position: absolute; left: 0; color: var(--ood-deep-violet); font-family: 'Neureal Mono', monospace; font-size: 32px; top: 8px; }`,
};
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `pnpm test`
Expected: all previous tests still pass, and the 6 new slide-type tests (title×2, closing×1, section×1, agenda×1) plus the `&` scope-css test pass.

- [ ] **Step 8: Commit**

```sh
git add src/slide-types/title.ts src/slide-types/closing.ts src/slide-types/section.ts src/slide-types/agenda.ts src/renderer/scope-css.ts tests/slide-types.test.ts tests/scope-css.test.ts
git commit -m "Port 4 built-in slide types (title, closing, section, agenda) + & CSS support"
```

---

### Task 12: Built-in slide types (batch 2 — content and lists)

Port `content`, `principles`, `discussion`, `values`. These have list and group structures.

**Files:**
- Create: `src/slide-types/content.ts`
- Create: `src/slide-types/principles.ts`
- Create: `src/slide-types/discussion.ts`
- Create: `src/slide-types/values.ts`
- Modify: `tests/slide-types.test.ts` (add describes)

- [ ] **Step 1: Write failing tests — append to `tests/slide-types.test.ts`**

Append to `tests/slide-types.test.ts`:

```ts
import { content } from '../src/slide-types/content.ts';
import { principles } from '../src/slide-types/principles.ts';
import { discussion } from '../src/slide-types/discussion.ts';
import { values } from '../src/slide-types/values.ts';

describe('content slide type', () => {
  it('renders eyebrow, title, and bullets', async () => {
    const html = await renderOne(content, {
      eyebrow: 'Recap',
      title: 'Hvad er ANTAL?',
      bullets: ['**ANTAL** er en forening', 'F.M.B.A. stiftet i 2022'],
    });
    expect(html).toContain('Recap');
    expect(html).toContain('Hvad er ANTAL?');
    expect(html).toContain('<strong>ANTAL</strong>');
    expect(html).toContain('F.M.B.A. stiftet i 2022');
  });
});

describe('principles slide type', () => {
  it('renders an ordered list of {title, body} items', async () => {
    const html = await renderOne(principles, {
      eyebrow: 'Værdi',
      title: 'De syv principper',
      items: [
        { title: 'Demokratisk', body: 'Medlemmer skal være...' },
        { title: 'Flad ledelse', body: 'Lige og direkte...' },
      ],
    });
    expect(html).toContain('Demokratisk');
    expect(html).toContain('Medlemmer skal være');
    expect(html).toContain('Flad ledelse');
  });
});

describe('discussion slide type', () => {
  it('renders letter-marked items', async () => {
    const html = await renderOne(discussion, {
      eyebrow: 'Diskussion',
      title: 'Fire spørgsmål',
      items: [
        { letter: 'A', text: 'Hvordan...?' },
        { letter: 'B', text: 'Hvorfor...?' },
      ],
    });
    expect(html).toContain('data-q="A"');
    expect(html).toContain('Hvordan');
    expect(html).toContain('data-q="B"');
  });
});

describe('values slide type', () => {
  it('renders two columns each with heading + items', async () => {
    const html = await renderOne(values, {
      eyebrow: 'Princip 5',
      title: 'De fælles værdier',
      columns: [
        { heading: 'Skal leve op til:', items: ['Lige ret', 'Klima'] },
        { heading: 'Ikke være:', items: ['Negative', 'Grønne'] },
      ],
    });
    expect(html).toContain('Skal leve op til');
    expect(html).toContain('Lige ret');
    expect(html).toContain('Ikke være');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test tests/slide-types.test.ts`
Expected: FAIL with "Cannot find module '../src/slide-types/content.ts'".

- [ ] **Step 3: Implement `content`**

Create `src/slide-types/content.ts`:

```ts
import type { SlideType } from '../renderer/types.ts';

export const content: SlideType = {
  name: 'content',
  label: 'Bullet list with title',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext' },
    {
      name: 'bullets',
      type: 'list',
      required: true,
      items: { name: 'bullet', type: 'richtext' },
    },
  ],
  htmlTemplate: `<div class="content">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <ul>
    {{#each bullets}}<li>{{fmt this}}</li>{{/each}}
  </ul>
</div>`,
  css: `.content { max-width: 1400px; }
h2 { font-family: 'Neureal', sans-serif; font-size: 72px; line-height: 1.05; margin-bottom: 48px; }
ul { list-style: disc; padding-left: 40px; font-size: 32px; line-height: 1.45; }
ul li { margin-bottom: 20px; }
ul li::marker { color: var(--ood-deep-violet); }`,
};
```

- [ ] **Step 4: Implement `principles`**

Create `src/slide-types/principles.ts`:

```ts
import type { SlideType } from '../renderer/types.ts';

export const principles: SlideType = {
  name: 'principles',
  label: 'Numbered principles list',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext' },
    {
      name: 'items',
      type: 'list',
      required: true,
      items: {
        name: 'principle',
        type: 'group',
        fields: [
          { name: 'title', type: 'richtext', required: true },
          { name: 'body', type: 'richtext', required: true },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="content">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <ol class="principle-list">
    {{#each items}}<li><span><span class="p-title">{{fmt title}}</span> {{fmt body}}</span></li>{{/each}}
  </ol>
</div>`,
  css: `.content { max-width: 1600px; }
h2 { font-family: 'Neureal', sans-serif; font-size: 72px; margin-bottom: 48px; }
.principle-list { counter-reset: p; list-style: none; font-size: 26px; line-height: 1.4; }
.principle-list li { counter-increment: p; padding-left: 80px; position: relative; margin-bottom: 20px; }
.principle-list li::before { content: counter(p, decimal-leading-zero); position: absolute; left: 0; top: 0; color: var(--ood-deep-violet); font-family: 'Neureal Mono', monospace; font-size: 22px; }
.p-title { font-weight: 500; color: var(--ood-dark-matter); }`,
};
```

- [ ] **Step 5: Implement `discussion`**

Create `src/slide-types/discussion.ts`:

```ts
import type { SlideType } from '../renderer/types.ts';

export const discussion: SlideType = {
  name: 'discussion',
  label: 'Discussion questions',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext' },
    {
      name: 'items',
      type: 'list',
      required: true,
      items: {
        name: 'question',
        type: 'group',
        fields: [
          { name: 'letter', type: 'text', required: true },
          { name: 'text', type: 'richtext', required: true },
        ],
      },
    },
  ],
  htmlTemplate: `{{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
{{#if title}}<h2>{{fmt title}}</h2>{{/if}}
<ol class="q-list">
  {{#each items}}<li data-q="{{fmt letter}}"><span>{{fmt text}}</span></li>{{/each}}
</ol>`,
  css: `& { flex-direction: column; }
h2 { font-family: 'Neureal', sans-serif; font-size: 80px; margin-bottom: 48px; }
.q-list { list-style: none; display: grid; grid-template-columns: 80px 1fr; gap: 24px 40px; font-size: 28px; }
.q-list li { display: contents; }
.q-list li::before { content: attr(data-q); color: var(--ood-deep-violet); font-family: 'Neureal Mono', monospace; font-size: 48px; }`,
};
```

- [ ] **Step 6: Implement `values`**

Create `src/slide-types/values.ts`:

```ts
import type { SlideType } from '../renderer/types.ts';

export const values: SlideType = {
  name: 'values',
  label: 'Two-column values',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext' },
    {
      name: 'columns',
      type: 'list',
      required: true,
      items: {
        name: 'column',
        type: 'group',
        fields: [
          { name: 'heading', type: 'richtext', required: true },
          {
            name: 'items',
            type: 'list',
            required: true,
            items: { name: 'value', type: 'richtext' },
          },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="content">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <div class="values-grid">
    {{#each columns}}<div class="v-col">
      <h3>{{fmt heading}}</h3>
      <ul>{{#each items}}<li>{{fmt this}}</li>{{/each}}</ul>
    </div>{{/each}}
  </div>
</div>`,
  css: `.content { max-width: 1700px; }
h2 { font-family: 'Neureal', sans-serif; font-size: 64px; margin-bottom: 40px; }
.values-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; }
.v-col h3 { font-size: 24px; font-weight: 500; color: var(--ood-deep-violet); margin-bottom: 20px; }
.v-col ul { list-style: disc; padding-left: 32px; font-size: 22px; line-height: 1.4; }
.v-col li { margin-bottom: 12px; }`,
};
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `pnpm test`
Expected: all tests from prior tasks still pass + 4 new slide-type tests pass.

- [ ] **Step 8: Commit**

```sh
git add src/slide-types/content.ts src/slide-types/principles.ts src/slide-types/discussion.ts src/slide-types/values.ts tests/slide-types.test.ts
git commit -m "Port 4 more built-in slide types (content, principles, discussion, values)"
```

---

### Task 13: Built-in slide types (batch 3 — cards and comparisons)

Port `reserve`, `purposes`, `ownership`, `friction`. These have mixed layouts.

**Files:**
- Create: `src/slide-types/reserve.ts`
- Create: `src/slide-types/purposes.ts`
- Create: `src/slide-types/ownership.ts`
- Create: `src/slide-types/friction.ts`
- Modify: `tests/slide-types.test.ts`

- [ ] **Step 1: Write failing tests — append to `tests/slide-types.test.ts`**

Append to `tests/slide-types.test.ts`:

```ts
import { reserve } from '../src/slide-types/reserve.ts';
import { purposes } from '../src/slide-types/purposes.ts';
import { ownership } from '../src/slide-types/ownership.ts';
import { friction } from '../src/slide-types/friction.ts';

describe('reserve slide type', () => {
  it('renders title, paragraphs, and callout', async () => {
    const html = await renderOne(reserve, {
      eyebrow: 'Princip 6',
      title: 'Udelelig reserve',
      paragraphs: ['Bygger på fællesøkonomi.', 'Må ikke udbetales.'],
      callout: 'Aldrig som udbytte.',
    });
    expect(html).toContain('Udelelig reserve');
    expect(html).toContain('Bygger på fællesøkonomi');
    expect(html).toContain('Aldrig som udbytte');
  });
});

describe('purposes slide type', () => {
  it('renders a grid of numbered cards', async () => {
    const html = await renderOne(purposes, {
      eyebrow: 'Helikopter',
      title: 'Fire formål',
      cards: [
        { num: '01', title: 'Stordrift', body: 'Delt IT' },
        { num: '02', title: 'Fællesskab', body: 'Metoder' },
      ],
    });
    expect(html).toContain('01');
    expect(html).toContain('Stordrift');
    expect(html).toContain('Delt IT');
  });
});

describe('ownership slide type', () => {
  it('renders a source line and three cards', async () => {
    const html = await renderOne(ownership, {
      eyebrow: 'Theta',
      title: 'Demokratisk organisering',
      source: 'F.M.B.A.-struktur.',
      cards: [
        { title: 'Foreningen', sub: 'medlemmer', body: 'Alle medlemmer.' },
        { title: 'Repræsentantskab', sub: '99 personer', body: 'Legitimitet.' },
        { title: 'Bestyrelse', sub: '8–12', body: 'Valgte.' },
      ],
    });
    expect(html).toContain('F.M.B.A.-struktur');
    expect(html).toContain('Foreningen');
    expect(html).toContain('99 personer');
  });
});

describe('friction slide type', () => {
  it('renders two sides and a question', async () => {
    const html = await renderOne(friction, {
      eyebrow: 'Friktion 1',
      title: 'Medarbejdereje?',
      sideA: {
        label: 'ANTAL',
        head: 'Medlemsvirksomheder er medarbejderejede.',
        body: ['Fundament.'],
      },
      sideB: {
        label: 'Theta',
        head: 'Forbrugereje.',
        body: ['Ejes af brugerne.'],
      },
      question: 'Hvad er forholdet?',
    });
    expect(html).toContain('Medarbejdereje');
    expect(html).toContain('ANTAL');
    expect(html).toContain('Fundament');
    expect(html).toContain('Theta');
    expect(html).toContain('Ejes af brugerne');
    expect(html).toContain('Hvad er forholdet');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test tests/slide-types.test.ts`
Expected: FAIL with "Cannot find module '../src/slide-types/reserve.ts'".

- [ ] **Step 3: Implement `reserve`**

Create `src/slide-types/reserve.ts`:

```ts
import type { SlideType } from '../renderer/types.ts';

export const reserve: SlideType = {
  name: 'reserve',
  label: 'Two-column reserve / callout',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext', required: true },
    {
      name: 'paragraphs',
      type: 'list',
      required: true,
      items: { name: 'p', type: 'richtext' },
    },
    { name: 'callout', type: 'richtext', required: true },
  ],
  htmlTemplate: `<div class="left">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  <h2>{{fmt title}}</h2>
</div>
<div class="right">
  {{#each paragraphs}}<p>{{fmt this}}</p>{{/each}}
  <p class="callout">{{fmt callout}}</p>
</div>`,
  css: `.left { flex: 1; }
.right { flex: 1; display: flex; flex-direction: column; gap: 24px; justify-content: center; }
h2 { font-family: 'Neureal', sans-serif; font-size: 96px; line-height: 1; }
.right p { font-size: 26px; line-height: 1.45; }
.callout { background: var(--ood-deep-violet); color: var(--ood-white); padding: 32px; font-size: 28px; font-weight: 500; margin-top: 24px; }`,
};
```

- [ ] **Step 4: Implement `purposes`**

Create `src/slide-types/purposes.ts`:

```ts
import type { SlideType } from '../renderer/types.ts';

export const purposes: SlideType = {
  name: 'purposes',
  label: 'Numbered-card grid',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext' },
    {
      name: 'cards',
      type: 'list',
      required: true,
      items: {
        name: 'card',
        type: 'group',
        fields: [
          { name: 'num', type: 'text', required: true },
          { name: 'title', type: 'richtext', required: true },
          { name: 'body', type: 'richtext', required: true },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="content">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <div class="content-inner">
    {{#each cards}}<div class="p-card">
      <div class="p-num">{{fmt num}}</div>
      <div class="p-title">{{fmt title}}</div>
      <div class="p-desc">{{fmt body}}</div>
    </div>{{/each}}
  </div>
</div>`,
  css: `.content { width: 100%; }
h2 { font-family: 'Neureal', sans-serif; font-size: 80px; margin-bottom: 48px; }
.content-inner { display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
.p-card { background: var(--ood-white); padding: 32px; display: flex; flex-direction: column; gap: 16px; }
.p-num { font-family: 'Neureal Mono', monospace; color: var(--ood-deep-violet); font-size: 32px; }
.p-title { font-family: 'Neureal', sans-serif; font-size: 32px; line-height: 1.05; }
.p-desc { font-size: 20px; line-height: 1.4; color: var(--ood-dark-matter-light); }`,
};
```

- [ ] **Step 5: Implement `ownership`**

Create `src/slide-types/ownership.ts`:

```ts
import type { SlideType } from '../renderer/types.ts';

export const ownership: SlideType = {
  name: 'ownership',
  label: 'Ownership model (three cards)',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext' },
    { name: 'source', type: 'richtext', required: true },
    {
      name: 'cards',
      type: 'list',
      required: true,
      items: {
        name: 'card',
        type: 'group',
        fields: [
          { name: 'title', type: 'richtext', required: true },
          { name: 'sub', type: 'richtext', required: true },
          { name: 'body', type: 'richtext', required: true },
        ],
      },
    },
  ],
  htmlTemplate: `{{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
{{#if title}}<h2>{{fmt title}}</h2>{{/if}}
<div class="source">{{fmt source}}</div>
<div class="three-col">
  {{#each cards}}<div class="oc">
    <div class="oc-title">{{fmt title}}</div>
    <div class="oc-sub">{{fmt sub}}</div>
    <div class="oc-body">{{fmt body}}</div>
  </div>{{/each}}
</div>`,
  css: `& { flex-direction: column; }
h2 { font-family: 'Neureal', sans-serif; font-size: 64px; margin-bottom: 24px; }
.source { font-size: 24px; color: var(--ood-dark-matter-light); margin-bottom: 40px; }
.three-col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; flex: 1; }
.oc { background: var(--ood-white); padding: 32px; display: flex; flex-direction: column; gap: 16px; }
.oc-title { font-family: 'Neureal', sans-serif; font-size: 36px; }
.oc-sub { font-family: 'Neureal Mono', monospace; font-size: 18px; color: var(--ood-deep-violet); }
.oc-body { font-size: 20px; line-height: 1.4; }`,
};
```

- [ ] **Step 6: Implement `friction`**

Create `src/slide-types/friction.ts`:

```ts
import type { SlideType } from '../renderer/types.ts';

export const friction: SlideType = {
  name: 'friction',
  label: 'Two-side friction with question',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext', required: true },
    {
      name: 'sideA',
      type: 'group',
      required: true,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'head', type: 'richtext', required: true },
        {
          name: 'body',
          type: 'list',
          required: true,
          items: { name: 'p', type: 'richtext' },
        },
      ],
    },
    {
      name: 'sideB',
      type: 'group',
      required: true,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'head', type: 'richtext', required: true },
        {
          name: 'body',
          type: 'list',
          required: true,
          items: { name: 'p', type: 'richtext' },
        },
      ],
    },
    { name: 'question', type: 'richtext', required: true },
  ],
  htmlTemplate: `<div class="top">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  <h2>{{fmt title}}</h2>
</div>
<div class="compare">
  <div class="side-a">
    <div class="side-label">{{fmt sideA.label}}</div>
    <div class="side-head">{{fmt sideA.head}}</div>
    <div class="side-body">{{#each sideA.body}}<p>{{fmt this}}</p>{{/each}}</div>
  </div>
  <div class="side-b">
    <div class="side-label">{{fmt sideB.label}}</div>
    <div class="side-head">{{fmt sideB.head}}</div>
    <div class="side-body">{{#each sideB.body}}<p>{{fmt this}}</p>{{/each}}</div>
  </div>
</div>
<div class="question">
  <div class="q-label">?</div>
  <div class="q-text">{{fmt question}}</div>
</div>`,
  css: `& { flex-direction: column; }
.top { margin-bottom: 32px; }
h2 { font-family: 'Neureal', sans-serif; font-size: 56px; line-height: 1.05; }
.compare { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; flex: 1; }
.side-a, .side-b { background: var(--ood-white); padding: 32px; display: flex; flex-direction: column; gap: 16px; }
.side-label { font-family: 'Neureal Mono', monospace; font-size: 18px; color: var(--ood-deep-violet); }
.side-head { font-family: 'Neureal', sans-serif; font-size: 28px; line-height: 1.1; }
.side-body p { font-size: 20px; line-height: 1.4; }
.question { background: var(--ood-dark-matter); color: var(--ood-white); padding: 32px; display: grid; grid-template-columns: 80px 1fr; gap: 32px; align-items: center; margin-top: 32px; }
.q-label { font-family: 'Neureal Mono', monospace; font-size: 64px; color: var(--ood-deep-violet-light); }
.q-text { font-size: 24px; line-height: 1.4; }`,
};
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `pnpm test`
Expected: all previous tests pass + 4 new slide-type tests pass.

- [ ] **Step 8: Commit**

```sh
git add src/slide-types/reserve.ts src/slide-types/purposes.ts src/slide-types/ownership.ts src/slide-types/friction.ts tests/slide-types.test.ts
git commit -m "Port 4 more built-in slide types (reserve, purposes, ownership, friction)"
```

---

### Task 14: Built-in slide type — appendix-list + registry

Port the 13th type (`appendix-list`) and create the `BUILT_IN_SLIDE_TYPES` export.

**Files:**
- Create: `src/slide-types/appendix-list.ts`
- Create: `src/slide-types/index.ts`
- Modify: `tests/slide-types.test.ts`

- [ ] **Step 1: Write failing tests — append to `tests/slide-types.test.ts`**

Append to `tests/slide-types.test.ts`:

```ts
import { appendixList } from '../src/slide-types/appendix-list.ts';
import { BUILT_IN_SLIDE_TYPES } from '../src/slide-types/index.ts';

describe('appendix-list slide type', () => {
  it('renders a list of appendix items with marks', async () => {
    const html = await renderOne(appendixList, {
      eyebrow: 'Bilag',
      title: 'Tilhørende materiale',
      items: [
        { mark: 'A', title: 'Bilag A', subtitle: 'Vedtægter' },
        { mark: 'B', title: 'Bilag B', subtitle: 'Principgrundlag' },
      ],
    });
    expect(html).toContain('Tilhørende materiale');
    expect(html).toContain('>A<');
    expect(html).toContain('Bilag A');
    expect(html).toContain('Vedtægter');
  });
});

describe('BUILT_IN_SLIDE_TYPES', () => {
  it('exports exactly 13 types', () => {
    expect(BUILT_IN_SLIDE_TYPES).toHaveLength(13);
  });

  it('includes the expected names', () => {
    const names = BUILT_IN_SLIDE_TYPES.map((t) => t.name).sort();
    expect(names).toEqual([
      'agenda', 'appendix-list', 'closing', 'content', 'discussion',
      'friction', 'ownership', 'principles', 'purposes', 'reserve',
      'section', 'title', 'values',
    ]);
  });

  it('has unique names', () => {
    const names = BUILT_IN_SLIDE_TYPES.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test tests/slide-types.test.ts`
Expected: FAIL with "Cannot find module '../src/slide-types/appendix-list.ts'".

- [ ] **Step 3: Implement `appendixList`**

Create `src/slide-types/appendix-list.ts`:

```ts
import type { SlideType } from '../renderer/types.ts';

export const appendixList: SlideType = {
  name: 'appendix-list',
  label: 'Appendix list (auto-appended)',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext' },
    {
      name: 'items',
      type: 'list',
      required: true,
      items: {
        name: 'item',
        type: 'group',
        fields: [
          { name: 'mark', type: 'text', default: '§' },
          { name: 'title', type: 'richtext' },
          { name: 'subtitle', type: 'richtext' },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="content">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <ul class="app-list">
    {{#each items}}<li>
      <div class="app-mark">{{fmt (default mark "§")}}</div>
      <div class="app-text">
        <div class="app-title">{{fmt title}}</div>
        <div class="app-sub">{{fmt subtitle}}</div>
      </div>
    </li>{{/each}}
  </ul>
</div>`,
  css: `.content { max-width: 1600px; }
h2 { font-family: 'Neureal', sans-serif; font-size: 72px; margin-bottom: 48px; }
.app-list { list-style: none; display: flex; flex-direction: column; gap: 28px; font-size: 28px; }
.app-list li { display: grid; grid-template-columns: 120px 1fr; gap: 40px; align-items: center; }
.app-mark { font-family: 'Neureal Mono', monospace; font-size: 48px; color: var(--ood-deep-violet); text-align: center; }
.app-title { font-weight: 500; }
.app-sub { color: var(--ood-dark-matter-light); font-size: 22px; margin-top: 4px; }`,
};
```

- [ ] **Step 4: Create `src/slide-types/index.ts`**

Create `src/slide-types/index.ts`:

```ts
import type { SlideType } from '../renderer/types.ts';
import { title } from './title.ts';
import { agenda } from './agenda.ts';
import { content } from './content.ts';
import { principles } from './principles.ts';
import { values } from './values.ts';
import { reserve } from './reserve.ts';
import { purposes } from './purposes.ts';
import { section } from './section.ts';
import { ownership } from './ownership.ts';
import { friction } from './friction.ts';
import { discussion } from './discussion.ts';
import { closing } from './closing.ts';
import { appendixList } from './appendix-list.ts';

export const BUILT_IN_SLIDE_TYPES: SlideType[] = [
  title,
  agenda,
  content,
  principles,
  values,
  reserve,
  purposes,
  section,
  ownership,
  friction,
  discussion,
  closing,
  appendixList,
];

export {
  title,
  agenda,
  content,
  principles,
  values,
  reserve,
  purposes,
  section,
  ownership,
  friction,
  discussion,
  closing,
  appendixList,
};
```

Also update `src/index.ts` to re-export:

```ts
export * from './renderer/index.ts';
export * from './slide-types/index.ts';
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test`
Expected: all tests pass, including the 4 new appendix-list + registry tests.

- [ ] **Step 6: Commit**

```sh
git add src/slide-types/appendix-list.ts src/slide-types/index.ts src/index.ts tests/slide-types.test.ts
git commit -m "Add appendix-list slide type and BUILT_IN_SLIDE_TYPES registry"
```

---

### Task 15: ANTAL-Theta default theme

Extract the `:root` tokens from the existing `styles.css` into a `Theme` object.

**Files:**
- Create: `src/themes/antal-theta-default.ts`
- Create: `tests/themes.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/themes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { antalThetaDefault } from '../src/themes/antal-theta-default.ts';
import { themeCss } from '../src/renderer/theme-css.ts';

describe('antalThetaDefault theme', () => {
  it('has a name', () => {
    expect(antalThetaDefault.name).toBe('antal-theta-default');
  });

  it('contains the OOD brand tokens', () => {
    const t = antalThetaDefault.tokens;
    expect(t['--ood-white']).toBe('#FFFFFF');
    expect(t['--ood-big-cloud']).toBe('#EDEDED');
    expect(t['--ood-deep-violet']).toBe('#6E31FF');
    expect(t['--ood-dark-matter']).toBe('#363442');
    expect(t['--ood-wicked-matrix']).toBe('#54DE10');
  });

  it('emits as valid CSS via themeCss', () => {
    const css = themeCss(antalThetaDefault);
    expect(css).toContain(':root {');
    expect(css).toContain('--ood-white: #FFFFFF;');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/themes.test.ts`
Expected: FAIL with "Cannot find module '../src/themes/antal-theta-default.ts'".

- [ ] **Step 3: Implement the theme**

Create `src/themes/antal-theta-default.ts` (values taken directly from the existing `styles.css` `:root` block):

```ts
import type { Theme } from '../renderer/types.ts';

export const antalThetaDefault: Theme = {
  name: 'antal-theta-default',
  tokens: {
    '--ood-white': '#FFFFFF',
    '--ood-big-cloud': '#EDEDED',
    '--ood-barbie-pink': '#FF7FE9',
    '--ood-barbie-pink-light': '#FFB3F3',
    '--ood-barbie-pink-bright': '#FFE7FF',
    '--ood-deep-violet': '#6E31FF',
    '--ood-deep-violet-light': '#A783FF',
    '--ood-deep-violet-bright': '#E2D6FF',
    '--ood-dark-matter': '#363442',
    '--ood-dark-matter-light': '#807B95',
    '--ood-dark-matter-bright': '#D5D3DC',
    '--ood-wicked-matrix': '#54DE10',
    '--ood-wicked-matrix-light': '#9CED7C',
    '--ood-wicked-matrix-bright': '#CEF5BF',
    '--ood-black': '#000000',
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/themes.test.ts`
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```sh
git add src/themes/antal-theta-default.ts tests/themes.test.ts
git commit -m "Extract ANTAL-Theta default theme tokens from styles.css"
```

---

### Task 16: Full-deck golden test

End-to-end test — render the actual ANTAL deck data against all 13 built-ins + the default theme, and assert the output contains the key text from each slide. This is the regression firewall for all later plans.

**Files:**
- Create: `tests/fixtures/deck-antal.json`
- Create: `tests/render-antal.test.ts`

- [ ] **Step 1: Copy the deck fixture**

Run: `cp "/home/niec/ogtal.onedrive/osogdata/møde_bilag/antal-diskussion-april-2026/slides/slides.json" ~/Documents/repos/slidt/tests/fixtures/deck-antal-raw.json`

Then transform the fixture to match the new model. Create `tests/fixtures/deck-antal.json` by hand (or via a one-off script) from the raw file above. The transformation rules:

1. Rename `type` field to `typeName` on each slide object. Example: `"type": "title"` → `"typeName": "title"`.
2. Move all non-type fields under a `data` object. Example:

   Before:
   ```json
   { "type": "title", "eyebrow": "...", "title": "ANTAL", "titleAlt": "og Theta", "mark": "dandelion-green" }
   ```

   After:
   ```json
   { "typeName": "title", "data": { "eyebrow": "...", "title": "ANTAL", "titleAlt": "og Theta", "mark": "dandelion-green", "markUrl": "assets/ood-mark-green.svg" } }
   ```

   (Add `markUrl` for title slides, resolving `mark` via the `TITLE_MARKS` map from `src/slide-types/title.ts`.)

3. Keep `title`, `lang`, `appendix` as top-level Deck properties.

A helper script to do this mechanically — save as `tests/fixtures/_transform.ts` (it's a one-off, not part of the shipped code):

```ts
import { readFileSync, writeFileSync } from 'node:fs';
import { TITLE_MARKS } from '../../src/slide-types/title.ts';

const raw = JSON.parse(readFileSync('tests/fixtures/deck-antal-raw.json', 'utf8'));

const out = {
  title: raw.title,
  lang: raw.lang,
  slides: raw.slides.map((s: any) => {
    const { type, ...rest } = s;
    if (type === 'title' && rest.mark) {
      rest.markUrl = TITLE_MARKS[rest.mark] ?? TITLE_MARKS['dandelion-violet'];
    }
    return { typeName: type, data: rest };
  }),
  appendix: raw.appendix,
};

writeFileSync('tests/fixtures/deck-antal.json', JSON.stringify(out, null, 2) + '\n');
```

Run: `cd ~/Documents/repos/slidt && pnpm tsx tests/fixtures/_transform.ts`
Expected: `tests/fixtures/deck-antal.json` created.

Verify: `node -e "const d=require('./tests/fixtures/deck-antal.json'); console.log(d.slides.length, 'slides;', d.appendix?.length, 'appendix items')"`
Expected: output like `15 slides; 2 appendix items`.

- [ ] **Step 2: Delete the helper script and the raw file (they're not shipped)**

Run: `rm tests/fixtures/_transform.ts tests/fixtures/deck-antal-raw.json`

- [ ] **Step 3: Write the end-to-end test**

Create `tests/render-antal.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { render } from '../src/renderer/index.ts';
import { BUILT_IN_SLIDE_TYPES } from '../src/slide-types/index.ts';
import { antalThetaDefault } from '../src/themes/antal-theta-default.ts';
import type { Deck } from '../src/renderer/types.ts';

const deck = JSON.parse(
  readFileSync(new URL('./fixtures/deck-antal.json', import.meta.url), 'utf8'),
) as Deck;

describe('full ANTAL deck render', () => {
  it('renders without throwing', async () => {
    await expect(render(deck, antalThetaDefault, BUILT_IN_SLIDE_TYPES)).resolves.toBeDefined();
  });

  it('emits one <section class="slide ..."> per slide, plus one appendix-list', async () => {
    const html = await render(deck, antalThetaDefault, BUILT_IN_SLIDE_TYPES);
    const sectionCount = (html.match(/<section class="slide /g) ?? []).length;
    expect(sectionCount).toBe(deck.slides.length + (deck.appendix?.length ? 1 : 0));
  });

  it('includes the deck title in <title> and the first slide title text', async () => {
    const html = await render(deck, antalThetaDefault, BUILT_IN_SLIDE_TYPES);
    expect(html).toContain('<title>ANTAL og Theta</title>');
    expect(html).toContain('ANTAL');
  });

  it('includes theme tokens and base styles', async () => {
    const html = await render(deck, antalThetaDefault, BUILT_IN_SLIDE_TYPES);
    expect(html).toContain('--ood-deep-violet: #6E31FF');
    expect(html).toContain('@page { size: 1920px 1080px');
  });

  it('includes the appendix-list slide with both appendix items', async () => {
    const html = await render(deck, antalThetaDefault, BUILT_IN_SLIDE_TYPES);
    expect(html).toContain('.st-appendix-list');
    expect(html).toContain('Vedtægter');
    expect(html).toContain('Principgrundlag');
  });

  it('page-numbers all slides with matching total', async () => {
    const html = await render(deck, antalThetaDefault, BUILT_IN_SLIDE_TYPES);
    const total = deck.slides.length + (deck.appendix?.length ? 1 : 0);
    const totalStr = total < 10 ? `0${total}` : String(total);
    expect(html).toContain(`>01 / ${totalStr}<`);
    expect(html).toContain(`>${totalStr} / ${totalStr}<`);
  });
});
```

- [ ] **Step 4: Run the test**

Run: `pnpm test tests/render-antal.test.ts`
Expected: 6 tests pass.

If any fail because a required field is missing in the fixture (validation errors), fix the fixture data — the transformation may need adjustments (e.g., if a slide in the raw data has a field the port renamed). Do NOT relax the validator; fix the data.

If any fail because of CSS scoping edge cases in specific slide types, update the relevant slide type's CSS (leaving `h1`, `h2`, etc. as plain element selectors — the scoper prepends `.st-<name>`).

- [ ] **Step 5: Run the full test suite**

Run: `pnpm test && pnpm typecheck`
Expected: all tests pass; typecheck exits 0.

- [ ] **Step 6: Commit**

```sh
git add tests/fixtures/deck-antal.json tests/render-antal.test.ts
git commit -m "Add end-to-end golden test rendering the full ANTAL deck"
```

---

## Plan 1 summary

When all 16 tasks are done, `~/Documents/repos/slidt/` will have:

- A pure-TS library that renders a `Deck` + `Theme` + `SlideType[]` into a self-contained HTML document.
- 13 built-in SlideTypes ported from the existing Python templates.
- An `antal-theta-default` Theme.
- ~50+ unit tests, one parametrized test suite for all slide types, and one full-deck end-to-end test against the real ANTAL data.

No external runtime dependencies beyond Handlebars and PostCSS. No DB, no server, no browser, no PDF — those are Plans 2, 3, and 4.

The public API surface exposed via `src/index.ts` is:

```ts
export { render, RenderOptions } from './renderer/index.ts';
export type { Deck, Slide, SlideType, Field, Theme, AppendixItem } from './renderer/types.ts';
export { BUILT_IN_SLIDE_TYPES, /* individual type exports */ } from './slide-types/index.ts';
export { antalThetaDefault } from './themes/antal-theta-default.ts';
```

Plan 2 will import from `slidt` as a workspace package once the repo is converted to a pnpm workspace, or directly via relative imports within a single-package layout.
