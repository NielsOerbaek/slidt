import type { SlideType } from '../renderer/types.ts';

export const appendixList: SlideType = {
  name: 'appendix-list',
  label: 'Appendix list (auto-appended)',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext' },
    {
      name: 'items',
      type: 'list',
      required: true,
      items: {
        name: 'item',
        type: 'group',
        fields: [
          { name: 'mark', type: 'text', default: '§' },
          { name: 'title', type: 'richtext' },
          { name: 'subtitle', type: 'richtext' },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="content">
  {{#if eyebrow}}<div class="eyebrow">{{fmt eyebrow}}</div>{{/if}}
  {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
  <ul class="app-list">
    {{#each items}}<li>
      <div class="app-mark">{{fmt (default mark "§")}}</div>
      <div class="app-text">
        <div class="app-title">{{fmt title}}</div>
        <div class="app-sub">{{fmt subtitle}}</div>
      </div>
    </li>{{/each}}
  </ul>
</div>`,
  css: `.content { flex-direction: column; padding: 100px 140px; }
.eyebrow { font-family: 'Inter', sans-serif; font-weight: 500; font-size: 22px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ood-deep-violet); margin-bottom: 28px; }
h2 { font-size: 84px; line-height: 1.02; margin-bottom: 48px; max-width: 1500px; color: var(--ood-deep-violet); }
.app-list { list-style: none; margin: 24px 0 0; padding: 0; display: flex; flex-direction: column; gap: 44px; }
.app-list li { display: grid; grid-template-columns: 140px 1fr; align-items: baseline; column-gap: 48px; }
.app-mark { font-family: 'Neureal', sans-serif; font-size: 96px; color: var(--ood-deep-violet); line-height: 1; text-align: left; }
.app-title { font-family: 'Neureal', sans-serif; font-size: 48px; color: var(--ood-dark-matter); line-height: 1.1; margin-bottom: 10px; }
.app-sub { font-family: 'Inter', sans-serif; font-weight: 300; font-size: 24px; color: var(--ood-dark-matter-light); line-height: 1.4; max-width: 1200px; }`,
};
