import { describe, it, expect } from 'vitest';
import { parseImportInput } from '../scripts/import-deck-parse.ts';

describe('parseImportInput', () => {
  it('parses a valid input with all fields', () => {
    const result = parseImportInput({
      title: 'ANTAL-Theta april 2026',
      lang: 'da',
      slides: [
        { typeName: 'title', data: { title: 'ANTAL og Theta', eyebrow: 'Møde' } },
        { typeName: 'content', data: { title: 'Agenda', bullets: ['A', 'B'] } },
      ],
    });
    expect(result.title).toBe('ANTAL-Theta april 2026');
    expect(result.lang).toBe('da');
    expect(result.slides).toHaveLength(2);
    expect(result.slides[0].typeName).toBe('title');
    expect(result.slides[0].data).toEqual({ title: 'ANTAL og Theta', eyebrow: 'Møde' });
    expect(result.slides[1].typeName).toBe('content');
  });

  it('defaults lang to da when omitted', () => {
    const result = parseImportInput({ title: 'T', slides: [] });
    expect(result.lang).toBe('da');
  });

  it('accepts an empty slides array', () => {
    const result = parseImportInput({ title: 'Empty', slides: [] });
    expect(result.slides).toHaveLength(0);
  });

  it('treats missing data field as empty object', () => {
    const result = parseImportInput({
      title: 'T',
      slides: [{ typeName: 'section' }],
    });
    expect(result.slides[0].data).toEqual({});
  });

  it('throws on non-object input', () => {
    expect(() => parseImportInput(null)).toThrow('JSON object');
    expect(() => parseImportInput('string')).toThrow('JSON object');
  });

  it('throws on missing title', () => {
    expect(() => parseImportInput({ slides: [] })).toThrow('title');
  });

  it('throws on missing slides array', () => {
    expect(() => parseImportInput({ title: 'T' })).toThrow('slides');
  });

  it('throws on slides that is not an array', () => {
    expect(() => parseImportInput({ title: 'T', slides: {} })).toThrow('slides');
  });

  it('throws on slide missing typeName', () => {
    expect(() =>
      parseImportInput({ title: 'T', slides: [{ data: {} }] }),
    ).toThrow('typeName');
  });

  it('throws on slide with non-string typeName', () => {
    expect(() =>
      parseImportInput({ title: 'T', slides: [{ typeName: 42 }] }),
    ).toThrow('typeName');
  });
});
