import type { Filters, Product, ProductVariant, SortOrder } from '../types/product';

export function matchingVariant(product: Product, filters: Filters): ProductVariant | undefined {
  return product.variants.find(variant =>
    (!filters.volumeMl || variant.volumeMl === filters.volumeMl) &&
    (!filters.concentration || variant.concentration === filters.concentration) &&
    (filters.minPrice === undefined || variant.price >= filters.minPrice) &&
    (filters.maxPrice === undefined || variant.price <= filters.maxPrice) &&
    (!filters.stock || (filters.stock === 'in-stock' ? variant.stock > 0 : variant.stock === 0)),
  );
}
export function demoRating(product: Product): number | undefined {
  return product.reviews.length ? product.reviews.reduce((sum, review) => sum + review.score, 0) / product.reviews.length : undefined;
}
export function sortProducts(list: Product[], sort: SortOrder, filters: Filters): Product[] {
  const price = (p: Product) => matchingVariant(p, filters)?.price ?? p.price;
  const sorted = [...list].sort((a, b) => {
    switch (sort) {
      case 'price-asc': return price(a) - price(b);
      case 'price-desc': return price(b) - price(a);
      case 'popular': return Number(b.isBestseller) - Number(a.isBestseller) || Number(b.isFeatured) - Number(a.isFeatured);
      case 'newest': return b.addedAt.localeCompare(a.addedAt);
      case 'rating': return (demoRating(b) ?? -1) - (demoRating(a) ?? -1);
      default: return Number(b.isFeatured) - Number(a.isFeatured);
    }
  });
  return sorted;
}
export function addComparison(ids: string[], id: string): { ids: string[]; limitReached: boolean } {
  if (ids.includes(id)) return { ids: ids.filter(value => value !== id), limitReached: false };
  if (ids.length >= 3) return { ids, limitReached: true };
  return { ids: [...ids, id], limitReached: false };
}
export function priceText(price: number) {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
}


export const numberText = (value: number) => new Intl.NumberFormat('fa-IR').format(value);
