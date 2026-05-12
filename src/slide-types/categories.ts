/**
 * Static client-side mapping of slide type names to category keys.
 * Categories are UI-only and not stored in the database.
 */

export type SlideCategory = 'title' | 'content' | 'list' | 'visual' | 'other';

export const CATEGORY_LABELS: Record<SlideCategory, string> = {
  title: 'Title & Breaker',
  content: 'Content',
  list: 'Lists & Grids',
  visual: 'Visual',
  other: 'Other',
};

export const CATEGORY_ORDER: SlideCategory[] = ['title', 'content', 'list', 'visual', 'other'];

/** Returns the category for a given slide type name. */
export function getCategory(typeName: string): SlideCategory {
  const map: Record<string, SlideCategory> = {
    'cover':          'title',
    'agenda':         'title',
    'divider':        'title',
    'closing':        'title',

    'bullet-list':    'content',
    'numbered-list':  'content',
    'callout-content':'content',
    'two-column':     'content',
    'three-column':   'content',
    'quote':          'content',
    'quote-pair':     'content',

    'column-list':    'list',
    'card-grid':      'list',
    'team-cards':     'list',
    'qa-list':        'list',
    'comparison':     'list',

    'stat-grid':      'visual',
    'timeline':       'visual',
    'dot-flow':       'visual',
  };
  return map[typeName] ?? 'other';
}

/** Groups an array of items (with a `.name` string) by category. */
export function groupByCategory<T extends { name: string }>(
  items: T[],
): { category: SlideCategory; label: string; items: T[] }[] {
  const buckets = new Map<SlideCategory, T[]>();
  for (const cat of CATEGORY_ORDER) buckets.set(cat, []);

  for (const item of items) {
    const cat = getCategory(item.name);
    buckets.get(cat)!.push(item);
  }

  return CATEGORY_ORDER
    .filter((cat) => (buckets.get(cat)?.length ?? 0) > 0)
    .map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      items: buckets.get(cat)!,
    }));
}
