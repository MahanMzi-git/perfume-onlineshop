import type { Product } from '../types/product';
// DEMO DATA ONLY: names, prices and notes are illustrative, not real commercial information.
const p = (i: number, name: string, brandId: string, price: number, a: Product['targetAudience'], fam: string[], notes: string[],
  c: Product['concentration'], x: Partial<Product> = {}): Product => ({
  id: `p${i}`, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, brandId, image: `/images/p${i}.svg`, price, currency: 'تومان',
  targetAudience: a, fragranceFamilyIds: fam, scentNoteIds: notes, concentration: c, isNiche: false, isFeatured: false,
  isBestseller: true, availability: 'demo', ...x });
export const products: Product[] = [
  p(1, 'Rose Voile', 'b-aurelle', 4800000, 'women', ['f-floral'], ['n-rose', 'n-jasmine', 'n-musk'], 'EDP', { isFeatured: true }),
  p(2, 'Nuit Aubergine', 'b-nocturne', 9200000, 'unisex', ['f-amber', 'f-spicy'], ['n-amber', 'n-incense', 'n-pepper', 'n-vanilla'], 'Extrait', { isNiche: true }),
  p(3, 'Cuir Doré', 'b-nocturne', 8600000, 'men', ['f-woody'], ['n-leather', 'n-cedar', 'n-amber'], 'Parfum', { isNiche: true, isGiftSet: true }),
  p(4, 'Brume Marine', 'b-sel', 3900000, 'men', ['f-aquatic', 'f-citrus'], ['n-seasalt', 'n-bergamot', 'n-mint'], 'EDT'),
  p(5, 'Santal Crème', 'b-velora', 5400000, 'unisex', ['f-woody', 'f-gourmand'], ['n-sandalwood', 'n-vanilla', 'n-musk'], 'EDP', { isFeatured: true, isGiftSet: true }),
  p(6, 'Poire Poudrée', 'b-velora', 4300000, 'women', ['f-fruity', 'f-floral'], ['n-pear', 'n-iris', 'n-rose'], 'EDP'),
  p(7, 'Jardin Vert', 'b-aurelle', 3600000, 'unisex', ['f-citrus'], ['n-lemon', 'n-mint', 'n-bergamot'], 'EDT'),
  p(8, 'Ambre Épicé', 'b-sel', 6800000, 'men', ['f-amber', 'f-spicy'], ['n-amber', 'n-pepper', 'n-cedar'], 'EDP', { isNiche: true }),
];
