import type { SlideType } from '../renderer/types.ts';

export const dotFlow: SlideType = {
  name: 'dot-flow',
  label: 'Process flow',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    {
      name: 'steps',
      type: 'list',
      required: true,
      items: {
        name: 'step',
        type: 'group',
        fields: [
          { name: 'title', type: 'text', required: true },
          { name: 'caption', type: 'text' },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="dot-flow-slide">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <div class="flow">
    {{#each steps}}
    <div class="step">
      <div class="step-dot"></div>
      <div class="step-title">{{fmt title}}</div>
      {{#if caption}}<div class="step-caption">{{fmt caption}}</div>{{/if}}
    </div>
    {{#unless @last}}<div class="connector"></div>{{/unless}}
    {{/each}}
  </div>
</div>`,
  css: `& { flex-direction: column; justify-content: center; padding: 80px 120px; background: var(--sl-bg, #f5f5f3); }
.eyebrow { font-size: 20px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--sl-dim, #a0a09a); margin-bottom: 24px; font-family: var(--sl-font, 'Neureal', 'Inter', sans-serif); }
h2 { font-size: 80px; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 64px; letter-spacing: -0.03em; font-family: var(--sl-font, 'Neureal', 'Inter', sans-serif); }
.flow { display: flex; flex-direction: row; align-items: flex-start; }
.step { display: flex; flex-direction: column; align-items: center; text-align: center; min-width: 160px; }
.step-dot { width: 16px; height: 16px; border-radius: 50%; background: var(--sl-fg, #1a1a1a); margin-bottom: 20px; flex-shrink: 0; }
.connector { flex: 1; height: 2px; background: var(--sl-border, #e0e0db); margin-top: 7px; }
.step-title { font-size: 26px; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 8px; font-family: var(--sl-font, 'Neureal', 'Inter', sans-serif); }
.step-caption { font-size: 20px; color: var(--sl-dim, #a0a09a); font-family: var(--sl-body-font, var(--sl-font, 'Inter', sans-serif)); line-height: 1.4; }
@media (max-width: 768px) {
  & { padding: 40px 24px; }
  .flow { flex-direction: column; align-items: flex-start; gap: 0; }
  .step { flex-direction: row; align-items: flex-start; text-align: left; gap: 16px; min-width: unset; padding-bottom: 24px; }
  .step-dot { margin-bottom: 0; margin-top: 4px; }
  .connector { display: none; }
}`,
};
