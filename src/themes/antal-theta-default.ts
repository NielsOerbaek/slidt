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
    '--ood-white': '#FFFFFF',
    '--ood-big-cloud': '#EDEDED',
    '--ood-barbie-pink': '#FF7FE9',
    '--ood-barbie-pink-light': '#FFB3F3',
    '--ood-barbie-pink-bright': '#FFE7FF',
    '--ood-deep-violet': '#6E31FF',
    '--ood-deep-violet-light': '#A783FF',
    '--ood-deep-violet-bright': '#E2D6FF',
    '--ood-dark-matter': '#363442',
    '--ood-dark-matter-light': '#807B95',
    '--ood-dark-matter-bright': '#D5D3DC',
    '--ood-wicked-matrix': '#54DE10',
    '--ood-wicked-matrix-light': '#9CED7C',
    '--ood-wicked-matrix-bright': '#CEF5BF',
    '--ood-black': '#000000',
  },
};
