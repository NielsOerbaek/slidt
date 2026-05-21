import Handlebars from 'handlebars';
import { fmt } from './fmt.ts';
import { dandelionSvg } from './symbols.ts';

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

  let id: string;
  let cropX = 0, cropY = 0, cropW = 100, cropH = 100, rotate = 0;

  if (typeof fieldValue === 'string' && fieldValue) {
    id = fieldValue;
  } else if (fieldValue !== null && fieldValue !== undefined && typeof fieldValue === 'object') {
    const v = fieldValue as Record<string, unknown>;
    id = typeof v.id === 'string' ? v.id : '';
    cropX = typeof v.cropX === 'number' ? v.cropX : 0;
    cropY = typeof v.cropY === 'number' ? v.cropY : 0;
    cropW = typeof v.cropW === 'number' && v.cropW > 0 ? v.cropW : 100;
    cropH = typeof v.cropH === 'number' && v.cropH > 0 ? v.cropH : 100;
    rotate = typeof v.rotate === 'number' ? v.rotate : 0;
  } else {
    return new env.SafeString('');
  }

  if (!id) return new env.SafeString('');

  const src = `/api/assets/${encodeURIComponent(id)}`;
  const style = [
    `--crop-x: ${cropX}`,
    `--crop-y: ${cropY}`,
    `--crop-w: ${cropW}`,
    `--crop-h: ${cropH}`,
    `--rotate: ${rotate}deg`,
  ].join('; ');

  const divClass = ['img-wrap', cls].filter(Boolean).join(' ');
  return new env.SafeString(
    `<div class="${divClass}" style="${style}"><img src="${src}" alt="" loading="lazy" /></div>`,
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
