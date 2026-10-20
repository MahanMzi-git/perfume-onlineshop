import type { Filters, Product } from '../types/product';
import { brands } from '../data/brands';
import { noteById } from '../data/scentNotes';
import { matchingVariant } from './catalog';
export const emptyFilters: Filters = { query: '' };
export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, '')
    .replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/[\u200c\u200d]/g, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}
export function filterProducts(list: Product[], f: Filters): Product[] {
  const q = normalizeSearch(f.query);
  return list.filter((p) => {
    if (q) {
      const brand = brands.find((b) => b.id === p.brandId)?.name ?? '';
      const notes = p.scentNoteIds.map((id) => noteById(id)?.name ?? '').join(' ');
      if (!normalizeSearch(`${p.name} ${brand} ${notes}`).includes(q)) return false;
    }
    return (!f.brandId || p.brandId === f.brandId) && (!f.familyId || p.fragranceFamilyIds.includes(f.familyId)) &&
      (!f.noteIds?.length || f.noteIds.every(noteId => p.scentNoteIds.includes(noteId))) && (!f.audience || p.targetAudience === f.audience) &&
      !!matchingVariant(p, f) && (f.niche === undefined || p.isNiche === f.niche) &&
      (!f.temperature || p.temperature === f.temperature) && (!f.sweetness || p.sweetness === f.sweetness) &&
      (!f.season || p.seasons.includes(f.season)) && (!f.occasion || p.occasions.includes(f.occasion)) &&
      (!f.productType || p.productType === f.productType) &&
      (!f.featured || p.isFeatured) && (!f.bestseller || p.isBestseller) && (!f.giftSet || !!p.isGiftSet);
  });
}
