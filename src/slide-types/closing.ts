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
  css: `& { flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 140px; }
h1 { font-size: 140px; color: var(--ood-deep-violet); line-height: 1; margin-bottom: 36px; }
p { font-size: 36px; color: var(--ood-dark-matter); }`,
};
