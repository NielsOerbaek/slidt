import type { SlideType } from '../renderer/types.ts';

export const friction: SlideType = {
  name: 'friction',
  label: 'Two-side friction with question',
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
  css: `& { flex-direction: column; }
.top { margin-bottom: 32px; }
h2 { font-family: 'Neureal', sans-serif; font-size: 56px; line-height: 1.05; }
.compare { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; flex: 1; }
.side-a, .side-b { background: var(--ood-white); padding: 32px; display: flex; flex-direction: column; gap: 16px; }
.side-label { font-family: 'Neureal Mono', monospace; font-size: 18px; color: var(--ood-deep-violet); }
.side-head { font-family: 'Neureal', sans-serif; font-size: 28px; line-height: 1.1; }
.side-body p { font-size: 20px; line-height: 1.4; }
.question { background: var(--ood-dark-matter); color: var(--ood-white); padding: 32px; display: grid; grid-template-columns: 80px 1fr; gap: 32px; align-items: center; margin-top: 32px; }
.q-label { font-family: 'Neureal Mono', monospace; font-size: 64px; color: var(--ood-deep-violet-light); }
.q-text { font-size: 24px; line-height: 1.4; }`,
};
