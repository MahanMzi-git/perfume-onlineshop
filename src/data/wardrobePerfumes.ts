import type { WardrobePerfume } from '../components/PerfumeWardrobe';
import type { Product } from '../types/product';
import { products } from './products';

const artwork = [
  ['ysl', 'Libre', 'libre'],
  ['black-opium', 'Black Opium'],
  ['coco-chanel', 'Coco Mademoiselle', 'coco-mademoiselle'],
  ['creed-aventus', 'Aventus', 'aventus'],
  ['miss-dior', 'Miss Dior', 'miss-dior'],
  ['gucci', 'Gucci Bloom', 'bloom'],
  ['tigerlily-victor', 'Flowerbomb Tiger Lily'],
  ['blue-de-chanel', 'Bleu de Chanel', 'bleu-de-chanel'],
  ['suavage-dior', 'Sauvage', 'sauvage'],
  ['tom-ford', 'Fucking Fabulous'],
];

// The input is the published perfume feed once the backend supplies one.
export function buildWardrobe(publishedProducts: readonly Product[], includeSamples = false): WardrobePerfume[] {
  const shelves: WardrobePerfume[] = [];
  const usedIds = new Set<string>();
  const directory = import.meta.env.BASE_URL + 'images/wardrobe/';
  publishedProducts.filter(product => product.productType === 'perfume').forEach(product => {
    if (usedIds.has(product.id)) return;
    usedIds.add(product.id);
    const position = artwork.findIndex(([, , slug]) => slug === product.slug);
    const file = position < 0 ? undefined : artwork[position][0];
    shelves.push({
      id: product.id,
      position: position < 0 ? artwork.length + shelves.filter(slot => slot.position >= artwork.length).length : position,
      name: product.name,
      product,
      image: product.cabinetImage ?? product.transparentImage ?? (file ? directory + 'cutouts/' + file + '.png' : product.image),
      fallback: file ? directory + file + '.png' : product.image,
    });
  });
  if (includeSamples) artwork.forEach(([file, name, slug], position) => {
    if (slug) return;
    shelves.push({
      id: 'sample:' + file, position, name,
      image: directory + 'cutouts/' + file + '.png',
      fallback: directory + file + '.png',
    });
  });
  return shelves.sort((a, b) => a.position - b.position);
}

export const wardrobePerfumes = buildWardrobe(products, true);
