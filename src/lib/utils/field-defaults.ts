import type { Field } from '../../renderer/types.ts';

// Plausible Danish placeholder copy keyed by field name. Used by template
// previews so tiles read like real content instead of repeating field names.
const TEXT_BY_NAME: Record<string, string> = {
  title: 'Tre spor til vækst',
  titleAlt: 'i 2026',
  subtitle: 'En kort gennemgang af kvartalets fokus',
  eyebrow: 'KVARTALSOPDATERING',
  kicker: 'Et hurtigt overblik over hvor vi står — og hvor vi skal hen.',
  body: 'Vi har skiftet retning på tre konkrete punkter, og det kan allerede aflæses i tallene. Næste skridt er at konsolidere.',
  text: 'Vi tester ideer i små eksperimenter og deler de bedste resultater på tværs.',
  callout: 'Det vigtigste vi tager med fra mødet.',
  question: 'Hvad gør vi anderledes næste gang?',
  head: 'Hovedpointe',
  heading: 'Hovedpointe',
  label: 'Fokusområde',
  source: 'Interne data, Q1 2026',
  num: '01',
  letter: 'A',
  bigMark: '§',
  sub: 'Næste skridt',
};

const LIST_BY_NAME: Record<string, string[]> = {
  bullets: [
    'Sætte de første milepæle for kvartalet',
    'Justere processen efter feedback fra Q1',
    'Hente input fra teamet før vi skalerer',
  ],
  items: [
    'Klarhed før hurtighed',
    'Hands-on før abstraktion',
    'Fælles ejerskab over leverancen',
  ],
  paragraphs: [
    'Vi har skiftet kadence fra månedlige til ugentlige check-ins.',
    'Det giver os hurtigere feedback uden at trække tempoet ned.',
  ],
  cards: ['Indsigt', 'Idé', 'Eksperiment'],
  columns: ['Nu', 'Næste', 'Senere'],
};

function listForName(name: string, label: string | undefined): string[] {
  const known = LIST_BY_NAME[name];
  if (known) return known;
  const base = label ?? name;
  return [`${base} 1`, `${base} 2`, `${base} 3`];
}

function textForField(field: Field): string {
  const known = TEXT_BY_NAME[field.name];
  if (known) return known;
  return field.label ?? field.name;
}

/**
 * Returns realistic-looking placeholder values for use in live preview.
 * Unlike buildDefaultData, text fields get sample copy instead of empty strings.
 */
export function buildDummyData(fields: Field[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.default !== undefined) {
      result[field.name] = field.default;
    } else if (field.type === 'bool') {
      result[field.name] = true;
    } else if (field.type === 'select') {
      result[field.name] = field.options?.[0] ?? '';
    } else if (field.type === 'list') {
      const itemField = field.items;
      if (itemField?.type === 'group') {
        result[field.name] = [
          buildDummyData(itemField.fields ?? []),
          buildDummyData(itemField.fields ?? []),
          buildDummyData(itemField.fields ?? []),
        ];
      } else {
        result[field.name] = listForName(field.name, field.label);
      }
    } else if (field.type === 'group') {
      result[field.name] = buildDummyData(field.fields ?? []);
    } else if (field.type === 'image') {
      result[field.name] = '';
    } else if (field.type === 'markdown') {
      result[field.name] = `**${textForField(field)}** med _udvalgte detaljer_ og et [link](#).`;
    } else {
      // text, richtext
      result[field.name] = textForField(field);
    }
  }
  return result;
}

export function buildDefaultData(fields: Field[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.default !== undefined) {
      result[field.name] = field.default;
    } else if (field.type === 'bool') {
      result[field.name] = false;
    } else if (field.type === 'list') {
      result[field.name] = [];
    } else if (field.type === 'group') {
      result[field.name] = buildDefaultData(field.fields ?? []);
    } else {
      result[field.name] = '';
    }
  }
  return result;
}
