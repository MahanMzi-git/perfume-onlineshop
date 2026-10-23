import type { Brand } from '../types/fragrance';
import { cardStudyBrands, isCardStudy } from './cardStudyImages';
// Fictional demo brands.
export const brands: Brand[] = isCardStudy ? cardStudyBrands : [
  { id: 'b-aurelle', name: 'Maison Aurelle' }, { id: 'b-nocturne', name: 'Nocturne Atelier' },
  { id: 'b-velora', name: 'Velora' }, { id: 'b-sel', name: 'Sel & Ambre' },
];
