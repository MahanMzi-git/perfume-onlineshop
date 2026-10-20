import { useEffect, useState } from 'react';
import { products } from '../data/products';

const storageKey = 'aroma-favourites';
const validIds = new Set(products.map(product => product.id));

function loadFavourites(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    return Array.isArray(stored)
      ? [...new Set(stored.filter((id): id is string => typeof id === 'string' && validIds.has(id)))]
      : [];
  } catch {
    return [];
  }
}

export function useFavourites() {
  const [favourites, setFavourites] = useState(loadFavourites);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(favourites));
    } catch {
      // Browsers that block storage still support in-memory favourites.
    }
  }, [favourites]);
  return [favourites, setFavourites] as const;
}
