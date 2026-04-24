export interface ImportSlide {
  typeName: string;
  data: Record<string, unknown>;
}

export interface ImportInput {
  title: string;
  lang: string;
  slides: ImportSlide[];
}

/**
 * Validates and normalises raw JSON from a slides.json import file.
 * Throws a descriptive Error on any schema violation.
 *
 * Two slide shapes are accepted:
 *   - Canonical:  { "typeName": "title",  "data": { "title": "Hello" } }
 *   - Inline:     { "type": "title",      "title": "Hello" }   (reference shape)
 *
 * A top-level `appendix` array is expanded into a trailing appendix-list slide,
 * mirroring generate.py's expand_appendix().
 */
export function parseImportInput(raw: unknown): ImportInput {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Import input must be a JSON object');
  }
  const obj = raw as Record<string, unknown>;

  if (typeof obj.title !== 'string' || !obj.title.trim()) {
    throw new Error('Missing required field: title (must be a non-empty string)');
  }

  if (!Object.prototype.hasOwnProperty.call(obj, 'slides') || !Array.isArray(obj.slides)) {
    throw new Error('Missing required field: slides (must be an array)');
  }

  const lang = typeof obj.lang === 'string' && obj.lang ? obj.lang : 'da';

  const slides: ImportSlide[] = obj.slides.map((s: unknown, i: number) => {
    if (!s || typeof s !== 'object' || Array.isArray(s)) {
      throw new Error(`Slide ${i}: must be an object`);
    }
    const slide = s as Record<string, unknown>;

    if (typeof slide.typeName === 'string' && slide.typeName.trim()) {
      const data =
        slide.data && typeof slide.data === 'object' && !Array.isArray(slide.data)
          ? (slide.data as Record<string, unknown>)
          : {};
      return { typeName: slide.typeName, data };
    }

    if (typeof slide.type === 'string' && slide.type.trim()) {
      const { type, ...rest } = slide as { type: string } & Record<string, unknown>;
      return { typeName: type, data: rest };
    }

    throw new Error(
      `Slide ${i}: missing slide type (expected "typeName" or "type" as a non-empty string)`,
    );
  });

  if (Array.isArray(obj.appendix) && obj.appendix.length > 0) {
    slides.push({
      typeName: 'appendix-list',
      data: {
        eyebrow: typeof obj.appendixEyebrow === 'string' ? obj.appendixEyebrow : 'Bilag',
        title: typeof obj.appendixTitle === 'string' ? obj.appendixTitle : 'Tilhørende materiale',
        items: obj.appendix,
      },
    });
  }

  return { title: obj.title.trim(), lang, slides };
}
