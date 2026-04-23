import Handlebars from 'handlebars';

export class GuardrailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GuardrailError';
  }
}

// All helpers allowed in agent-generated templates
const ALLOWED_HELPERS = new Set(['fmt', 'eq', 'default', 'each', 'if', 'unless', 'with']);

type AstNode = { type: string } & Record<string, unknown>;

function walkAst(node: unknown): void {
  if (!node || typeof node !== 'object') return;
  const n = node as AstNode;

  switch (n.type) {
    case 'PartialStatement':
    case 'PartialBlock':
      throw new GuardrailError('Partial references are not allowed in templates');

    case 'MustacheStatement': {
      const path = n.path as { original: string } | undefined;
      const params = (n.params as unknown[]) ?? [];
      const hash = n.hash as { pairs: unknown[] } | undefined;
      // It's a helper call only if it has explicit params or hash entries
      if (path && (params.length > 0 || (hash?.pairs.length ?? 0) > 0)) {
        if (!ALLOWED_HELPERS.has(path.original)) {
          throw new GuardrailError(`Unknown helper: "${path.original}"`);
        }
      }
      break;
    }

    case 'BlockStatement': {
      const path = n.path as { original: string } | undefined;
      if (path && !ALLOWED_HELPERS.has(path.original)) {
        throw new GuardrailError(`Unknown block helper: "${path.original}"`);
      }
      break;
    }

    case 'SubExpression': {
      const path = n.path as { original: string } | undefined;
      if (path && !ALLOWED_HELPERS.has(path.original)) {
        throw new GuardrailError(`Unknown helper in sub-expression: "${path.original}"`);
      }
      break;
    }
  }

  // Recurse into child nodes
  for (const key of Object.keys(n)) {
    if (key === 'type') continue;
    const child = n[key];
    if (Array.isArray(child)) {
      for (const item of child) walkAst(item);
    } else if (child && typeof child === 'object' && 'type' in (child as object)) {
      walkAst(child);
    }
  }
}

export function checkHandlebarsTemplate(template: string): void {
  let ast: unknown;
  try {
    ast = Handlebars.parse(template);
  } catch (err) {
    throw new GuardrailError(
      `Template parse error: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  walkAst(ast);
}

const UNSAFE_URL_RE = /^(?:https?:|ftp:|\/\/|javascript:)/i;

export function checkCss(css: string): void {
  if (/@import/i.test(css)) {
    throw new GuardrailError('@import is not allowed in template CSS');
  }
  for (const match of css.matchAll(/url\s*\(\s*['"]?(.*?)['"]?\s*\)/gi)) {
    const urlValue = (match[1] ?? '').trim();
    if (urlValue && UNSAFE_URL_RE.test(urlValue)) {
      throw new GuardrailError(`url() with external reference is not allowed: ${urlValue}`);
    }
  }
  if (/expression\s*\(/i.test(css)) {
    throw new GuardrailError('expression() is not allowed in template CSS');
  }
  if (/\bbehavior\s*:/i.test(css)) {
    throw new GuardrailError('behavior: is not allowed in template CSS');
  }
}
