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
  css: `& { padding: 0; flex-direction: column; }
.top { padding: 70px 120px 40px; background: var(--ood-big-cloud); color: var(--ood-dark-matter); }
.top .eyebrow { font-family: 'Inter', sans-serif; font-weight: 500; font-size: 22px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ood-deep-violet); margin-bottom: 16px; }
.top h2 { font-size: 68px; color: var(--ood-deep-violet); line-height: 1.05; max-width: 1500px; }
.compare { flex: 1; display: grid; grid-template-columns: 1fr 1fr; }
.compare > div { padding: 60px 100px; display: flex; flex-direction: column; justify-content: flex-start; }
.side-a { background: var(--ood-white); color: var(--ood-dark-matter); }
.side-b { background: var(--ood-deep-violet-bright); color: var(--ood-dark-matter); }
.side-label { font-family: 'Inter', sans-serif; font-weight: 500; font-size: 20px; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 18px; }
.side-a .side-label { color: var(--ood-dark-matter-light); }
.side-b .side-label { color: var(--ood-deep-violet); }
.side-head { font-family: 'Neureal', sans-serif; font-weight: 400; font-size: 42px; line-height: 1.1; margin-bottom: 22px; }
.side-a .side-head { color: var(--ood-dark-matter); }
.side-b .side-head { color: var(--ood-deep-violet); }
.side-body p { font-size: 22px; line-height: 1.45; margin-bottom: 12px; max-width: 620px; }
.question { background: var(--ood-dark-matter); color: var(--ood-white); padding: 48px 120px; display: flex; align-items: center; gap: 36px; border-top: 2px solid var(--ood-deep-violet); }
.question .q-label { font-family: 'Neureal', sans-serif; font-size: 84px; color: var(--ood-wicked-matrix-light); line-height: 1; }
.question .q-text { font-family: 'Inter', sans-serif; font-weight: 300; font-size: 28px; line-height: 1.4; max-width: 1400px; }
.question em { color: var(--ood-wicked-matrix-light); }`,
};
