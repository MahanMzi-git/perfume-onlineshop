import type { WardrobePerfume } from '../components/PerfumeWardrobe';
import type { Product } from '../types/product';
import { products } from './products';

interface WardrobeArtwork {
  file: string;
  name: string;
  slug?: string;
  orbitImage?: string;
}

const artwork: readonly WardrobeArtwork[] = [
  { file: 'ysl', name: 'Libre', slug: 'libre' },
  { file: 'black-opium', name: 'Black Opium' },
  { file: 'coco-chanel', name: 'Coco Mademoiselle', slug: 'coco-mademoiselle' },
  { file: 'creed-aventus', name: 'Aventus', slug: 'aventus', orbitImage: 'creed' },
  { file: 'miss-dior', name: 'Miss Dior', slug: 'miss-dior' },
  { file: 'gucci', name: 'Gucci Bloom', slug: 'bloom' },
  { file: 'tigerlily-victor', name: 'Flowerbomb Tiger Lily' },
  { file: 'blue-de-chanel', name: 'Bleu de Chanel', slug: 'bleu-de-chanel' },
  { file: 'suavage-dior', name: 'Sauvage', slug: 'sauvage' },
  { file: 'tom-ford', name: 'Fucking Fabulous' },
  { file: 'la-bomba', name: 'La Bomba', orbitImage: 'bomba' },
  { file: 'morreale', name: 'Le Monde Sur Mesure', orbitImage: 'central' },
  { file: 'dunecry', name: 'Dunecry', orbitImage: 'dune' },
  { file: 'angels-share', name: 'Angels’ Share', orbitImage: 'kilian' },
  { file: 'baccarat-rouge-540', name: 'Baccarat Rouge 540', orbitImage: 'baccarat' },
];

const imageRoot = import.meta.env.BASE_URL + 'images/';
function artworkImage({ file, orbitImage }: WardrobeArtwork) {
  return orbitImage
    ? imageRoot + 'orbit-photos/' + orbitImage + '.webp'
    : imageRoot + 'wardrobe/cutouts/' + file + '.png';
}

// The input is the published perfume feed once the backend supplies one.
export function buildWardrobe(publishedProducts: readonly Product[], includeSamples = false): WardrobePerfume[] {
  const shelves: WardrobePerfume[] = [];
  const usedIds = new Set<string>();
  let nextPosition = artwork.length;
  publishedProducts.filter(product => product.productType === 'perfume').forEach(product => {
    if (usedIds.has(product.id)) return;
    usedIds.add(product.id);
    const position = artwork.findIndex(entry => entry.slug === product.slug);
    const entry = artwork[position];
    shelves.push({
      id: product.id,
      position: position < 0 ? nextPosition++ : position,
      name: product.name,
      product,
      image: product.cabinetImage ?? product.transparentImage ?? (entry ? artworkImage(entry) : product.image),
      fallback: entry ? imageRoot + 'wardrobe/' + entry.file + '.png' : product.image,
    });
  });
  if (includeSamples) artwork.forEach((entry, position) => {
    if (entry.slug) return;
    const { file, name, orbitImage } = entry;
    shelves.push({
      id: 'sample:' + file, position, name,
      image: artworkImage(entry),
      fallback: orbitImage ? undefined : imageRoot + 'wardrobe/' + file + '.png',
    });
  });
  return shelves.sort((a, b) => a.position - b.position);
}

const omittedFromPreview = new Set(['jasmin-des-anges', 'chloe']);
export const wardrobePerfumes = buildWardrobe(
  products.filter(product => !omittedFromPreview.has(product.slug)),
  true,
);
