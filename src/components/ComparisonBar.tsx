import { useStore } from './StoreContext';
import { comparisonHref } from '../lib/routes';
import { CompareIcon } from './CompareIcon';
export function ComparisonBar() {
 const { comparisonIds } = useStore();
 if (!comparisonIds.length || (typeof location !== 'undefined' && location.hash.startsWith('#/compare'))) return null;
 return <aside className="compare-shortcut" aria-label="دسترسی سریع به مقایسه"><a href={comparisonHref(comparisonIds)}><CompareIcon selected /><span>دیدن مقایسه</span><b>{new Intl.NumberFormat('fa-IR').format(comparisonIds.length)}</b></a></aside>;
}
