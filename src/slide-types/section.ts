import type { SlideType } from '../renderer/types.ts';

export const section: SlideType = {
  name: 'section',
  label: 'Section divider',
  hideCorner: true,
  fields: [
    { name: 'bigMark', type: 'text', required: true },
    { name: 'title', type: 'richtext', required: true },
    { name: 'subtitle', type: 'richtext' },
  ],
  htmlTemplate: `<div class="num-col">
  <div class="big-num">{{fmt bigMark}}</div>
</div>
<div class="title-col">
  <div>
    <h2>{{fmt title}}</h2>
    <span class="subtitle">{{fmt subtitle}}</span>
  </div>
</div>`,
  css: `& { background: var(--ood-dark-matter); color: var(--ood-big-cloud); }
.num-col { flex: 1; display: flex; align-items: center; justify-content: center; }
.big-num { font-family: 'Neureal', sans-serif; font-size: 400px; color: var(--ood-deep-violet-light); line-height: 1; }
.title-col { flex: 1; display: flex; align-items: center; }
h2 { font-family: 'Neureal', sans-serif; font-size: 120px; line-height: 1; }
.subtitle { font-size: 28px; color: var(--ood-dark-matter-bright); margin-top: 24px; display: block; }`,
};
