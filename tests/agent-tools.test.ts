import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DB to avoid needing a real Postgres connection
vi.mock('$lib/server/db/index.ts', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  decks: {},
  slides: {},
  slideTypes: {},
  themes: {},
}));

// Mock drizzle-orm operators (tables are empty objects in mock)
vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: vi.fn(() => ({})),
    and: vi.fn(() => ({})),
    or: vi.fn(() => ({})),
    inArray: vi.fn(() => ({})),
  };
});

// Mock guardrails so tool tests don't run Handlebars parsing
vi.mock('$lib/server/agent/guardrails.ts', () => ({
  checkHandlebarsTemplate: vi.fn(),
  checkCss: vi.fn(),
  GuardrailError: class GuardrailError extends Error {
    constructor(msg: string) { super(msg); this.name = 'GuardrailError'; }
  },
}));

import { AGENT_TOOLS, executeTool } from '../src/lib/server/agent/tools.ts';
import { checkHandlebarsTemplate, checkCss } from '$lib/server/agent/guardrails.ts';

describe('AGENT_TOOLS', () => {
  it('contains exactly 13 tools', () => {
    expect(AGENT_TOOLS).toHaveLength(13);
  });

  it('includes all required tool names', () => {
    const names = AGENT_TOOLS.map((t) => t.name);
    for (const name of [
      'list_slides', 'get_slide', 'patch_slide', 'add_slide', 'delete_slide',
      'reorder_slides', 'update_theme', 'create_slide_type', 'patch_slide_type',
      'delete_slide_type', 'list_slide_types', 'fetch_url', 'inspect_slide_type',
    ]) {
      expect(names).toContain(name);
    }
  });

  it('every tool has a valid input_schema', () => {
    for (const tool of AGENT_TOOLS) {
      expect(tool.input_schema.type).toBe('object');
      expect(Array.isArray(tool.input_schema.required)).toBe(true);
    }
  });
});

describe('executeTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error result for unknown tool name', async () => {
    const result = await executeTool('deck-id', 'nonexistent_tool', {});
    expect(result.result).toContain('error');
    expect(result.result).toContain('nonexistent_tool');
  });

  it('calls checkHandlebarsTemplate when creating a slide type', async () => {
    // Mock DB insert to succeed
    const { db } = await import('$lib/server/db/index.ts');
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'new-type-id' }]),
      }),
    } as any);

    await executeTool('deck-id', 'create_slide_type', {
      name: 'test-type',
      label: 'Test Type',
      fields: [],
      htmlTemplate: '<div>{{title}}</div>',
      css: '& .test { color: red; }',
    });

    expect(checkHandlebarsTemplate).toHaveBeenCalledWith('<div>{{title}}</div>');
    expect(checkCss).toHaveBeenCalledWith('& .test { color: red; }');
  });

  it('propagates GuardrailError from checkHandlebarsTemplate', async () => {
    vi.mocked(checkHandlebarsTemplate).mockImplementationOnce(() => {
      throw new Error('Unknown helper: "eval"');
    });

    await expect(
      executeTool('deck-id', 'create_slide_type', {
        name: 'bad-type',
        label: 'Bad',
        fields: [],
        htmlTemplate: '{{eval content}}',
        css: '',
      }),
    ).rejects.toThrow('Unknown helper');
  });

  it('propagates GuardrailError from checkCss', async () => {
    vi.mocked(checkCss).mockImplementationOnce(() => {
      throw new Error('@import is not allowed');
    });

    await expect(
      executeTool('deck-id', 'create_slide_type', {
        name: 'bad-css',
        label: 'Bad CSS',
        fields: [],
        htmlTemplate: '<div>{{title}}</div>',
        css: '@import url("evil.css");',
      }),
    ).rejects.toThrow('@import');
  });
});
