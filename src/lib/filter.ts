import type { Filters, Product } from '../types/product';
import { brands } from '../data/brands';
import { noteById } from '../data/scentNotes';
export const emptyFilters: Filters = { query: '' };
export function filterProducts(list: Product[], f: Filters): Product[] {
  const q = f.query.trim().toLowerCase();
  return list.filter((p) => {
    if (q) {
      const brand = brands.find((b) => b.id === p.brandId)?.name ?? '';
      const notes = p.scentNoteIds.map((id) => noteById(id)?.name ?? '').join(' ');
      if (!`${p.name} ${brand} ${notes}`.toLowerCase().includes(q)) return false;
    }
    return (!f.brandId || p.brandId === f.brandId) && (!f.familyId || p.fragranceFamilyIds.includes(f.familyId)) &&
      (!f.noteId || p.scentNoteIds.includes(f.noteId)) && (!f.audience || p.targetAudience === f.audience) &&
      (!f.concentration || p.concentration === f.concentration) && (f.minPrice === undefined || p.price >= f.minPrice) &&
      (f.maxPrice === undefined || p.price <= f.maxPrice) && (f.niche === undefined || p.isNiche === f.niche) &&
      (!f.featured || p.isFeatured) && (!f.bestseller || p.isBestseller) && (!f.giftSet || !!p.isGiftSet);
  });
}
