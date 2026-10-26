import type { Filters } from '../types/product';
export interface Collection { slug: string; title: string; intro: string; filters: Partial<Filters> }
export const collections: Collection[] = [
  { slug: 'women', title: 'عطرهای زنانه', intro: 'رایحه‌ای برای هر حال‌وهوای شما؛ از لطافت گل‌ها تا گرمای نت‌های عمیق.', filters: { audience: 'women' } },
  { slug: 'men', title: 'عطرهای مردانه', intro: 'از تازگی روزمره تا رایحه‌های گرم و چوبی؛ انتخاب بعدی‌ات را کشف کن.', filters: { audience: 'men' } },
  { slug: 'unisex', title: 'عطرهای یونیسکس', intro: 'انتخابی بر اساس سلیقه؛ رایحه‌هایی برای همه.', filters: { audience: 'unisex' } },
  { slug: 'niche', title: 'عطرهای نیش', intro: 'ترکیب‌های متفاوت برای کسانی که دنبال امضای شخصی خود می‌گردند.', filters: { niche: true } },
  { slug: 'gifts', title: 'هدیه و ست‌ها', intro: 'یک انتخاب خوش‌بو برای لحظه‌های به‌یادماندنی.', filters: { giftSet: true } },
];
export const collectionHref = (slug: string) => '#/collections/' + slug;
