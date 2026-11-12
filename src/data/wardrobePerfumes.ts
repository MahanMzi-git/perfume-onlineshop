import type { WardrobePerfume } from '../components/PerfumeWardrobe';
import { products } from './products';

const wardrobeArtwork = [
  { file: 'ysl', name: 'Libre', slug: 'libre' },
  { file: 'black-opium', name: 'Black Opium' },
  { file: 'coco-chanel', name: 'Coco Mademoiselle', slug: 'coco-mademoiselle' },
  { file: 'creed-aventus', name: 'Aventus', slug: 'aventus' },
  { file: 'miss-dior', name: 'Miss Dior', slug: 'miss-dior' },
  { file: 'gucci', name: 'Gucci Bloom', slug: 'bloom' },
  { file: 'tigerlily-victor', name: 'Flowerbomb Tiger Lily' },
  { file: 'blue-de-chanel', name: 'Bleu de Chanel', slug: 'bleu-de-chanel' },
  { file: 'suavage-dior', name: 'Sauvage', slug: 'sauvage' },
  { file: 'tom-ford', name: 'Fucking Fabulous' },
];

export const wardrobePerfumes: WardrobePerfume[] = wardrobeArtwork.map(({ file, name, slug }, position) => {
  const product = products.find(item => item.slug === slug);
  return {
    position,
    name: product?.name ?? name,
    image: import.meta.env.BASE_URL + 'images/wardrobe/' + file + '.png',
    href: product ? '#/product/' + product.slug : undefined,
  };
});
