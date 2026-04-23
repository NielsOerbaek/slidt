import Handlebars from 'handlebars';
import { fmt } from './fmt.ts';

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
