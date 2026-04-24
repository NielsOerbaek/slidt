import { messages, type MessageKey } from './messages.ts';

export type Locale = 'da' | 'en';

export const DEFAULT_LOCALE: Locale = 'da';

/**
 * Look up a UI string by key. Substitutes `{name}` placeholders from `params`.
 * Falls back to the Danish string if the requested locale is missing, then to
 * the key itself if the entry doesn't exist (so missing translations are
 * obvious rather than silent).
 */
export function t(
  key: MessageKey,
  params?: Record<string, string | number>,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const entry = messages[key];
  if (!entry) return key;
  const raw = entry[locale] ?? entry.da ?? key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  );
}

/**
 * Danish word numerals 0–10 for headline-style "Six decks in motion." copy.
 * Falls back to digit form past ten.
 */
const DA_NUMERALS = ['Nul', 'Ét', 'To', 'Tre', 'Fire', 'Fem', 'Seks', 'Syv', 'Otte', 'Ni', 'Ti'];
const EN_NUMERALS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

export function numeralWord(n: number, locale: Locale = DEFAULT_LOCALE): string {
  const table = locale === 'en' ? EN_NUMERALS : DA_NUMERALS;
  return table[n] ?? String(n);
}

/**
 * Headline copy for the decks list, branching on count.
 */
export function decksHeadline(count: number, locale: Locale = DEFAULT_LOCALE): string {
  if (count === 0) return t('decks.headline.zero', undefined, locale);
  if (count === 1) return t('decks.headline.one', undefined, locale);
  return t('decks.headline.many', { word: numeralWord(count, locale) }, locale);
}
