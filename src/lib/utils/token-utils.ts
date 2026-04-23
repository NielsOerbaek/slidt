/** Returns true if the CSS value looks like a hex color (#RGB or #RRGGBB). */
export function isColorToken(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}
