import { products } from '../data/products';
import { useStore } from './StoreContext';
import { comparisonHref } from '../lib/routes';
export function ComparisonBar() {
  const { comparisonIds, toggleComparison } = useStore();
  if (!comparisonIds.length) return null;
  return <aside className="comparison-bar container" aria-label="عطرهای انتخاب‌شده برای مقایسه">
    <div><strong>مقایسهٔ انتخاب‌ها</strong><p>دو یا سه عطر انتخاب کنید.</p></div>
    <ul>{comparisonIds.map(id => <li key={id}><button className="chip removable-chip" onClick={() => toggleComparison(id)} aria-label={'حذف از مقایسه: ' + products.find(p => p.id === id)?.name}><bdi>{products.find(p => p.id === id)?.name}</bdi><span aria-hidden="true">×</span></button></li>)}</ul>
    <a className="cta" href={comparisonHref(comparisonIds)}>مشاهدهٔ مقایسه</a>
  </aside>;
}
