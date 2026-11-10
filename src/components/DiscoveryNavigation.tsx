import { useStore } from './StoreContext';
import { comparisonHref } from '../lib/routes';
import { CompareIcon } from './CompareIcon';
export function DiscoveryNavigation({ page }: { page: string }) {
  const { comparisonIds } = useStore();
  const showComparisonShortcut = ['account', 'cart', 'checkout'].includes(page);
  return <nav className="discovery-navigation container" aria-label="کشف و مقایسه عطر">
    <a href="#/catalog" aria-current={page === 'catalog' ? 'page' : undefined}>کاتالوگ عطرها</a>
    <a href="#/families" aria-current={page === 'families' || page === 'family' ? 'page' : undefined}>کتابخانهٔ رایحه</a>
    <a href="#/notes" aria-current={page === 'notes' || page === 'note' ? 'page' : undefined}>واژه‌نامهٔ نت‌ها</a>
    <a href={comparisonHref(comparisonIds)} aria-current={page === 'compare' ? 'page' : undefined}>مقایسه ({new Intl.NumberFormat('fa-IR').format(comparisonIds.length)})</a>
    {showComparisonShortcut && <a className="discovery-comparison-shortcut" href={comparisonHref(comparisonIds)} aria-label={`مقایسهٔ عطرها، ${new Intl.NumberFormat('fa-IR').format(comparisonIds.length)} انتخاب`}><CompareIcon selected={comparisonIds.length > 0} /><span>مقایسه</span><b>{new Intl.NumberFormat('fa-IR').format(comparisonIds.length)}</b></a>}
  </nav>;
}
