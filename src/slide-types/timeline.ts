import type { SlideType } from '../renderer/types.ts';

export const timeline: SlideType = {
  name: 'timeline',
  label: 'Timeline',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    {
      name: 'events',
      type: 'list',
      required: true,
      items: {
        name: 'event',
        type: 'group',
        fields: [
          { name: 'year', type: 'text', required: true },
          { name: 'title', type: 'text', required: true },
          { name: 'body', type: 'text' },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="timeline-slide">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <div class="events">
    {{#each events}}
    <div class="event">
      <div class="year">{{fmt year}}</div>
      <div class="dot-col"><div class="dot"></div></div>
      <div class="content">
        <div class="ev-title">{{fmt title}}</div>
        {{#if body}}<div class="ev-body">{{fmt body}}</div>{{/if}}
      </div>
    </div>
    {{/each}}
  </div>
</div>`,
  css: `& { flex-direction: column; padding: 80px 120px; background: var(--sl-bg, #f5f5f3); overflow: hidden; }
.eyebrow { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--sl-dim, #a0a09a); margin-bottom: 16px; font-family: var(--sl-font, 'Inter', sans-serif); }
h2 { font-size: 2.5rem; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 48px; letter-spacing: -0.025em; font-family: var(--sl-font, 'Inter', sans-serif); }
.events { display: flex; flex-direction: column; }
.event { display: grid; grid-template-columns: 100px 28px 1fr; align-items: start; }
.year { font-size: 0.8rem; font-weight: 500; color: var(--sl-dim, #a0a09a); padding-top: 4px; font-family: var(--sl-font, 'Inter', sans-serif); text-align: right; padding-right: 18px; }
.dot-col { display: flex; flex-direction: column; align-items: center; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: var(--sl-fg, #1a1a1a); flex-shrink: 0; position: relative; }
.dot::after { content: ''; position: absolute; left: 4px; top: 10px; width: 2px; height: 9999px; background: var(--sl-border, #e0e0db); }
.event:last-child .dot::after { display: none; }
.content { padding: 0 0 32px 18px; }
.ev-title { font-size: 1rem; font-weight: 500; color: var(--sl-fg, #1a1a1a); margin-bottom: 4px; font-family: var(--sl-font, 'Inter', sans-serif); }
.ev-body { font-size: 0.875rem; color: var(--sl-dim, #a0a09a); font-family: var(--sl-font, 'Inter', sans-serif); line-height: 1.5; }
@media (max-width: 768px) {
  & { padding: 40px 24px; }
  .event { grid-template-columns: 64px 22px 1fr; }
  h2 { font-size: 1.75rem; margin-bottom: 32px; }
}`,
};
