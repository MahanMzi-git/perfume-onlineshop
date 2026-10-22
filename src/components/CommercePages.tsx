import { CatalogPage } from '../pages/CatalogPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { LibraryNotFound, LibraryPage } from '../pages/LibraryPage';
import { ComparisonPage } from '../pages/ComparisonPage';
import { productBySlug } from '../data/products';
import type { Route } from '../lib/routes';
import { CartPage, CheckoutPage } from '../pages/ShoppingPages';
import { CustomerPage } from '../pages/CustomerPages';

export function CommercePages({ route, comparisonIds }: { route: Route; comparisonIds: string[] }) {
  switch (route.page) {
    case 'cart': return <CartPage />;
    case 'checkout': return <CheckoutPage />;
    case 'account': return <CustomerPage key={route.slug + (route.params.get('orderId') ?? '')} section={route.slug} orderId={route.params.get('orderId') ?? undefined} />;
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
