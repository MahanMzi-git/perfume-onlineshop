export function loadProductIds(key: string, validIds: Set<string>): string[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(raw) ? [...new Set(raw.filter((id): id is string => typeof id === 'string' && validIds.has(id)))] : [];
  } catch { return []; }
}
export function saveProductIds(key: string, ids: string[]) {
  try { localStorage.setItem(key, JSON.stringify(ids)); } catch { /* Safe in-memory fallback. */ }
}
