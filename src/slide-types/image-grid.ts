import type { SlideType } from '../renderer/types.ts';

export const imageGrid: SlideType = {
  name: 'image-grid',
  label: 'Image grid',
  fields: [
    {
      name: 'images',
      type: 'list',
      items: {
        name: 'item',
        type: 'group',
        fields: [
          { name: 'image', type: 'image', required: true },
          { name: 'caption', type: 'text' },
        ],
      },
    },
  ],
  htmlTemplate: `<div class="image-grid-slide">
  {{#each images}}
  <div class="grid-cell">
    {{img image "grid-img"}}
    {{#if caption}}<p class="grid-caption">{{fmt caption}}</p>{{/if}}
  </div>
  {{/each}}
</div>`,
  css: `& { padding: 0; overflow: hidden; }
.image-grid-slide {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 4px;
  width: 100%;
  height: 100%;
}
.grid-cell:only-child {
  grid-column: 1 / -1;
  grid-row: 1 / -1;
}
.grid-cell:first-child:nth-last-child(2),
.grid-cell:first-child:nth-last-child(2) ~ .grid-cell {
  grid-row: 1 / -1;
}
.grid-cell:first-child:nth-last-child(3) ~ .grid-cell:last-child {
  grid-column: 1 / -1;
}
.grid-cell {
  position: relative;
  overflow: hidden;
}
.grid-img { position: absolute; inset: 0; }
.grid-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px;
  background: rgba(0,0,0,0.55);
  color: rgba(255,255,255,0.9);
  font-size: 18px;
  font-family: var(--sl-body-font, var(--sl-font, 'Inter', sans-serif));
  z-index: 2;
}
@media (max-width: 768px) {
  .image-grid-slide {
    grid-template-columns: 1fr;
    grid-template-rows: none;
  }
  .grid-cell:first-child:nth-last-child(2),
  .grid-cell:first-child:nth-last-child(2) ~ .grid-cell {
    grid-row: auto;
  }
  .grid-cell:first-child:nth-last-child(3) ~ .grid-cell:last-child {
    grid-column: auto;
  }
  .grid-cell { height: 200px; }
  .grid-cell:only-child { height: 400px; }
}`,
};
