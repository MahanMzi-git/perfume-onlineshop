import { useStore } from './StoreContext';
import { comparisonHref } from '../lib/routes';
import { CompareIcon } from './CompareIcon';
import { X } from 'lucide-react';
import { products } from '../data/products';
import { cardStudyImages } from '../data/cardStudyImages';
export function ComparisonBar() {
 const { comparisonIds, toggleComparison } = useStore();
 if (!comparisonIds.length || (typeof location !== 'undefined' && location.hash.startsWith('#/compare'))) return null;
 const selected = comparisonIds.flatMap(id => { const product = products.find(item => item.id === id); return product ? [product] : []; });
 return <>
   <aside className="comparison-dock-study" aria-label="عطرهای انتخاب‌شده برای مقایسه">
     <div className="comparison-dock-copy"><CompareIcon selected /><span><strong>انتخاب‌های شما</strong><small aria-live="polite">{new Intl.NumberFormat('fa-IR').format(selected.length)} از ۳ عطر{selected.length < 2 ? ' · یک عطر دیگر انتخاب کن' : ' · آمادهٔ مقایسه'}</small></span></div>
     <ul className="comparison-dock-products">{selected.map(product => <li key={product.id}><img src={cardStudyImages[product.id]?.src ?? product.image} alt={product.name} width={48} height={56} /><button type="button" aria-label={'حذف از نوار مقایسه: ' + product.name} onClick={() => toggleComparison(product.id)}><X size={12} aria-hidden="true" /></button></li>)}</ul>
     {selected.length >= 2 ? <a className="comparison-dock-action" href={comparisonHref(comparisonIds)}>مقایسهٔ عطرها <span aria-hidden="true">↖</span></a> : <button className="comparison-dock-action" disabled>مقایسهٔ عطرها</button>}
   </aside>
   <aside className="compare-shortcut comparison-mobile-original" aria-label="دسترسی سریع به مقایسه"><a href={comparisonHref(comparisonIds)}><CompareIcon selected /><span>دیدن مقایسه</span><b>{new Intl.NumberFormat('fa-IR').format(comparisonIds.length)}</b></a></aside>
 </>;
}
