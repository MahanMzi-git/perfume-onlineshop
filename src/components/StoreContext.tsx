import { createContext, useContext } from 'react';
import type { Product, ProductVariant } from '../types/product';
import type { BagLine } from '../lib/demoBag';
export interface StoreActions {
  favourites: string[];
  toggleFavourite: (id: string) => void;
  comparisonIds: string[];
  toggleComparison: (id: string) => void;
  addToBag: (product: Product, variant: ProductVariant) => string;
  bagLines: BagLine[];
  changeBag: (product: Product, fromId: string, toId: string, quantity: number) => string;
  removeBag: (variantId: string) => void;
  discountCode: string;
  setDiscountCode: (code: string) => void;
}
export const StoreContext = createContext<StoreActions | null>(null);
export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('StoreContext is required');
  return value;
}
