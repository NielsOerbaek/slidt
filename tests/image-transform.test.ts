import { describe, it, expect } from 'vitest';
import {
  parseImage,
  toFitImage,
  serializeFit,
  fitDefaults,
  applyDrag,
  imgWrapAttrs,
  clamp,
  isFit,
  MAX_ZOOM,
} from '../src/renderer/image-transform.ts';

describe('parseImage', () => {
  it('returns null for empty values', () => {
    expect(parseImage('')).toBeNull();
    expect(parseImage(null)).toBeNull();
    expect(parseImage(undefined)).toBeNull();
    expect(parseImage({})).toBeNull();
    expect(parseImage([])).toBeNull();
  });

  it('parses a bare string id as fit defaults', () => {
    expect(parseImage('abc')).toEqual({
      mode: 'fit', id: 'abc', fit: 'cover', zoom: 1, posX: 50, posY: 50, rotate: 0,
    });
  });

  it('parses a fit object and clamps out-of-range values', () => {
    expect(parseImage({ id: 'x', fit: 'contain', zoom: 99, posX: -10, posY: 200, rotate: 90 })).toEqual({
      mode: 'fit', id: 'x', fit: 'contain', zoom: MAX_ZOOM, posX: 0, posY: 100, rotate: 90,
    });
  });

  it('treats an unknown fit string as the default', () => {
    const p = parseImage({ id: 'x', fit: 'wonky' });
    expect(p).toMatchObject({ mode: 'fit', fit: 'cover' });
  });

  it('parses legacy crop objects as crop mode', () => {
    expect(parseImage({ id: 'y', cropX: 20, cropY: 10, cropW: 60, cropH: 80, rotate: 90 })).toEqual({
      mode: 'crop', id: 'y', cropX: 20, cropY: 10, cropW: 60, cropH: 80, rotate: 90,
    });
  });

  it('treats a fit field on a crop-shaped object as fit (forward wins)', () => {
    const p = parseImage({ id: 'z', fit: 'fill', cropW: 50, cropH: 50 });
    expect(p?.mode).toBe('fit');
  });
});

describe('toFitImage', () => {
  it('upgrades legacy crop to fit defaults, preserving rotation', () => {
    expect(toFitImage({ id: 'y', cropX: 20, cropW: 60, cropH: 80, rotate: 90 })).toEqual({
      mode: 'fit', id: 'y', fit: 'cover', zoom: 1, posX: 50, posY: 50, rotate: 90,
    });
  });
  it('returns null for empty', () => {
    expect(toFitImage('')).toBeNull();
  });
});

describe('serializeFit', () => {
  it('rounds and clamps', () => {
    expect(serializeFit({ ...fitDefaults('x'), zoom: 1.2345, posX: 33.333, rotate: 90.7 })).toEqual({
      id: 'x', fit: 'cover', zoom: 1.2, posX: 33.3, posY: 50, rotate: 91,
    });
  });
});

describe('applyDrag', () => {
  it('moves object-position opposite to the drag direction', () => {
    // drag right by half the frame width → posX drops 50
    expect(applyDrag(50, 50, 100, 0, 200, 200)).toEqual({ posX: 0, posY: 50 });
    // drag up by a quarter frame height → posY rises 25
    expect(applyDrag(50, 50, 0, -50, 200, 200)).toEqual({ posX: 50, posY: 75 });
  });
  it('clamps to 0–100', () => {
    expect(applyDrag(10, 90, 1000, -1000, 200, 200)).toEqual({ posX: 0, posY: 100 });
  });
});

describe('imgWrapAttrs', () => {
  it('emits fit vars and class', () => {
    const { className, style } = imgWrapAttrs(
      { mode: 'fit', id: 'x', fit: 'cover', zoom: 1.5, posX: 25, posY: 75, rotate: 0 },
      'hero',
    );
    expect(className).toBe('img-wrap img-fit hero');
    expect(style).toContain('--fit: cover');
    expect(style).toContain('--zoom: 1.5');
    expect(style).toContain('--pos-x: 25%');
  });
  it('emits crop vars and class for legacy', () => {
    const { className, style } = imgWrapAttrs(
      { mode: 'crop', id: 'y', cropX: 5, cropY: 5, cropW: 50, cropH: 50, rotate: 0 },
      '',
    );
    expect(className).toBe('img-wrap img-crop');
    expect(style).toContain('--crop-w: 50');
  });
});

describe('helpers', () => {
  it('isFit / clamp', () => {
    expect(isFit('cover')).toBe(true);
    expect(isFit('nope')).toBe(false);
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
  });
});
