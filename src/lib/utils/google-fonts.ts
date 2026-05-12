/**
 * Utilities for extracting Google Font names from theme tokens and building
 * Google Fonts stylesheet links.
 */

const BUILTIN_FONTS = new Set([
  'neureal',
  'neureal mono',
  'inter',
  'sans-serif',
  'serif',
  'monospace',
  'system-ui',
  'cursive',
  'fantasy',
]);

/**
 * Extract custom (non-built-in) font family names from theme tokens
 * `--sl-font` and `--sl-body-font`.
 */
export function extractGoogleFonts(tokens: Record<string, string>): string[] {
  const result: string[] = [];
  for (const key of ['--sl-font', '--sl-body-font']) {
    const val = tokens[key];
    if (!val) continue;
    const families = val.split(',').map((f) => f.replace(/['"]/g, '').trim()).filter(Boolean);
    for (const family of families) {
      if (!BUILTIN_FONTS.has(family.toLowerCase()) && !result.includes(family)) {
        result.push(family);
      }
    }
  }
  return result;
}

/**
 * Build a Google Fonts `<link>` HTML block for the given font families,
 * or empty string if none.
 */
export function buildGoogleFontsLink(families: string[]): string {
  if (families.length === 0) return '';
  const params = families
    .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600`)
    .join('&');
  return [
    `<link rel="preconnect" href="https://fonts.googleapis.com">`,
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${params}&display=swap">`,
  ].join('\n');
}
