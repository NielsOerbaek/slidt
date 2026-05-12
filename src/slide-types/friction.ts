import type { SlideType } from '../renderer/types.ts';

export const comparison: SlideType = {
  name: 'comparison',
  label: 'Two-side comparison',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext', required: true },
    {
      name: 'sideA',
      type: 'group',
      required: true,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'head', type: 'richtext', required: true },
        {
          name: 'body',
          type: 'list',
          required: true,
          items: { name: 'p', type: 'richtext' },
        },
      ],
    },
    {
      name: 'sideB',
      type: 'group',
      required: true,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'head', type: 'richtext', required: true },
        {
          name: 'body',
          type: 'list',
          required: true,
          items: { name: 'p', type: 'richtext' },
        },
      ],
    },
    { name: 'question', type: 'richtext', required: true },
  ],
  htmlTemplate: `<div class="top">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  <h2>{{fmt title}}</h2>
</div>
<div class="compare">
  <div class="side-a">
    <div class="side-label">{{fmt sideA.label}}</div>
    <div class="side-head">{{fmt sideA.head}}</div>
    <div class="side-body">{{#each sideA.body}}<p>{{fmt this}}</p>{{/each}}</div>
  </div>
  <div class="side-b">
    <div class="side-label">{{fmt sideB.label}}</div>
    <div class="side-head">{{fmt sideB.head}}</div>
    <div class="side-body">{{#each sideB.body}}<p>{{fmt this}}</p>{{/each}}</div>
  </div>
</div>
<div class="question">
  <div class="q-label">?</div>
  <div class="q-text">{{fmt question}}</div>
</div>`,
  css: `& { padding: 0; flex-direction: column; }
.top { padding: 70px 120px 40px; background: var(--sl-surface); color: var(--sl-fg); }
.top .eyebrow { font-family: var(--sl-body-font, var(--sl-font, 'Inter', sans-serif)); font-weight: 500; font-size: 22px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--sl-accent); margin-bottom: 16px; }
.top h2 { font-size: 68px; color: var(--sl-accent); line-height: 1.05; max-width: 1500px; }
.compare { flex: 1; display: grid; grid-template-columns: 1fr 1fr; }
.compare > div { padding: 60px 100px; display: flex; flex-direction: column; justify-content: flex-start; }
.side-a { background: var(--sl-bg); color: var(--sl-fg); }
.side-b { background: var(--sl-accent-bg); color: var(--sl-fg); }
.side-label { font-family: var(--sl-body-font, var(--sl-font, 'Inter', sans-serif)); font-weight: 500; font-size: 20px; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 18px; }
.side-a .side-label { color: var(--sl-dim); }
.side-b .side-label { color: var(--sl-accent); }
.side-head { font-family: var(--sl-font, 'Neureal', sans-serif); font-weight: 400; font-size: 42px; line-height: 1.1; margin-bottom: 22px; }
.side-a .side-head { color: var(--sl-fg); }
.side-b .side-head { color: var(--sl-accent); }
.side-body p { font-size: 22px; line-height: 1.45; margin-bottom: 12px; max-width: 620px; }
.question { background: var(--sl-dark-bg); color: var(--sl-dark-fg); padding: 48px 120px; display: flex; align-items: center; gap: 36px; border-top: 2px solid var(--sl-accent); }
.question .q-label { font-family: var(--sl-font, 'Neureal', sans-serif); font-size: 84px; color: var(--sl-accent); line-height: 1; }
.question .q-text { font-family: var(--sl-body-font, var(--sl-font, 'Inter', sans-serif)); font-weight: 300; font-size: 28px; line-height: 1.4; max-width: 1400px; }
.question em { color: var(--sl-accent); }`,
};
