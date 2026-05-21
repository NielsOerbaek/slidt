import { describe, it, expect } from 'vitest';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import os from 'os';
import { injectFontCss, rewriteAssetUrls } from '../src/lib/server/pdf.ts';

describe('injectFontCss', () => {
  it('inserts font CSS at the top of the style block', () => {
    const html = '<head><style>body { color: red; }</style></head>';
    const result = injectFontCss(html, '@font-face { font-family: Inter; }');
    expect(result).toBe(
      '<head><style>\n@font-face { font-family: Inter; }\nbody { color: red; }</style></head>',
    );
  });

  it('returns html unchanged when fontCss is empty string', () => {
    const html = '<head><style>body{}</style></head>';
    expect(injectFontCss(html, '')).toBe(html);
  });

  it('returns html unchanged when there is no style tag', () => {
    const html = '<head></head><body></body>';
    expect(injectFontCss(html, '@font-face{}')).toBe(html);
  });
});

describe('rewriteAssetUrls', () => {
  it('returns html unchanged when assetMap is empty', async () => {
    const html = '<img src="/api/assets/some-id">';
    expect(await rewriteAssetUrls(html, new Map())).toBe(html);
  });

  it('returns html unchanged when no /api/assets/ references exist', async () => {
    const html = '<img src="https://example.com/image.jpg">';
    expect(await rewriteAssetUrls(html, new Map([['id', '/tmp/file.jpg']]))).toBe(html);
  });

  it('replaces /api/assets/UUID src with base64 data URI', async () => {
    const filePath = path.join(os.tmpdir(), 'test-pdf-asset.png');
    const fakeContent = Buffer.from('PNG-FAKE-DATA');
    await writeFile(filePath, fakeContent);
    try {
      const html = '<img src="/api/assets/abc-123">';
      const result = await rewriteAssetUrls(html, new Map([['abc-123', filePath]]));
      expect(result).toBe(
        `<img src="data:image/png;base64,${fakeContent.toString('base64')}">`,
      );
    } finally {
      await unlink(filePath).catch(() => {});
    }
  });

  it('leaves src unchanged when asset file is missing from disk', async () => {
    const html = '<img src="/api/assets/missing-id">';
    const result = await rewriteAssetUrls(html, new Map([['missing-id', '/nonexistent/path/file.jpg']]));
    expect(result).toBe(html);
  });

  it('leaves src unchanged when id is not in assetMap', async () => {
    const html = '<img src="/api/assets/unknown-id">';
    const result = await rewriteAssetUrls(html, new Map([['other-id', '/some/path.jpg']]));
    expect(result).toBe(html);
  });

  it('inlines multiple images in a single HTML string', async () => {
    const file1 = path.join(os.tmpdir(), 'test-pdf-img1.jpg');
    const file2 = path.join(os.tmpdir(), 'test-pdf-img2.webp');
    await writeFile(file1, Buffer.from('JPEG-DATA'));
    await writeFile(file2, Buffer.from('WEBP-DATA'));
    try {
      const html = '<img src="/api/assets/id-1"><img src="/api/assets/id-2">';
      const map = new Map([['id-1', file1], ['id-2', file2]]);
      const result = await rewriteAssetUrls(html, map);
      expect(result).toContain('data:image/jpeg;base64,');
      expect(result).toContain('data:image/webp;base64,');
      expect(result).not.toContain('/api/assets/');
    } finally {
      await Promise.all([unlink(file1).catch(() => {}), unlink(file2).catch(() => {})]);
    }
  });
});
