import type { SlideType } from '../renderer/types.ts';

export const closing: SlideType = {
  name: 'closing',
  label: 'Closing slide',
  fields: [
    { name: 'title', type: 'richtext', required: true },
    { name: 'subtitle', type: 'richtext' },
  ],
  htmlTemplate: `<h1>{{fmt title}}</h1>
<p>{{fmt subtitle}}</p>`,
  css: `& { flex-direction: column; align-items: center; justify-content: center; text-align: center; }
h1 { font-family: 'Neureal', sans-serif; font-size: 220px; }
p { font-size: 36px; margin-top: 32px; color: var(--ood-dark-matter-light); }`,
};
