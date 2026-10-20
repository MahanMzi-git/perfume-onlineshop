import { CatalogPage } from '../pages/CatalogPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { LibraryNotFound, LibraryPage } from '../pages/LibraryPage';
import { ComparisonPage } from '../pages/ComparisonPage';
import { productBySlug } from '../data/products';
import type { Route } from '../lib/routes';

export function CommercePages({ route, comparisonIds }: { route: Route; comparisonIds: string[] }) {
  switch (route.page) {
    case 'catalog': return <CatalogPage params={route.params} />;
    case 'product': {
      const product = productBySlug(route.slug);
      return product ? <ProductDetailPage key={product.id} product={product} params={route.params} /> : <LibraryNotFound />;
    }
    case 'families': case 'family': case 'notes': case 'note':
      return <LibraryPage mode={route.page} slug={route.slug} />;
    case 'compare': return <ComparisonPage ids={comparisonIds} />;
    default: return <LibraryNotFound />;
  }
}
