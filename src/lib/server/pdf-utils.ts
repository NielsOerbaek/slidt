import { PDFDocument } from 'pdf-lib';

/**
 * Appends each buffer in `extras` onto the end of `main`.
 * Returns `main` unchanged when `extras` is empty.
 */
export async function stitchPdfs(main: Buffer, extras: Buffer[]): Promise<Buffer> {
  if (extras.length === 0) return main;
  const merged = await PDFDocument.load(main);
  for (const extra of extras) {
    const doc = await PDFDocument.load(extra);
    const copied = await merged.copyPages(doc, doc.getPageIndices());
    for (const page of copied) merged.addPage(page);
  }
  return Buffer.from(await merged.save());
}
