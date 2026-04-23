import { describe, it, expect } from 'vitest';
import { isPublicPath } from '../src/lib/utils/paths.ts';

describe('isPublicPath', () => {
  it('marks /login as public', () => expect(isPublicPath('/login')).toBe(true));
  it('marks /share/* as public', () => {
    expect(isPublicPath('/share/tok123')).toBe(true);
    expect(isPublicPath('/share/abc-def')).toBe(true);
  });
  it('marks /decks as protected', () => expect(isPublicPath('/decks')).toBe(false));
  it('marks / as protected', () => expect(isPublicPath('/')).toBe(false));
  it('marks /themes as protected', () => expect(isPublicPath('/themes')).toBe(false));
});
