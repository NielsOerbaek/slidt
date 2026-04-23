import postcss, { type Plugin } from 'postcss';

const LEAVE_ALONE_AT = new Set(['font-face', 'keyframes', 'page', 'counter-style']);

function scopePlugin(scope: string): Plugin {
  const prefix = `.st-${scope}`;
  return {
    postcssPlugin: 'scope-css',
    Once(root) {
      root.walkAtRules((rule) => {
        if (rule.name === 'import') {
          throw new Error('CSS @import is not allowed');
        }
      });
      // Translate leading "& { ... }" (scope-root selector) into the bare
      // prefix so the walker below doesn't prepend twice.
      root.walkRules((rule) => {
        rule.selectors = rule.selectors.map((s) =>
          s.trim() === '&' ? '__SCOPE_ROOT__' : s,
        );
      });

      root.walkRules((rule) => {
        // Skip rules inside untouched at-rules.
        let parent = rule.parent;
        while (parent && parent.type !== 'root') {
          if (parent.type === 'atrule' && LEAVE_ALONE_AT.has((parent as any).name)) {
            return;
          }
          parent = parent.parent;
        }

        // Don't prefix :root — it's global.
        rule.selectors = rule.selectors.map((sel) => {
          const s = sel.trim();
          if (s === ':root' || s === 'html' || s === 'body') return s;
          if (s === '__SCOPE_ROOT__') return prefix;
          return `${prefix} ${s}`;
        });
      });
    },
  };
}
// Declare the plugin as a function plugin for postcss typing
(scopePlugin as unknown as { postcss: boolean }).postcss = true;

export async function scopeCss(css: string, scope: string): Promise<string> {
  const result = await postcss([scopePlugin(scope)]).process(css, { from: undefined });
  return result.css;
}
