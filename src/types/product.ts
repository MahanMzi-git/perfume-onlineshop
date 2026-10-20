export type Audience = 'women' | 'men' | 'unisex';
export type Concentration = 'EDT' | 'EDP' | 'Parfum' | 'Extrait';
export type Temperature = 'cool' | 'balanced' | 'warm';
export type Sweetness = 'dry' | 'balanced' | 'sweet';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Occasion = 'daily' | 'work' | 'evening' | 'formal' | 'date';
export type ProductType = 'perfume' | 'gift-set';
export type SortOrder = 'recommended' | 'price-asc' | 'price-desc' | 'popular' | 'newest' | 'rating';
export interface ProductVariant {
  id: string;
  volumeMl: number;
  concentration: Concentration;
  price: number;
  stock: number;
  compareAtPrice?: number;
}
export interface DemoReview { id: string; score: number; text: string }
export interface Product {
  id: string; slug: string; name: string; brandId: string; image: string; price: number; currency: 'تومان';
  targetAudience: Audience; fragranceFamilyIds: string[]; scentNoteIds: string[]; concentration: Concentration;
  isNiche: boolean; isFeatured: boolean; isBestseller: boolean; isGiftSet?: boolean;
  availability: 'demo'; authenticityStatus?: 'verified';
  variants: ProductVariant[];
  gallery: { src: string; alt: string; view: 'bottle' | 'detail' }[];
  notePyramid: { top: string[]; middle: string[]; base: string[] };
  description: string;
  temperature: Temperature; sweetness: Sweetness; seasons: Season[]; occasions: Occasion[];
  productType: ProductType;
  addedAt: string;
  reviews: DemoReview[];
}
export interface Filters {
  query: string; brandId?: string; familyId?: string; noteIds?: string[]; audience?: Audience; concentration?: Concentration;
  minPrice?: number; maxPrice?: number; niche?: boolean; featured?: boolean; bestseller?: boolean; giftSet?: boolean;
  volumeMl?: number; temperature?: Temperature; sweetness?: Sweetness; season?: Season; occasion?: Occasion;
  stock?: 'in-stock' | 'out-of-stock'; productType?: ProductType;
}
export interface ProductCategory { id: string; label: string; image: string; patch: Partial<Filters>; scrollTo?: string }
