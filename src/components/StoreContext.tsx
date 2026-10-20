import { createContext, useContext } from 'react';
import type { Product, ProductVariant } from '../types/product';
export interface StoreActions {
  favourites: string[];
  toggleFavourite: (id: string) => void;
  comparisonIds: string[];
  toggleComparison: (id: string) => void;
  addToBag: (product: Product, variant: ProductVariant) => string;
}
export const StoreContext = createContext<StoreActions | null>(null);
export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('StoreContext is required');
  return value;
}
