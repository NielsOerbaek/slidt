import { db, decks, slides, slideTypes, themes } from '$lib/server/db/index.ts';
import { eq, and, or, inArray } from 'drizzle-orm';
import { checkHandlebarsTemplate, checkCss } from '$lib/server/agent/guardrails.ts';
import type { Field } from '../../../renderer/types.ts';

export interface ToolResult {
  result: string;
  undoPatch?: unknown;
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
        typeId: { type: 'string', description: 'SlideType ID (UUID)' },
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
            'CSS custom-property name to value, e.g. {"--ood-accent": "#5B21B6"}',
        },
      },
      required: ['tokens'],
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
    name: 'list_slide_types',
    description: 'List all slide types available for this deck (global + deck-scoped).',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
];

type ToolInput = Record<string, unknown>;

export async function executeTool(
  deckId: string,
  toolName: string,
  input: ToolInput,
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
      const patch = input.patch as Record<string, unknown>;
      const [slide] = await db
        .select()
        .from(slides)
        .where(and(eq(slides.id, id), eq(slides.deckId, deckId)))
        .limit(1);
      if (!slide) return { result: `error: slide ${id} not found` };
      const before = slide.data as Record<string, unknown>;
      await db.update(slides).set({ data: { ...before, ...patch } }).where(eq(slides.id, id));
      await db.update(decks).set({ updatedAt: new Date() }).where(eq(decks.id, deckId));
      return { result: 'ok', undoPatch: { type: 'patch_slide', id, before } };
    }

    case 'add_slide': {
      const typeId = input.typeId as string;
      const data = (input.data ?? {}) as Record<string, unknown>;
      const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
      if (!deck) return { result: 'error: deck not found' };
      const orderIndex = deck.slideOrder.length;
      const [slide] = await db
        .insert(slides)
        .values({ deckId, typeId, data, orderIndex })
        .returning();
      await db
        .update(decks)
        .set({ slideOrder: [...deck.slideOrder, slide!.id], updatedAt: new Date() })
        .where(eq(decks.id, deckId));
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
      await db
        .update(decks)
        .set({ slideOrder: order, updatedAt: new Date() })
        .where(eq(decks.id, deckId));
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
      return {
        result: 'ok',
        undoPatch: { type: 'update_theme', themeId: theme.id, before },
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

    case 'list_slide_types': {
      const rows = await db
        .select({ id: slideTypes.id, name: slideTypes.name, label: slideTypes.label, scope: slideTypes.scope })
        .from(slideTypes)
        .where(
          or(
            eq(slideTypes.scope, 'global'),
            and(eq(slideTypes.scope, 'deck'), eq(slideTypes.deckId, deckId)),
          ),
        );
      return { result: JSON.stringify(rows, null, 2) };
    }

    default:
      return { result: `error: unknown tool "${toolName}"` };
  }
}
