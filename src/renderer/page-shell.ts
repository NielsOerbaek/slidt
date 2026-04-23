function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface PageShellOptions {
  lang: string;
  title: string;
  css: string;
  body: string;
}

export function pageShell(opts: PageShellOptions): string {
  return `<!doctype html>
<html lang="${escape(opts.lang)}">
<head>
<meta charset="utf-8" />
<title>${escape(opts.title)}</title>
<style>${opts.css}</style>
</head>
<body>
${opts.body}
</body>
</html>
`;
}
