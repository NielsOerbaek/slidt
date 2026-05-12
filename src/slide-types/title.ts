import type { SlideType } from '../renderer/types.ts';

export const cover: SlideType = {
  name: 'cover',
  label: 'Cover',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext', required: true },
    { name: 'titleAlt', type: 'richtext' },
    { name: 'kicker', type: 'text' },
  ],
  htmlTemplate: `<div class="cover-col">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  <h1>{{fmt title}}{{#if titleAlt}}<br/><span class="alt">{{fmt titleAlt}}</span>{{/if}}</h1>
  {{#if kicker}}<p class="kicker">{{fmt kicker}}</p>{{/if}}
</div>`,
  css: `& { flex-direction: column; justify-content: center; padding: 120px; }
.eyebrow { font-family: var(--sl-font, 'Neureal', sans-serif); font-size: 40px; color: var(--sl-fg); margin-bottom: 32px; letter-spacing: 0.02em; }
h1 { font-size: 120px; color: var(--sl-accent); line-height: 1.02; margin-bottom: 48px; }
h1 .alt { color: var(--sl-fg); display: block; }
.kicker { font-family: var(--sl-body-font, var(--sl-font, 'Inter', sans-serif)); font-weight: 300; font-size: 32px; line-height: 1.4; color: var(--sl-fg); max-width: 720px; }
@media (max-width: 768px) {
  & { padding: 60px 40px; }
  h1 { font-size: 64px; }
  .eyebrow { font-size: 24px; }
  .kicker { font-size: 20px; }
}`,
};
