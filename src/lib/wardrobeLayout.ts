export const bottlesPerShelf = 4;
const shelfHeights = [29.1, 48.7, 67.8, 86.9];
export const bottlesPerPage = bottlesPerShelf * shelfHeights.length;

export function getWardrobePage<T>(perfumes: readonly T[], requestedPage: number) {
  const pageCount = Math.ceil(perfumes.length / bottlesPerPage);
  const page = Math.max(0, Math.min(requestedPage, pageCount - 1));
  const start = page * bottlesPerPage;
  return { page, pageCount, perfumes: perfumes.slice(start, start + bottlesPerPage) };
}

export function getShelfPosition(index: number, pageSize: number) {
  const shelf = Math.floor(index / bottlesPerShelf);
  const rowSize = Math.min(bottlesPerShelf, pageSize - shelf * bottlesPerShelf);
  const slot = index % bottlesPerShelf;
  const spacing = 76 / bottlesPerShelf;
  return { left: 50 + (slot - (rowSize - 1) / 2) * spacing, top: shelfHeights[shelf] };
}

const referenceVolumeMl = 100;
const minimumScale = 0.62;
const maximumScale = 1.12;

export function getBottleScale(volumeMl?: number) {
  if (!volumeMl || !Number.isFinite(volumeMl) || volumeMl < 0) return 1;
  return Math.min(maximumScale, Math.max(minimumScale, Math.cbrt(volumeMl / referenceVolumeMl)));
}
