import type { Audience, Concentration, Product, ProductVariant } from '../types/product';
import { createCardStudyProducts, isCardStudy } from './cardStudyImages';

// Every profile, price, stock count, date and review below is fictional demo content.
type Profile = Pick<Product, 'description' | 'temperature' | 'sweetness' | 'seasons' | 'occasions' | 'notePyramid'>;
const profiles: Record<number, Profile> = {
  1: { description: 'برداشتی خیالی از گل‌های روشن و بافت نرم مشک؛ برای آشنایی با عطرهای گلی طراحی شده است.', temperature: 'balanced', sweetness: 'balanced', seasons: ['spring', 'autumn'], occasions: ['daily', 'work'], notePyramid: { top: ['n-bergamot'], middle: ['n-rose', 'n-jasmine'], base: ['n-musk'] } },
  2: { description: 'تصویری نمایشی از عنبر گرم، فلفل و بخور با پایان وانیلی و چوب عود. تجربهٔ واقعی نیازمند تست روی پوست است.', temperature: 'warm', sweetness: 'sweet', seasons: ['autumn', 'winter'], occasions: ['evening', 'formal'], notePyramid: { top: ['n-pepper'], middle: ['n-incense', 'n-amber'], base: ['n-vanilla', 'n-oud'] } },
  3: { description: 'روایتی خیالی از چرم و سدر با زمینهٔ عنبری؛ این محصول برای نمایش رابط ست هدیه استفاده می‌شود.', temperature: 'warm', sweetness: 'dry', seasons: ['autumn', 'winter'], occasions: ['formal', 'evening'], notePyramid: { top: ['n-cedar'], middle: ['n-leather'], base: ['n-amber'] } },
  4: { description: 'پروفایل نمایشی دریایی با مرکبات و نعنا؛ با حال‌وهوای سبک‌تر و تازه‌تر.', temperature: 'cool', sweetness: 'dry', seasons: ['spring', 'summer'], occasions: ['daily', 'work'], notePyramid: { top: ['n-bergamot', 'n-mint'], middle: ['n-seasalt', 'n-lavender'], base: ['n-patchouli'] } },
  5: { description: 'ترکیبی خیالی از صندل خامه‌ای، وانیل و مشک. نمونهٔ ده‌میلی‌لیتری برای بررسی تفاوت حجم‌ها نیز تعریف شده است.', temperature: 'balanced', sweetness: 'sweet', seasons: ['autumn', 'winter'], occasions: ['daily', 'evening', 'date'], notePyramid: { top: ['n-sandalwood'], middle: ['n-vanilla'], base: ['n-musk'] } },
  6: { description: 'برداشتی نمایشی از گلابی و رز با بافت پودری زنبق و زمینهٔ پچولی.', temperature: 'balanced', sweetness: 'sweet', seasons: ['spring', 'autumn'], occasions: ['daily', 'formal'], notePyramid: { top: ['n-pear'], middle: ['n-rose', 'n-iris'], base: ['n-patchouli'] } },
  7: { description: 'پروفایلی خیالی از باغ سبز، لیمو و نعنا با وجهی آروماتیک. نت مشترک الزاماً به معنی بوی یکسان نیست.', temperature: 'cool', sweetness: 'dry', seasons: ['spring', 'summer'], occasions: ['daily', 'work'], notePyramid: { top: ['n-lemon', 'n-bergamot'], middle: ['n-mint', 'n-lavender'], base: ['n-vetiver'] } },
  8: { description: 'ترکیب نمایشی عنبر و ادویه، همراه سدر و پچولی؛ مناسب مقایسهٔ رابط رایحه‌های گرم.', temperature: 'warm', sweetness: 'balanced', seasons: ['autumn', 'winter'], occasions: ['evening', 'formal'], notePyramid: { top: ['n-pepper'], middle: ['n-amber'], base: ['n-cedar', 'n-patchouli'] } },
};
function p(i: number, name: string, brandId: string, price: number, audience: Audience, families: string[], concentration: Concentration, extra: Partial<Product> = {}): Product {
  const profile = profiles[i];
  const variants: ProductVariant[] = [
    { id: 'p' + i + '-50-' + concentration, volumeMl: 50, concentration, price, stock: i === 6 ? 0 : 4 + i },
    { id: 'p' + i + '-100-' + concentration, volumeMl: 100, concentration, price: Math.round(price * 1.65 / 10000) * 10000, stock: i % 2 === 0 ? 0 : 3 },
  ];
  if (i === 1) variants.push({ id: 'p1-50-EDT', volumeMl: 50, concentration: 'EDT', price: 3900000, stock: 2 });
  if (i === 5) variants.push({ id: 'p5-10-EDP', volumeMl: 10, concentration: 'EDP', price: 700000, stock: 5 });
  if (i === 5) variants[1].compareAtPrice = variants[1].price + 900000;
  return {
    id: 'p' + i, slug: name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name, brandId, price, image: '/images/p' + i + '.svg', currency: 'تومان',
    targetAudience: audience, fragranceFamilyIds: families, concentration,
    scentNoteIds: [...new Set([...profile.notePyramid.top, ...profile.notePyramid.middle, ...profile.notePyramid.base])],
    isNiche: false, isFeatured: false, isBestseller: true, availability: 'demo',
    ...profile, variants, productType: extra.isGiftSet ? 'gift-set' : 'perfume',
    gallery: [
      { src: '/images/p' + i + '.svg', alt: 'تصویرسازی نمایشی بطری ' + name, view: 'bottle' },
      { src: '/images/p' + i + '.svg', alt: 'برش نزدیک از همان تصویرسازی نمایشی ' + name, view: 'detail' },
    ],
    addedAt: '2026-09-' + String(i + 10).padStart(2, '0'),
    reviews: i === 7 ? [] : [
      { id: 'p' + i + '-example-1', score: i % 2 ? 4 : 5, text: 'این نظر صرفاً نمونهٔ طراحی است: برای شناخت تغییر رایحه، تجربه روی پوست اهمیت دارد. نظر خریدار واقعی نیست.' },
      { id: 'p' + i + '-example-2', score: i % 3 ? 4 : 3, text: 'نمونهٔ نمایشی دوم: نمایش نت‌ها و حجم‌ها به مقایسه کمک می‌کند. این متن تجربهٔ واقعی مصرف‌کننده نیست.' },
    ],
    ...extra,
  };
}
const demoProducts: Product[] = [
  p(1, 'Rose Voile', 'b-aurelle', 4800000, 'women', ['f-floral'], 'EDP', { isFeatured: true }),
  p(2, 'Nuit Aubergine', 'b-nocturne', 9200000, 'unisex', ['f-amber', 'f-spicy'], 'Extrait', { isNiche: true }),
  p(3, 'Cuir Doré', 'b-nocturne', 8600000, 'men', ['f-woody', 'f-leather'], 'Parfum', { isNiche: true, isGiftSet: true }),
  p(4, 'Brume Marine', 'b-sel', 3900000, 'men', ['f-aquatic', 'f-citrus', 'f-fougere'], 'EDT', { isBestseller: false }),
  p(5, 'Santal Crème', 'b-velora', 5400000, 'unisex', ['f-woody', 'f-gourmand'], 'EDP', { isFeatured: true, isGiftSet: true }),
  p(6, 'Poire Poudrée', 'b-velora', 4300000, 'women', ['f-fruity', 'f-floral', 'f-chypre'], 'EDP', { isBestseller: false }),
  p(7, 'Jardin Vert', 'b-aurelle', 3600000, 'unisex', ['f-citrus', 'f-green', 'f-aromatic'], 'EDT', { isBestseller: false }),
  p(8, 'Ambre Épicé', 'b-sel', 6800000, 'men', ['f-amber', 'f-spicy'], 'EDP', { isNiche: true }),
];
export const products: Product[] = isCardStudy ? createCardStudyProducts(demoProducts) : demoProducts;
export const productBySlug = (slug?: string) => products.find(product => product.slug === slug);
