import type { SlideType } from '../renderer/types.ts';

export const imageFull: SlideType = {
  name: 'image-full',
  label: 'Full-bleed image',
  fields: [
    { name: 'image', type: 'image', required: true },
    { name: 'overlay', type: 'bool', default: true },
    { name: 'headline', type: 'text' },
    { name: 'caption', type: 'text' },
  ],
  htmlTemplate: `<div class="image-full-slide{{#if overlay}} has-overlay{{/if}}">
  {{img image "full-img"}}
  <div class="text-bar">
    {{#if headline}}<h2>{{fmt headline}}</h2>{{/if}}
    {{#if caption}}<p>{{fmt caption}}</p>{{/if}}
  </div>
</div>`,
  css: `& { padding: 0; overflow: hidden; }
.image-full-slide { position: relative; width: 100%; height: 100%; }
.full-img { position: absolute; inset: 0; }
.has-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
  z-index: 1;
  pointer-events: none;
}
.text-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 60px 120px;
  z-index: 2;
}
h2 {
  font-size: 80px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
  font-family: var(--sl-font, 'Neureal', 'Inter', sans-serif);
}
p {
  font-size: 28px;
  color: rgba(255,255,255,0.8);
  font-family: var(--sl-body-font, var(--sl-font, 'Inter', sans-serif));
}
@media (max-width: 768px) {
  .text-bar { padding: 32px 24px; }
  h2 { font-size: 2rem; }
  p { font-size: 1rem; }
}`,
};
