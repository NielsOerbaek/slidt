import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { stitchPdfs } from '../src/lib/server/pdf-utils.ts';

async function makePdf(pageCount: number): Promise<Buffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([1920, 1080]);
  return Buffer.from(await doc.save());
}

async function countPages(buf: Buffer): Promise<number> {
  return (await PDFDocument.load(buf)).getPageCount();
}

describe('stitchPdfs', () => {
  it('returns main unchanged when no extras', async () => {
    const main = await makePdf(3);
    const result = await stitchPdfs(main, []);
    expect(result).toEqual(main);
  });

  it('appends one extra PDF', async () => {
    const result = await stitchPdfs(await makePdf(2), [await makePdf(1)]);
    expect(await countPages(result)).toBe(3);
  });

  it('appends multiple extras in order', async () => {
    const result = await stitchPdfs(await makePdf(1), [await makePdf(2), await makePdf(3)]);
    expect(await countPages(result)).toBe(6);
  });

  it('produces a valid PDF', async () => {
    const result = await stitchPdfs(await makePdf(1), [await makePdf(1)]);
    expect(result.subarray(0, 4).toString('ascii')).toBe('%PDF');
  });
});
