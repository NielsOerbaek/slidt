import type { Theme } from '../renderer/types.ts';

export const antalThetaDefault: Theme = {
  name: 'antal-theta-default',
  systemPrompt: `This is the ANTAL-Theta theme for Os & Data, a Danish cooperative. \
Tone and direction:
- Professional yet warm — authoritative without being corporate-cold.
- Danish-first content. All labels, headings, and body text must be in Danish unless the user explicitly requests otherwise.
- Concise and purposeful. Slides should convey one clear idea. Avoid padding or filler text.
- No HTML markup in any content field. Write plain text only — the template handles all formatting.
- Use the brand palette deliberately: deep-violet for structure, barbie-pink for emphasis, wicked-matrix sparingly for data/accent.
- Prefer strong verbs and active voice. Avoid bullet lists that are just fragments — write complete, readable points.
- Maintain consistency across the deck: terminology, tone, and visual rhythm should feel unified.`,
  tokens: {
    '--sl-bg': '#FFFFFF',
    '--sl-surface': '#EDEDED',
    '--sl-fg': '#363442',
    '--sl-dim': '#807B95',
    '--sl-very-dim': '#D5D3DC',
    '--sl-border': '#D5D3DC',
    '--sl-border-mid': '#807B95',
    '--sl-dark-bg': '#363442',
    '--sl-dark-fg': '#FFFFFF',
    '--sl-dark-dim': '#807B95',
    '--sl-accent': '#6E31FF',
    '--sl-accent-bg': '#E2D6FF',
    '--sl-font': "'Neureal', 'Inter', sans-serif",
    '--sl-body-font': "'Inter', sans-serif",
  },
};
