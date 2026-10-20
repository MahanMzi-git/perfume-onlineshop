import { useStore } from './StoreContext';
import { comparisonHref } from '../lib/routes';
export function DiscoveryNavigation({ page }: { page: string }) {
  const { comparisonIds } = useStore();
  return <nav className="discovery-navigation container" aria-label="کشف و مقایسه عطر">
    <a href="#/catalog" aria-current={page === 'catalog' ? 'page' : undefined}>کاتالوگ عطرها</a>
    <a href="#/families" aria-current={page === 'families' || page === 'family' ? 'page' : undefined}>کتابخانهٔ رایحه</a>
    <a href="#/notes" aria-current={page === 'notes' || page === 'note' ? 'page' : undefined}>واژه‌نامهٔ نت‌ها</a>
    <a href={comparisonHref(comparisonIds)} aria-current={page === 'compare' ? 'page' : undefined}>مقایسه ({new Intl.NumberFormat('fa-IR').format(comparisonIds.length)})</a>
  </nav>;
}
