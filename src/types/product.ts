export type Audience = 'women'|'men'|'unisex';
export type Concentration = 'EDT'|'EDP'|'Parfum'|'Extrait';
export interface Product {
  id: string; slug: string; name: string; brandId: string; image: string; price: number; currency: 'تومان';
  targetAudience: Audience; fragranceFamilyIds: string[]; scentNoteIds: string[]; concentration: Concentration;
  isNiche: boolean; isFeatured: boolean; isBestseller: boolean; isGiftSet?: boolean;
  availability: 'demo'; authenticityStatus?: 'verified';
}
export interface Filters {
  query: string; brandId?: string; familyId?: string; noteId?: string; audience?: Audience; concentration?: Concentration;
  minPrice?: number; maxPrice?: number; niche?: boolean; featured?: boolean; bestseller?: boolean; giftSet?: boolean;
}
export interface ProductCategory { id: string; label: string; image: string; patch: Partial<Filters>; scrollTo?: string }
