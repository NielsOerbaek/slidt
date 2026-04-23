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
 * Expected JSON shape:
 * {
 *   "title": "My Deck",
 *   "lang": "da",           // optional, defaults to "da"
 *   "slides": [
 *     { "typeName": "title",   "data": { "title": "Hello" } },
 *     { "typeName": "content", "data": { "bullets": ["one"] } }
 *   ]
 * }
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

    if (typeof slide.typeName !== 'string' || !slide.typeName.trim()) {
      throw new Error(
        `Slide ${i}: missing required field typeName (must be a non-empty string)`,
      );
    }

    const data =
      slide.data && typeof slide.data === 'object' && !Array.isArray(slide.data)
        ? (slide.data as Record<string, unknown>)
        : {};

    return { typeName: slide.typeName, data };
  });

  return { title: obj.title.trim(), lang, slides };
}
