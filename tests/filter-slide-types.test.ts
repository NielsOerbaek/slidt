import { describe, it, expect } from 'vitest';
import { filterSlideTypes } from '../src/lib/utils/filter-slide-types.ts';

const types = [
  { id: '1', name: 'content', label: 'Bullet list with title' },
  { id: '2', name: 'title-slide', label: 'Title slide' },
  { id: '3', name: 'section', label: 'Section divider' },
];

describe('filterSlideTypes', () => {
  it('returns all types for empty query', () => {
    expect(filterSlideTypes(types, '')).toHaveLength(3);
  });
  it('filters by label (case-insensitive)', () => {
    // "Bullet list with title" and "Title slide" both contain "title"
    expect(filterSlideTypes(types, 'title')).toHaveLength(2);
  });
  it('filters by name', () => {
    expect(filterSlideTypes(types, 'section')).toHaveLength(1);
    expect(filterSlideTypes(types, 'section')[0]?.id).toBe('3');
  });
  it('returns empty array for no match', () => {
    expect(filterSlideTypes(types, 'xyz')).toHaveLength(0);
  });
  it('is case-insensitive for name', () => {
    expect(filterSlideTypes(types, 'CONTENT')).toHaveLength(1);
  });
});
