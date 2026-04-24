import type { SlideType } from '../renderer/types.ts';

export const agenda: SlideType = {
  name: 'agenda',
  label: 'Agenda',
  fields: [
    { name: 'title', type: 'richtext', required: true },
    {
      name: 'items',
      type: 'list',
      required: true,
      items: { name: 'item', type: 'richtext' },
    },
  ],
  htmlTemplate: `<div style="width:100%;">
  <h1>{{fmt title}}</h1>
  <ol>
    {{#each items}}<li>{{fmt this}}</li>{{/each}}
  </ol>
</div>`,
  css: `h1 { font-size: 120px; color: var(--ood-deep-violet); margin-bottom: 96px; }
ol { list-style: none; counter-reset: agendacount; margin-left: 160px; }
li { counter-increment: agendacount; font-size: 40px; color: var(--ood-dark-matter); padding: 14px 0; display: flex; align-items: baseline; gap: 56px; }
li::before { content: counter(agendacount); font-family: 'Neureal Mono', monospace; color: var(--ood-deep-violet); min-width: 60px; font-size: 40px; }`,
};
