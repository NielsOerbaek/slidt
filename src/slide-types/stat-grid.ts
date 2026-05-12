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
.eyebrow { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--sl-dim, #a0a09a); margin-bottom: 16px; font-family: var(--sl-font, 'Inter', sans-serif); }
h2 { font-size: 2.5rem; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 60px; letter-spacing: -0.025em; font-family: var(--sl-font, 'Inter', sans-serif); }
.stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
.stat-card { background: var(--sl-surface, #fafaf8); border: 1px solid var(--sl-border, #e0e0db); border-radius: 10px; padding: 40px 32px; }
.value { font-size: clamp(3rem, 6vw, 5rem); font-weight: 600; color: var(--sl-fg, #1a1a1a); letter-spacing: -0.04em; line-height: 1; margin-bottom: 12px; font-family: var(--sl-font, 'Inter', sans-serif); }
.lbl { font-size: 1rem; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 8px; font-family: var(--sl-font, 'Inter', sans-serif); }
.desc { font-size: 0.875rem; font-weight: 400; color: var(--sl-dim, #a0a09a); font-family: var(--sl-font, 'Inter', sans-serif); line-height: 1.5; }
@media (max-width: 768px) {
  & { padding: 40px 24px; }
  .stat-row { grid-template-columns: 1fr; gap: 16px; }
  h2 { font-size: 1.75rem; margin-bottom: 32px; }
}`,
};
