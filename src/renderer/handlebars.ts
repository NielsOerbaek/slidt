import Handlebars from 'handlebars';
import { fmt } from './fmt.ts';
import { dandelionSvg } from './symbols.ts';
import { parseImage, imgWrapAttrs } from './image-transform.ts';

// Use an isolated Handlebars environment so multiple render() calls in the
// same process don't accidentally share state with user code.
const env = Handlebars.create();

env.registerHelper('fmt', (value: unknown) => {
  const text = typeof value === 'string' ? value : value == null ? '' : String(value);
  return new env.SafeString(fmt(text));
});

env.registerHelper('eq', (a: unknown, b: unknown) => a === b);

env.registerHelper('default', (value: unknown, fallback: unknown) => {
  if (value === null || value === undefined || value === '') return fallback;
  return value;
});

env.registerHelper('dandelion', (mark: unknown) => {
  const name = typeof mark === 'string' && mark ? mark : 'dandelion-violet';
  return new env.SafeString(dandelionSvg(name));
});

env.registerHelper('img', (fieldValue: unknown, wrapperClass: unknown) => {
  const cls = typeof wrapperClass === 'string' && wrapperClass ? wrapperClass : '';

  const parsed = parseImage(fieldValue);
  if (!parsed) return new env.SafeString('');

  const src = `/api/assets/${encodeURIComponent(parsed.id)}`;
  const { className, style } = imgWrapAttrs(parsed, cls);

  // No loading="lazy": the PDF export stacks every slide in one tall document
  // and prints without scrolling, so lazy images below the fold never load.
  return new env.SafeString(
    `<div class="${className}" style="${style}"><img src="${src}" alt="" /></div>`,
  );
});

type CompiledTemplate = (ctx: Record<string, unknown>) => string;

const cache = new Map<string, CompiledTemplate>();

export function compile(source: string): CompiledTemplate {
  const cached = cache.get(source);
  if (cached) return cached;
  const fn = env.compile(source, { noEscape: false, strict: false });
  cache.set(source, fn);
  return fn;
}

export { env as handlebars };
