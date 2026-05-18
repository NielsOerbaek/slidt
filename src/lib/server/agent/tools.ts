import { db, decks, slides, slideTypes, themes, issues } from '$lib/server/db/index.ts';
import { recordEdit, fieldCoalesceKey, changedTopLevelFields } from '$lib/server/edit-history.ts';
import { eq, and, or, inArray } from 'drizzle-orm';
import { checkHandlebarsTemplate, checkCss } from '$lib/server/agent/guardrails.ts';
import { validate, ValidationError } from '../../../renderer/validate.ts';
import type { Field } from '../../../renderer/types.ts';

/**
 * Defensive coercion for tool inputs that should be objects. Anthropic's
 * tool input occasionally arrives as a JSON-encoded string (especially on
 * deeply nested payloads), which silently breaks downstream code that
 * treats `data` as an object. Try a single JSON.parse pass when we see a
 * string; otherwise return the value as-is.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve a slide-type reference that the agent may have given as either the
 * UUID id or the human-readable name slug (e.g. "steps-linear-accent"). When
 * looking up by name we restrict to global + this deck so we don't leak other
 * decks' types. Returns the matching row or null.
 */
async function findSlideType(
  ref: string,
  deckId: string,
): Promise<typeof slideTypes.$inferSelect | null> {
  if (!ref?.trim()) return null;
  if (UUID_RE.test(ref)) {
    const [byId] = await db
      .select()
      .from(slideTypes)
      .where(eq(slideTypes.id, ref))
      .limit(1);
    return byId ?? null;
  }
  const [byName] = await db
    .select()
    .from(slideTypes)
    .where(
      and(
        eq(slideTypes.name, ref),
        or(
          eq(slideTypes.scope, 'global'),
          and(eq(slideTypes.scope, 'deck'), eq(slideTypes.deckId, deckId)),
        ),
      ),
    )
    .limit(1);
  return byName ?? null;
}

function coerceObject(value: unknown): Record<string, unknown> | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return undefined;
    }
    return undefined;
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

export interface ToolResult {
  result: string;
  undoPatch?: unknown;
  /** Optional image attached to the tool result, surfaced to the model so it
   *  can visually inspect renderer output. */
  image?: { base64: string; mediaType: 'image/png' };
}

interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export const AGENT_TOOLS: ToolDefinition[] = [
  {
    name: 'list_slides',
    description: 'List all slides in the deck with their IDs, type names, and data.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_slide',
    description: 'Get a specific slide by ID, including all field data.',
    input_schema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Slide ID (UUID)' } },
      required: ['id'],
    },
  },
  {
    name: 'patch_slide',
    description: "Merge-patch a slide's data fields. Only specified fields are updated.",
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Slide ID (UUID)' },
        patch: { type: 'object', description: 'Fields to update (merged into existing data)' },
      },
      required: ['id', 'patch'],
    },
  },
  {
    name: 'add_slide',
    description: 'Add a new slide to the end of the deck.',
    input_schema: {
      type: 'object',
      properties: {
        typeId: { type: 'string', description: 'SlideType identifier — either the UUID id or the slug name (e.g. "title" or "steps-linear-accent").' },
        data: { type: 'object', description: 'Initial field data (optional)' },
      },
      required: ['typeId'],
    },
  },
  {
    name: 'delete_slide',
    description: 'Delete a slide from the deck.',
    input_schema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Slide ID (UUID)' } },
      required: ['id'],
    },
  },
  {
    name: 'reorder_slides',
    description:
      'Set a new ordering for deck slides. Provide the complete slide order as an array of all slide IDs.',
    input_schema: {
      type: 'object',
      properties: {
        order: {
          type: 'array',
          items: { type: 'string' },
          description: 'Complete ordered array of all slide IDs (UUIDs)',
        },
      },
      required: ['order'],
    },
  },
  {
    name: 'update_theme',
    description:
      'Patch CSS custom-property tokens in the deck theme. Only specified tokens are updated.',
    input_schema: {
      type: 'object',
      properties: {
        tokens: {
          type: 'object',
          description:
            'CSS custom-property name to value, e.g. {"--sl-accent": "#6E31FF"}',
        },
      },
      required: ['tokens'],
    },
  },
  {
    name: 'create_theme',
    description:
      `Create a brand-new global theme with a complete --sl-* token set and optionally apply it to the current deck.
If you do not yet have answers to the questions below, ask them first and wait before calling this tool. If the user has already answered them, call this tool immediately without asking again:
1. Name and overall mood/style (e.g. "minimal dark", "warm earthy", "bold corporate")
2. Primary accent colour — exact hex preferred, or a description to derive one from
3. Background preference — pure white, warm off-white, dark, or a specific hex
4. Heading font — Neureal, Inter, or a custom Google Font name
5. Body / paragraph font — Inter, same as heading, or a custom Google Font name`,
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Human-readable theme name shown in the UI' },
        tokens: {
          type: 'object',
          description:
            `Complete CSS token map. All 14 keys are required. Use plain names WITHOUT the --sl- prefix (the server adds it):
bg (main slide background), surface (panel/card surface),
fg (body text colour), dim (muted text), very_dim (very muted),
border (subtle border), border_mid (medium border),
dark_bg (dark-section background), dark_fg (dark-section text),
dark_dim (dark-section muted text), accent (primary accent colour),
accent_bg (light tint of accent for section backgrounds),
font (heading font stack, e.g. "'Inter', sans-serif"),
body_font (body font stack, e.g. "'Inter', sans-serif")`,
        },
        systemPrompt: {
          type: 'string',
          description:
            'Optional agent tone/direction text injected when this theme is active. Describe voice, language, and style preferences.',
        },
        applyToDeck: {
          type: 'boolean',
          description: 'If true, immediately applies the new theme to the current deck.',
        },
      },
      required: ['name', 'tokens'],
    },
  },
  {
    name: 'create_slide_type',
    description:
      'Create a new deck-scoped slide type with a Handlebars HTML template and scoped CSS.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Unique slug, e.g. "quote-with-photo"' },
        label: { type: 'string', description: 'Human-readable label' },
        fields: { type: 'array', description: 'Field schema array', items: { type: 'object' } },
        htmlTemplate: { type: 'string', description: 'Handlebars HTML template' },
        css: { type: 'string', description: 'Scoped CSS (auto-prefixed to .st-<name>)' },
      },
      required: ['name', 'label', 'fields', 'htmlTemplate', 'css'],
    },
  },
  {
    name: 'patch_slide_type',
    description:
      "Update a deck-scoped slide type's label, fields, htmlTemplate, or css. Only deck-scoped types can be patched (global types are read-only). Use this after inspect_slide_type reveals the template needs fixing.",
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'SlideType identifier — either the UUID id or the slug name (e.g. "title").' },
        label: { type: 'string', description: 'New human-readable label (optional)' },
        fields: { type: 'array', description: 'Replacement field schema array (optional)', items: { type: 'object' } },
        htmlTemplate: { type: 'string', description: 'Replacement Handlebars template (optional)' },
        css: { type: 'string', description: 'Replacement scoped CSS (optional)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_slide_type',
    description:
      'Delete a deck-scoped slide type. Refuses if any slide in the deck still uses it (delete those slides first). Global types cannot be deleted.',
    input_schema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'SlideType ID (UUID)' } },
      required: ['id'],
    },
  },
  {
    name: 'fetch_url',
    description:
      'Fetch the text content of a web page or URL. Use this to read articles, documents, or any web content the user wants to base slides on. Returns plain text (HTML stripped).',
    input_schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to fetch' },
      },
      required: ['url'],
    },
  },
  {
    name: 'list_slide_types',
    description: 'List all slide types available for this deck (global + deck-scoped). Returns id, name, label, scope, and a slim field summary (name + type only). Call get_slide_type for full field schemas including list item shapes.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_slide_type',
    description: 'Get full details for a single slide type, including complete field schemas with list item shapes. Use this before add_slide when you need to understand the exact structure of a complex list or group field.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'SlideType identifier — either the UUID id or the slug name (e.g. "steps-linear-accent").' },
      },
      required: ['id'],
    },
  },
  {
    name: 'report_issue',
    description:
      'Submit a bug report or feedback about the slidt platform itself (not deck content). Use this when you encounter a platform limitation, unexpected behavior, a missing feature, or something that seems broken. Admins review these reports.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short one-line summary of the issue' },
        body: { type: 'string', description: 'Full description: what happened, what was expected, any relevant context' },
        severity: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'low = minor inconvenience, medium = blocks some work, high = critical failure',
        },
      },
      required: ['title', 'body'],
    },
  },
  {
    name: 'inspect_slide_type',
    description:
      "Render a slide type and return a PNG screenshot you can look at. Pass slideId to render an existing slide's actual data (use this after add_slide to see how real content fits the template); omit slideId to render with auto-generated dummy data (use this right after create_slide_type or patch_slide_type to verify the template). Always call this when you've created or modified a template, or when you've added the first slide of a slide type you haven't seen render before.",
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'SlideType identifier — either the UUID id or the slug name (e.g. "title").' },
        slideId: {
          type: 'string',
          description: 'Optional Slide ID — when given, the screenshot uses that slide\'s real data instead of dummy data. The slide must belong to this deck.',
        },
      },
      required: ['id'],
    },
  },
];

type ToolInput = Record<string, unknown>;

export async function executeTool(
  deckId: string,
  toolName: string,
  input: ToolInput,
  userId?: string,
): Promise<ToolResult> {
  switch (toolName) {
    case 'list_slides': {
      const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
      if (!deck) return { result: 'error: deck not found' };
      const slideRows = await db.select().from(slides).where(eq(slides.deckId, deckId));
      const typeIds = [...new Set(slideRows.map((s) => s.typeId))];
      const typeRows = typeIds.length
        ? await db.select().from(slideTypes).where(inArray(slideTypes.id, typeIds))
        : [];
      const typeNameMap = new Map(typeRows.map((t) => [t.id, t.name]));
      const ordered = deck.slideOrder
        .map((id) => slideRows.find((s) => s.id === id))
        .filter(Boolean)
        .map((s) => ({
          id: s!.id,
          typeName: typeNameMap.get(s!.typeId) ?? s!.typeId,
          data: s!.data,
        }));
      return { result: JSON.stringify(ordered, null, 2) };
    }

    case 'get_slide': {
      const id = input.id as string;
      const [slide] = await db
        .select()
        .from(slides)
        .where(and(eq(slides.id, id), eq(slides.deckId, deckId)))
        .limit(1);
      if (!slide) return { result: `error: slide ${id} not found` };
      const [type] = await db
        .select()
        .from(slideTypes)
        .where(eq(slideTypes.id, slide.typeId))
        .limit(1);
      return { result: JSON.stringify({ ...slide, typeName: type?.name }, null, 2) };
    }

    case 'patch_slide': {
      const id = input.id as string;
      const patch = coerceObject(input.patch);
      if (!patch) {
        return { result: 'error: patch must be an object (got string or other type)' };
      }
      const [slide] = await db
        .select()
        .from(slides)
        .where(and(eq(slides.id, id), eq(slides.deckId, deckId)))
        .limit(1);
      if (!slide) return { result: `error: slide ${id} not found` };
      const [type] = await db
        .select()
        .from(slideTypes)
        .where(eq(slideTypes.id, slide.typeId))
        .limit(1);
      const before = slide.data as Record<string, unknown>;
      const merged = { ...before, ...patch };
      if (type) {
        try {
          validate(merged, type.fields as Field[]);
        } catch (err) {
          if (err instanceof ValidationError) {
            return { result: `error: ${err.message}` };
          }
          throw err;
        }
      }
      await db.update(slides).set({ data: merged }).where(eq(slides.id, id));
      await db.update(decks).set({ updatedAt: new Date() }).where(eq(decks.id, deckId));
      const changed = changedTopLevelFields(before, merged);
      if (changed.length > 0) {
        const summary = changed.length === 1
          ? `Edit ${changed[0]}`
          : `Edit ${changed.slice(0, 3).join(', ')}${changed.length > 3 ? '…' : ''}`;
        await recordEdit({
          deckId, slideId: id, userId,
          kind: 'edit_field',
          before: { data: before }, after: { data: merged },
          coalesceKey: changed.length === 1 ? fieldCoalesceKey(id, changed[0]) : null,
          summary,
        });
      }
      return { result: 'ok', undoPatch: { type: 'patch_slide', id, before } };
    }

    case 'add_slide': {
      const typeRef = input.typeId as string;
      const data = coerceObject(input.data) ?? {};
      const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
      if (!deck) return { result: 'error: deck not found' };
      const type = await findSlideType(typeRef, deckId);
      if (!type) return { result: `error: slide type ${typeRef} not found` };
      try {
        validate(data, type.fields as Field[]);
      } catch (err) {
        if (err instanceof ValidationError) {
          return { result: `error: ${err.message}` };
        }
        throw err;
      }
      const orderIndex = deck.slideOrder.length;
      const [slide] = await db
        .insert(slides)
        .values({ deckId, typeId: type.id, data, orderIndex })
        .returning();
      await db
        .update(decks)
        .set({ slideOrder: [...deck.slideOrder, slide!.id], updatedAt: new Date() })
        .where(eq(decks.id, deckId));
      await recordEdit({
        deckId, slideId: slide!.id, userId,
        kind: 'add_slide',
        before: null, after: { typeId: type.id, typeName: type.name, data },
        summary: `Add ${type.label} slide`,
      });
      return {
        result: `ok (id: ${slide!.id})`,
        undoPatch: { type: 'delete_slide', id: slide!.id },
      };
    }

    case 'delete_slide': {
      const id = input.id as string;
      const [slide] = await db
        .select()
        .from(slides)
        .where(and(eq(slides.id, id), eq(slides.deckId, deckId)))
        .limit(1);
      if (!slide) return { result: `error: slide ${id} not found` };
      const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
      const prevOrder = deck?.slideOrder ?? [];
      await db.delete(slides).where(eq(slides.id, id));
      await db
        .update(decks)
        .set({ slideOrder: prevOrder.filter((sid) => sid !== id), updatedAt: new Date() })
        .where(eq(decks.id, deckId));
      await recordEdit({
        deckId, slideId: id, userId,
        kind: 'delete_slide',
        before: { typeId: slide.typeId, data: slide.data }, after: null,
        summary: 'Delete slide',
      });
      return {
        result: 'ok',
        undoPatch: {
          type: 'add_slide',
          typeId: slide.typeId,
          data: slide.data,
          orderIndex: slide.orderIndex,
        },
      };
    }

    case 'reorder_slides': {
      const order = input.order as string[];
      const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
      const previousOrder = deck?.slideOrder ?? [];
      const currentSet = new Set(previousOrder);
      const providedSet = new Set(order);
      const missing = [...currentSet].filter((id) => !providedSet.has(id));
      const extra = [...providedSet].filter((id) => !currentSet.has(id));
      if (missing.length > 0 || extra.length > 0) {
        const parts: string[] = [];
        if (missing.length) parts.push(`missing: ${missing.join(', ')}`);
        if (extra.length) parts.push(`unknown: ${extra.join(', ')}`);
        return { result: `error: order must contain exactly all current slide IDs — ${parts.join('; ')}` };
      }
      await db
        .update(decks)
        .set({ slideOrder: order, updatedAt: new Date() })
        .where(eq(decks.id, deckId));
      await recordEdit({
        deckId, userId,
        kind: 'reorder',
        before: { order: previousOrder }, after: { order },
        summary: 'Reorder slides',
      });
      return { result: 'ok', undoPatch: { type: 'reorder_slides', previousOrder } };
    }

    case 'update_theme': {
      const tokens = input.tokens as Record<string, string>;
      const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
      if (!deck?.themeId) return { result: 'error: deck has no theme' };
      const [theme] = await db
        .select()
        .from(themes)
        .where(eq(themes.id, deck.themeId))
        .limit(1);
      if (!theme) return { result: 'error: theme not found' };
      const before = theme.tokens as Record<string, string>;
      await db
        .update(themes)
        .set({ tokens: { ...before, ...tokens } })
        .where(eq(themes.id, theme.id));
      await recordEdit({
        deckId, userId,
        kind: 'apply_theme',
        before: { tokens: before }, after: { tokens: { ...before, ...tokens } },
        summary: 'Update theme tokens',
      });
      return {
        result: 'ok',
        undoPatch: { type: 'update_theme', themeId: theme.id, before },
      };
    }

    case 'create_theme': {
      const name = (input.name as string)?.trim();
      if (!name) return { result: 'error: name is required' };
      const rawTokens = coerceObject(input.tokens);
      if (!rawTokens) return { result: 'error: tokens must be an object' };
      // Normalize keys: model sends plain names (bg, dark_bg) or full --sl-* names.
      // Convert underscores → hyphens and add --sl- prefix if missing.
      const normalizedTokens: Record<string, string> = {};
      for (const [k, v] of Object.entries(rawTokens)) {
        const cssKey = k.startsWith('--') ? k : `--sl-${k.replace(/_/g, '-')}`;
        normalizedTokens[cssKey] = String(v);
      }
      const REQUIRED_TOKENS = [
        '--sl-bg', '--sl-surface', '--sl-fg', '--sl-dim', '--sl-very-dim',
        '--sl-border', '--sl-border-mid', '--sl-dark-bg', '--sl-dark-fg',
        '--sl-dark-dim', '--sl-accent', '--sl-accent-bg', '--sl-font', '--sl-body-font',
      ];
      const missing = REQUIRED_TOKENS.filter((k) => !normalizedTokens[k]);
      if (missing.length > 0) return { result: `error: missing required tokens: ${missing.join(', ')}` };
      const systemPrompt =
        typeof input.systemPrompt === 'string' ? input.systemPrompt.trim() || null : null;
      const applyToDeck = input.applyToDeck === true;
      const [newTheme] = await db
        .insert(themes)
        .values({ name, tokens: normalizedTokens, systemPrompt, scope: 'global' })
        .returning();
      if (!newTheme) return { result: 'error: theme insert failed' };
      if (applyToDeck) {
        await db.update(decks).set({ themeId: newTheme.id }).where(eq(decks.id, deckId));
      }
      const editUrl = `/themes/${newTheme.id}`;
      return {
        result: `ok — theme "${name}" created (id: ${newTheme.id})${applyToDeck ? ', applied to deck' : ''}. Edit it at ${editUrl}.`,
      };
    }

    case 'create_slide_type': {
      const name = input.name as string;
      const label = input.label as string;
      const fields = input.fields as Field[];
      const htmlTemplate = input.htmlTemplate as string;
      const css = (input.css as string) ?? '';
      // Guardrails run before any DB write
      checkHandlebarsTemplate(htmlTemplate);
      checkCss(css);
      const [st] = await db
        .insert(slideTypes)
        .values({ name, label, fields, htmlTemplate, css, scope: 'deck', deckId })
        .returning();
      return {
        result: `ok (id: ${st!.id})`,
        undoPatch: { type: 'delete_slide_type', id: st!.id },
      };
    }

    case 'fetch_url': {
      const url = input.url as string;
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; slidt-agent/1.0)' },
          signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) return { result: `error: HTTP ${res.status} — the server rejected the request. Try a different URL or use content the user can paste directly.` };
        const html = await res.text();
        // Strip tags, collapse whitespace, trim to 8k chars
        const raw = html
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\s{2,}/g, ' ')
          .trim();
        const truncated = raw.length > 8000;
        const text = raw.slice(0, 8000) + (truncated ? '\n\n[Content truncated at 8,000 chars. If you need more, ask the user to provide a more specific URL or section.]' : '');
        return { result: text };
      } catch (err) {
        return { result: `error: ${err instanceof Error ? err.message : String(err)}` };
      }
    }

    case 'patch_slide_type': {
      const ref = input.id as string;
      const st = await findSlideType(ref, deckId);
      if (!st) return { result: `error: slide type ${ref} not found` };
      if (st.scope !== 'deck' || st.deckId !== deckId) {
        return { result: 'error: only deck-scoped slide types belonging to this deck can be patched' };
      }
      const updates: Partial<typeof slideTypes.$inferInsert> = {};
      if (typeof input.label === 'string') updates.label = input.label;
      if (Array.isArray(input.fields)) updates.fields = input.fields as Field[];
      if (typeof input.htmlTemplate === 'string') {
        checkHandlebarsTemplate(input.htmlTemplate);
        updates.htmlTemplate = input.htmlTemplate;
      }
      if (typeof input.css === 'string') {
        checkCss(input.css);
        updates.css = input.css;
      }
      if (Object.keys(updates).length === 0) {
        return { result: 'error: nothing to update (provide at least one of label/fields/htmlTemplate/css)' };
      }
      const before = {
        label: st.label,
        fields: st.fields,
        htmlTemplate: st.htmlTemplate,
        css: st.css,
      };
      await db.update(slideTypes).set(updates).where(eq(slideTypes.id, st.id));
      return {
        result: 'ok',
        undoPatch: { type: 'patch_slide_type', id: st.id, before },
      };
    }

    case 'delete_slide_type': {
      const ref = input.id as string;
      const st = await findSlideType(ref, deckId);
      if (!st) return { result: `error: slide type ${ref} not found` };
      if (st.scope !== 'deck' || st.deckId !== deckId) {
        return { result: 'error: only deck-scoped slide types belonging to this deck can be deleted' };
      }
      const inUse = await db
        .select({ id: slides.id })
        .from(slides)
        .where(and(eq(slides.deckId, deckId), eq(slides.typeId, st.id)))
        .limit(1);
      if (inUse.length > 0) {
        return {
          result: `error: slide type still in use by at least one slide (${inUse[0]!.id}); delete those slides first`,
        };
      }
      await db.delete(slideTypes).where(eq(slideTypes.id, st.id));
      return {
        result: 'ok',
        undoPatch: {
          type: 'create_slide_type',
          name: st.name,
          label: st.label,
          fields: st.fields,
          htmlTemplate: st.htmlTemplate,
          css: st.css,
        },
      };
    }

    case 'inspect_slide_type': {
      const ref = input.id as string;
      const slideId = typeof input.slideId === 'string' && input.slideId ? input.slideId : null;
      const st = await findSlideType(ref, deckId);
      if (!st) return { result: `error: slide type ${ref} not found` };
      try {
        const { screenshotSlideType } = await import('$lib/server/screenshot.ts');
        const png = await screenshotSlideType(st.id, deckId, slideId ? { slideId } : {});
        const base64 = png.toString('base64');
        const dataNote = slideId ? `slide=${slideId}` : 'dummy data';
        return {
          result: `ok — rendered ${png.byteLength} bytes at 1920x1080 (${dataNote})`,
          image: { base64, mediaType: 'image/png' },
        };
      } catch (err) {
        return { result: `error: ${err instanceof Error ? err.message : String(err)}` };
      }
    }

    case 'list_slide_types': {
      const rows = await db
        .select({ id: slideTypes.id, name: slideTypes.name, label: slideTypes.label, scope: slideTypes.scope, fields: slideTypes.fields })
        .from(slideTypes)
        .where(
          or(
            eq(slideTypes.scope, 'global'),
            and(eq(slideTypes.scope, 'deck'), eq(slideTypes.deckId, deckId)),
          ),
        );
      const slim = rows.map(({ fields, ...rest }) => ({
        ...rest,
        fields: (fields as Array<{ name?: string; type?: string }>).map((f) => ({ name: f.name, type: f.type })),
      }));
      return { result: JSON.stringify(slim, null, 2) };
    }

    case 'get_slide_type': {
      const ref = input.id as string;
      const st = await findSlideType(ref, deckId);
      if (!st) return { result: `error: slide type ${ref} not found` };
      // Return full schema but omit htmlTemplate (large, rarely needed as text)
      const { htmlTemplate: _, ...rest } = st;
      return { result: JSON.stringify(rest, null, 2) };
    }

    case 'report_issue': {
      const title = (input.title as string)?.trim();
      const body = (input.body as string)?.trim() ?? '';
      const severity = (['low', 'medium', 'high'].includes(input.severity as string)
        ? input.severity
        : 'medium') as 'low' | 'medium' | 'high';
      if (!title) return { result: 'error: title is required' };
      await db.insert(issues).values({
        userId: userId ?? null,
        deckId,
        title,
        body,
        severity,
      });
      return { result: `ok — issue reported: "${title}"` };
    }

    default:
      return { result: `error: unknown tool "${toolName}"` };
  }
}
