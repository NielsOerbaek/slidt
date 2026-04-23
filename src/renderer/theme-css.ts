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
