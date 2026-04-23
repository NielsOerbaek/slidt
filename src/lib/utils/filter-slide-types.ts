export function filterSlideTypes<T extends { name: string; label: string }>(
  types: T[],
  query: string,
): T[] {
  if (!query.trim()) return types;
  const q = query.toLowerCase();
  return types.filter(
    (t) => t.label.toLowerCase().includes(q) || t.name.toLowerCase().includes(q),
  );
}
