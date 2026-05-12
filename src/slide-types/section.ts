import type { SlideType } from '../renderer/types.ts';

export const divider: SlideType = {
  name: 'divider',
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
  css: `& { padding: 0; }
.num-col { width: 40%; background: var(--sl-accent-bg); display: flex; align-items: center; justify-content: center; position: relative; }
.big-num { font-family: var(--sl-font, 'Neureal', sans-serif); font-size: 900px; line-height: 0.85; color: var(--sl-accent); margin-top: -40px; }
.title-col { width: 60%; background: var(--sl-surface); display: flex; align-items: center; padding: 120px; }
h2 { font-size: 96px; color: var(--sl-accent); line-height: 1.02; }
.subtitle { display: block; font-family: var(--sl-body-font, var(--sl-font, 'Inter', sans-serif)); font-weight: 300; font-size: 32px; color: var(--sl-fg); margin-top: 24px; }`,
};
