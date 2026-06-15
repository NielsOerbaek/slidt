/**
 * Pure helpers for the image field's fit / zoom / position model.
 *
 * New images store `{ id, fit, zoom, posX, posY, rotate }` and render with
 * native CSS `object-fit` / `object-position` / `transform: scale()`.
 *
 * Legacy images store a crop window `{ id, cropX, cropY, cropW, cropH, rotate }`
 * and keep rendering through the original crop CSS path, untouched.
 *
 * Shared by the renderer (`img` Handlebars helper) and the editor component so
 * the live preview matches the exported slide exactly.
 */

export type ImageFit = 'cover' | 'contain' | 'fill';

export interface FitImage {
  mode: 'fit';
  id: string;
  fit: ImageFit;
  /** Multiplier, 1 = no extra zoom. */
  zoom: number;
  /** object-position X, 0–100 (%). */
  posX: number;
  /** object-position Y, 0–100 (%). */
  posY: number;
  /** Degrees. */
  rotate: number;
}

export interface CropImage {
  mode: 'crop';
  id: string;
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
  rotate: number;
}

export type ParsedImage = FitImage | CropImage;

export const FITS: readonly ImageFit[] = ['cover', 'contain', 'fill'] as const;
export const DEFAULT_FIT: ImageFit = 'cover';
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;

export function isFit(x: unknown): x is ImageFit {
  return x === 'cover' || x === 'contain' || x === 'fill';
}

export function clamp(n: number, lo: number, hi: number): number {
  return n < lo ? lo : n > hi ? hi : n;
}

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && isFinite(v) ? v : fallback;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Default fit descriptor for a freshly uploaded image. */
export function fitDefaults(id: string): FitImage {
  return { mode: 'fit', id, fit: DEFAULT_FIT, zoom: 1, posX: 50, posY: 50, rotate: 0 };
}

/**
 * Parse a stored image field value into a normalized descriptor.
 * Returns null for empty/invalid values.
 *
 * Detection: an object carrying any crop field (and no fit field) is treated as
 * legacy crop data; everything else (strings, fit objects, bare `{id}`) becomes
 * a fit descriptor with sensible defaults.
 */
export function parseImage(value: unknown): ParsedImage | null {
  if (typeof value === 'string') {
    return value ? fitDefaults(value) : null;
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const v = value as Record<string, unknown>;
    const id = typeof v.id === 'string' ? v.id : '';
    if (!id) return null;

    const hasFit = isFit(v.fit) || 'zoom' in v || 'posX' in v || 'posY' in v;
    const hasCrop = 'cropW' in v || 'cropH' in v || 'cropX' in v || 'cropY' in v;

    if (hasCrop && !hasFit) {
      const cropW = num(v.cropW, 100);
      const cropH = num(v.cropH, 100);
      return {
        mode: 'crop',
        id,
        cropX: num(v.cropX, 0),
        cropY: num(v.cropY, 0),
        cropW: cropW > 0 ? cropW : 100,
        cropH: cropH > 0 ? cropH : 100,
        rotate: num(v.rotate, 0),
      };
    }

    return {
      mode: 'fit',
      id,
      fit: isFit(v.fit) ? v.fit : DEFAULT_FIT,
      zoom: clamp(num(v.zoom, 1), MIN_ZOOM, MAX_ZOOM),
      posX: clamp(num(v.posX, 50), 0, 100),
      posY: clamp(num(v.posY, 50), 0, 100),
      rotate: num(v.rotate, 0),
    };
  }
  return null;
}

/**
 * Always produce a FitImage for the editor. Legacy crop data is upgraded to the
 * fit model with defaults, preserving only the rotation.
 */
export function toFitImage(value: unknown): FitImage | null {
  const parsed = parseImage(value);
  if (!parsed) return null;
  if (parsed.mode === 'fit') return parsed;
  return { mode: 'fit', id: parsed.id, fit: DEFAULT_FIT, zoom: 1, posX: 50, posY: 50, rotate: parsed.rotate };
}

/** Serialize a FitImage to the object stored in the slide's data. */
export function serializeFit(img: FitImage): Record<string, unknown> {
  return {
    id: img.id,
    fit: img.fit,
    zoom: round1(clamp(img.zoom, MIN_ZOOM, MAX_ZOOM)),
    posX: round1(clamp(img.posX, 0, 100)),
    posY: round1(clamp(img.posY, 0, 100)),
    rotate: Math.round(img.rotate),
  };
}

/**
 * Drag-to-pan: given a pointer delta in pixels and the frame size, return the
 * new object-position. Dragging the image right (dx > 0) reveals more of its
 * left edge, so posX decreases.
 */
export function applyDrag(
  posX: number,
  posY: number,
  dx: number,
  dy: number,
  frameW: number,
  frameH: number,
): { posX: number; posY: number } {
  return {
    posX: clamp(posX - (dx / Math.max(frameW, 1)) * 100, 0, 100),
    posY: clamp(posY - (dy / Math.max(frameH, 1)) * 100, 0, 100),
  };
}

/** Build the wrapper class list and inline CSS custom properties for the `img` helper. */
export function imgWrapAttrs(
  parsed: ParsedImage,
  wrapperClass: string,
): { className: string; style: string } {
  const className = ['img-wrap', parsed.mode === 'fit' ? 'img-fit' : 'img-crop', wrapperClass]
    .filter(Boolean)
    .join(' ');

  if (parsed.mode === 'fit') {
    const style = [
      `--fit: ${parsed.fit}`,
      `--pos-x: ${parsed.posX}%`,
      `--pos-y: ${parsed.posY}%`,
      `--zoom: ${parsed.zoom}`,
      `--rotate: ${parsed.rotate}deg`,
    ].join('; ');
    return { className, style };
  }

  const style = [
    `--crop-x: ${parsed.cropX}`,
    `--crop-y: ${parsed.cropY}`,
    `--crop-w: ${parsed.cropW}`,
    `--crop-h: ${parsed.cropH}`,
    `--rotate: ${parsed.rotate}deg`,
  ].join('; ');
  return { className, style };
}
