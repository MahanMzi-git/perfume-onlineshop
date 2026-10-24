interface CategoryScene { image: string; bottle: string; aspect: number; surfaceX: number; surfaceY: number; zoom: number }
// Landmarks refer to the centre of each usable podium surface in the original photo.
export const categoryScenes: Record<string, CategoryScene> = {
  women: { image:'women-coastal-stone.jpg', bottle:'bomba.webp', aspect:736/1308, surfaceX:.50, surfaceY:.56, zoom:1.04 },
  men: { image:'men-woodland.jpg', bottle:'creed.webp', aspect:736/896, surfaceX:.50, surfaceY:.655, zoom:1.85 },
  unisex: { image:'unisex-gold-stone.jpg', bottle:'kilian.webp', aspect:736/1442, surfaceX:.50, surfaceY:.646, zoom:1.12 },
  niche: { image:'niche-floral-wood.jpg', bottle:'dune.webp', aspect:1, surfaceX:.47, surfaceY:.81, zoom:1.45 },
  scent: { image:'samples-sage-podium.jpg', bottle:'libre.webp', aspect:736/1103, surfaceX:.55, surfaceY:.675, zoom:1.58 },
  gifts: { image:'gifts-red-table.jpg', bottle:'baccarat.webp', aspect:736/981, surfaceX:.51, surfaceY:.67, zoom:1.15 },
};
export const categorySurfaceRatio = .80;

