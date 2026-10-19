import type { ProductCategory } from '../types/product';
export const categories: ProductCategory[] = [
  { id: 'women', label: 'عطرهای زنانه', image: '/images/c-women.svg', patch: { audience: 'women' } },
  { id: 'men', label: 'عطرهای مردانه', image: '/images/c-men.svg', patch: { audience: 'men' } },
  { id: 'unisex', label: 'عطرهای یونیسکس', image: '/images/c-unisex.svg', patch: { audience: 'unisex' } },
  { id: 'niche', label: 'عطرهای نیش', image: '/images/c-niche.svg', patch: { niche: true } },
  { id: 'scent', label: 'خرید بر اساس رایحه', image: '/images/c-scent.svg', patch: {}, scrollTo: 'discovery' },
  { id: 'gifts', label: 'ست‌های هدیه', image: '/images/c-gifts.svg', patch: { giftSet: true } },
];
