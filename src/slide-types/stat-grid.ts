import type { SlideType } from '../renderer/types.ts';

export const statGrid: SlideType = {
  name: 'stat-grid',
  label: 'Stat grid',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    {
      name: 'stats',
      type: 'list',
      required: true,
      items: {
        name: 'stat',
        type: 'group',
        fields: [
          { name: 'value', type: 'text', required: true },
          { name: 'label', type: 'text', required: true },
          { name: 'description', type: 'text' },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="stat-slide">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <div class="stat-row">
    {{#each stats}}
    <div class="stat-card">
      <div class="value">{{fmt value}}</div>
      <div class="lbl">{{fmt label}}</div>
      {{#if description}}<div class="desc">{{fmt description}}</div>{{/if}}
    </div>
    {{/each}}
  </div>
</div>`,
  css: `& { flex-direction: column; padding: 80px 120px; background: var(--sl-bg, #f5f5f3); }
.eyebrow { font-size: 20px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--sl-dim, #a0a09a); margin-bottom: 24px; font-family: var(--sl-font, 'Neureal', 'Inter', sans-serif); }
h2 { font-size: 80px; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 64px; letter-spacing: -0.03em; font-family: var(--sl-font, 'Neureal', 'Inter', sans-serif); }
.stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
.stat-card { background: var(--sl-surface, #ededed); border: 2px solid var(--sl-border, #e0e0db); padding: 48px 40px; }
.value { font-size: 120px; font-weight: 600; color: var(--sl-fg, #1a1a1a); letter-spacing: -0.04em; line-height: 1; margin-bottom: 16px; font-family: var(--sl-font, 'Neureal', 'Inter', sans-serif); }
.lbl { font-size: 28px; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 10px; font-family: var(--sl-font, 'Neureal', 'Inter', sans-serif); }
.desc { font-size: 22px; font-weight: 400; color: var(--sl-dim, #a0a09a); font-family: var(--sl-font, 'Neureal', 'Inter', sans-serif); line-height: 1.4; }
@media (max-width: 768px) {
  & { padding: 40px 24px; }
  .stat-row { grid-template-columns: 1fr; gap: 16px; }
  h2 { font-size: 2.5rem; margin-bottom: 32px; }
  .value { font-size: 4rem; }
  .lbl { font-size: 1.25rem; }
  .desc { font-size: 1rem; }
}`,
};
