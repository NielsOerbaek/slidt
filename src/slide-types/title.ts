import type { SlideType } from '../renderer/types.ts';

export const TITLE_MARKS: Record<string, string> = {
  'dandelion-green': 'assets/ood-mark-green.svg',
  'dandelion-violet': 'assets/ood-mark-violet.svg',
  'dandelion-white': 'assets/ood-mark.svg',
};

export const title: SlideType = {
  name: 'title',
  label: 'Title slide',
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'richtext', required: true },
    { name: 'titleAlt', type: 'richtext' },
    { name: 'kicker', type: 'text' },
    { name: 'mark', type: 'select', options: Object.keys(TITLE_MARKS), default: 'dandelion-violet' },
    { name: 'markUrl', type: 'text' },
  ],
  htmlTemplate: `<div class="title-col">
  <div class="eyebrow">{{fmt eyebrow}}</div>
  <h1>{{fmt title}}<br/><span class="alt">{{fmt titleAlt}}</span></h1>
  <p class="kicker">{{fmt kicker}}</p>
</div>
<div class="dandelion">
  <img src="{{default markUrl "assets/ood-mark-violet.svg"}}" alt="" />
</div>`,
  css: `.title-col { flex: 1; }
h1 { font-family: 'Neureal', sans-serif; font-size: 180px; line-height: 0.95; }
.alt { color: var(--ood-deep-violet); }
.kicker { font-size: 32px; margin-top: 32px; max-width: 900px; }
.dandelion { flex: 0 0 600px; display: flex; align-items: center; justify-content: center; }
.dandelion img { width: 500px; height: auto; }`,
};
