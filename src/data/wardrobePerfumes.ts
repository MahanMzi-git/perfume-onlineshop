import type { Product } from '../types/product';
import { products } from './products';

export interface BottleCrop {
  canvas: readonly [width: number, height: number];
  bounds: readonly [left: number, top: number, right: number, bottom: number];
}

export interface WardrobePerfume {
  id: string;
  name: string;
  image: string;
  fallback?: string;
  crop?: BottleCrop;
  volumeMl?: number;
  product: Product;
}

const imageRoot = import.meta.env.BASE_URL + 'images/';
const catalogArtwork: Record<string, { file: string; crop?: BottleCrop }> = {
  libre: { file: 'wardrobe/cutouts/ysl.png', crop: { canvas: [1254, 1254], bounds: [381, 59, 862, 1188] } },
  'coco-mademoiselle': { file: 'wardrobe/cutouts/coco-chanel.png', crop: { canvas: [1199, 1312], bounds: [230, 68, 952, 1264] } },
  aventus: { file: 'orbit-photos/creed.webp', crop: { canvas: [269, 480], bounds: [0, 0, 269, 480] } },
  'miss-dior': { file: 'wardrobe/cutouts/miss-dior.png', crop: { canvas: [1315, 1197], bounds: [236, 135, 1079, 1058] } },
  bloom: { file: 'wardrobe/cutouts/gucci.png', crop: { canvas: [1204, 1306], bounds: [274, 127, 930, 1269] } },
  'bleu-de-chanel': { file: 'wardrobe/cutouts/blue-de-chanel.png', crop: { canvas: [1086, 1448], bounds: [66, 4, 1028, 1335] } },
  sauvage: { file: 'wardrobe/cutouts/suavage-dior.png', crop: { canvas: [1087, 1446], bounds: [297, 176, 791, 1267] } },
};

// Pass the current published catalog snapshot here when the public feed is available.
export function buildWardrobe(publishedProducts: readonly Product[]): WardrobePerfume[] {
  const seen = new Set<string>();
  const perfumes: WardrobePerfume[] = [];
  for (const product of publishedProducts) {
    if (product.productType !== 'perfume' || seen.has(product.id)) continue;
    seen.add(product.id);
    const dedicatedImage = product.cabinetImage || product.transparentImage;
    const artwork = catalogArtwork[product.slug];
    perfumes.push({
      id: product.id,
      name: product.name,
      image: dedicatedImage || (artwork ? imageRoot + artwork.file : product.image),
      fallback: product.image,
      crop: dedicatedImage ? undefined : artwork?.crop,
      volumeMl: product.cabinetVolumeMl,
      product,
    });
  }
  return perfumes;
}

// This local display choice only applies to the current preview catalog.
const omittedFromPreview = new Set(['jasmin-des-anges', 'chloe']);
export const wardrobePerfumes = buildWardrobe(products.filter(product => !omittedFromPreview.has(product.slug)));
