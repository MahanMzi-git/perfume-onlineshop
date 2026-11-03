import type { ProductCategory } from '../types/product';
export const categories: ProductCategory[] = [
  { id: 'women', label: 'عطرهای زنانه', image: `${import.meta.env.BASE_URL}images/c-women.svg`, patch: { audience: 'women' } },
  { id: 'men', label: 'عطرهای مردانه', image: `${import.meta.env.BASE_URL}images/c-men.svg`, patch: { audience: 'men' } },
  { id: 'unisex', label: 'عطرهای یونیسکس', image: `${import.meta.env.BASE_URL}images/c-unisex.svg`, patch: { audience: 'unisex' } },
  { id: 'niche', label: 'عطرهای نیش', image: `${import.meta.env.BASE_URL}images/c-niche.svg`, patch: { niche: true } },
  { id: 'scent', label: 'خرید بر اساس رایحه', image: `${import.meta.env.BASE_URL}images/c-scent.svg`, patch: {}, scrollTo: 'discovery' },
  { id: 'gifts', label: 'ست‌های هدیه', image: `${import.meta.env.BASE_URL}images/c-gifts.svg`, patch: { giftSet: true } },
];
