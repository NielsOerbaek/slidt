import type { SlideType } from '../renderer/types.ts';

export const imageSide: SlideType = {
  name: 'image-side',
  label: 'Image + text',
  fields: [
    { name: 'image', type: 'image', required: true },
    { name: 'title', type: 'richtext' },
    { name: 'body', type: 'richtext' },
    { name: 'flip', type: 'bool', default: false, label: 'Image on right' },
  ],
  htmlTemplate: `<div class="image-side-slide{{#if flip}} flipped{{/if}}">
  <div class="img-col">{{img image "side-img"}}</div>
  <div class="text-col">
    {{#if title}}<h2>{{fmt title}}</h2>{{/if}}
    {{#if body}}<p>{{fmt body}}</p>{{/if}}
  </div>
</div>`,
  css: `& { padding: 0; overflow: hidden; }
.image-side-slide { display: grid; grid-template-columns: 1fr 1fr; width: 100%; height: 100%; }
.image-side-slide.flipped { direction: rtl; }
.image-side-slide.flipped > * { direction: ltr; }
.img-col { position: relative; overflow: hidden; }
.side-img { position: absolute; inset: 0; }
.text-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px 100px;
  background: var(--sl-bg, #f5f5f3);
}
h2 {
  font-size: 64px;
  font-weight: 500;
  color: var(--sl-accent, #6E31FF);
  margin-bottom: 32px;
  letter-spacing: -0.02em;
  line-height: 1.05;
  font-family: var(--sl-font, 'Neureal', 'Inter', sans-serif);
}
p {
  font-size: 28px;
  color: var(--sl-dim, #a0a09a);
  line-height: 1.5;
  font-family: var(--sl-body-font, var(--sl-font, 'Inter', sans-serif));
}
@media (max-width: 768px) {
  .image-side-slide { grid-template-columns: 1fr; grid-template-rows: 300px 1fr; }
  .image-side-slide.flipped { direction: ltr; }
  .text-col { padding: 40px 24px; }
  h2 { font-size: 2rem; margin-bottom: 16px; }
  p { font-size: 1rem; }
}`,
};
