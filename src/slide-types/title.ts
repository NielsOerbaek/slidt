import type { SlideType } from '../renderer/types.ts';

export const TITLE_MARKS = ['dandelion-green', 'dandelion-violet', 'dandelion-white'] as const;

export const title: SlideType = {
  name: 'title',
  label: 'Title slide',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext', required: true },
    { name: 'titleAlt', type: 'richtext' },
    { name: 'kicker', type: 'text' },
    { name: 'mark', type: 'select', options: [...TITLE_MARKS], default: 'dandelion-violet' },
  ],
  htmlTemplate: `<div class="title-col">
  <div class="eyebrow">{{fmt eyebrow}}</div>
  <h1>{{fmt title}}<br/><span class="alt">{{fmt titleAlt}}</span></h1>
  <p class="kicker">{{fmt kicker}}</p>
</div>
<div class="dandelion">{{dandelion mark}}</div>`,
  css: `& { flex-direction: row; align-items: center; padding: 120px; }
.title-col { flex: 1.1; display: flex; flex-direction: column; justify-content: center; }
.eyebrow { font-family: 'Neureal', sans-serif; font-size: 40px; color: var(--ood-dark-matter); margin-bottom: 32px; letter-spacing: 0.02em; }
h1 { font-size: 120px; color: var(--ood-deep-violet); line-height: 1.02; margin-bottom: 48px; }
h1 .alt { color: var(--ood-dark-matter); display: block; }
.kicker { font-family: 'Inter', sans-serif; font-weight: 300; font-size: 32px; line-height: 1.4; color: var(--ood-dark-matter); max-width: 720px; }
.dandelion { flex: 0.9; display: flex; align-items: center; justify-content: center; }
.dandelion svg { width: 640px; height: 640px; }`,
};
