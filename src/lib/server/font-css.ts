import { readFile } from 'fs/promises';
import path from 'path';

// Inter: from @fontsource/inter (latin subset, weights 300 / 400 / 600)
const INTER_DIR = path.resolve(process.cwd(), 'node_modules/@fontsource/inter/files');
const INTER_SPECS: Array<{ weight: number; file: string }> = [
  { weight: 300, file: 'inter-latin-300-normal.woff2' },
  { weight: 400, file: 'inter-latin-400-normal.woff2' },
  { weight: 600, file: 'inter-latin-600-normal.woff2' },
];

// Neureal Mono: manually placed in static/fonts/ — silently skipped when absent
const NEUREAL_DIR = path.resolve(process.cwd(), 'static/fonts');
const NEUREAL_SPECS: Array<{ weight: number; file: string }> = [
  { weight: 400, file: 'NeurealMono-Regular.woff2' },
  { weight: 700, file: 'NeurealMono-Bold.woff2' },
];

async function fontFaceRule(
  family: string,
  weight: number,
  filePath: string,
): Promise<string | null> {
  try {
    const data = await readFile(filePath);
    const b64 = data.toString('base64');
    return [
      `@font-face {`,
      `  font-family: '${family}';`,
      `  font-weight: ${weight};`,
      `  font-style: normal;`,
      `  src: url('data:font/woff2;base64,${b64}') format('woff2');`,
      `}`,
    ].join('\n');
  } catch {
    return null;
  }
}

/**
 * Build @font-face CSS for Inter (always present via @fontsource/inter) and
 * Neureal Mono (from static/fonts/ — silently omitted if files are absent).
 */
export async function buildFontCss(): Promise<string> {
  const rules: string[] = [];
  for (const { weight, file } of INTER_SPECS) {
    const rule = await fontFaceRule('Inter', weight, path.join(INTER_DIR, file));
    if (rule) rules.push(rule);
  }
  for (const { weight, file } of NEUREAL_SPECS) {
    const rule = await fontFaceRule('Neureal Mono', weight, path.join(NEUREAL_DIR, file));
    if (rule) rules.push(rule);
  }
  return rules.join('\n');
}
