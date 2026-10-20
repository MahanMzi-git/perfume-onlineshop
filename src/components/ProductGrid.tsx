import { ProductCard } from './ProductCard';
import { useStore } from './StoreContext';
import { matchingVariant } from '../lib/catalog';
import { catalogHref } from '../lib/routes';
import type { Filters, Product } from '../types/product';
interface Props { list: Product[]; filters?: Filters; onNote?: (id: string) => void }
export function ProductGrid({ list, filters = { query: '' }, onNote }: Props) {
  const store = useStore();
  return <div className="grid">{list.map(product => <ProductCard key={product.id} product={product}
    selectedNoteIds={filters.noteIds ?? []}
    onNote={onNote ?? (id => { location.hash = catalogHref({ noteIds: [id] }); })}
    favourite={store.favourites.includes(product.id)} onFavourite={() => store.toggleFavourite(product.id)}
    displayVariant={matchingVariant(product, filters)}
  />)}</div>;
}
