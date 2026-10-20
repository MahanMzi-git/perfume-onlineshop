import { DemoImage } from './DemoImage';

import { Heart } from 'lucide-react';
import { useStore } from './StoreContext';
import type { Product, ProductVariant } from '../types/product';
import { brands } from '../data/brands';
import { ScentNoteList } from './ScentNoteList';
export function ProductCard({ product, onNote, selectedNoteIds, displayVariant, favourite: fav, onFavourite }: { product: Product; displayVariant?: ProductVariant; onNote: (id: string) => void; selectedNoteIds: string[]; favourite: boolean; onFavourite: () => void }) {

  const store = useStore();
  const detailHref = '#/product/' + product.slug + (displayVariant ? '?variant=' + displayVariant.id : '');
  const compared = store.comparisonIds.includes(product.id);
  const brand = brands.find((b) => b.id === product.brandId);
  return (
    <article className="card">
      <div className="card-img">
        <a href={detailHref} aria-label={'جزئیات عطر ' + product.name}><DemoImage src={product.image} alt={`تصویر نمایشی بطری عطر ${product.name} (دمو)`} width={400} height={500} loading="lazy" /></a>
        <button type="button" className="fav" aria-pressed={fav} aria-label={`${fav ? 'حذف از' : 'افزودن به'} علاقه‌مندی‌ها: ${product.name}`} onClick={onFavourite}>
          <Heart aria-hidden="true" size={18} fill={fav ? 'currentColor' : 'none'} />
        </button>
      </div>
      <p className="brand" dir="ltr">{brand?.name}</p>
      <h3 dir="ltr"><a className="card-detail-link" href={detailHref}>{product.name}</a> <small>{displayVariant?.concentration ?? product.concentration}</small></h3>
      <ScentNoteList noteIds={product.scentNoteIds} onSelect={onNote} selectedNoteIds={selectedNoteIds} />
      <p className="price">{new Intl.NumberFormat('fa-IR').format(displayVariant?.price ?? product.price)} {product.currency} <small>(قیمت نمایشی)</small></p>
      <button type="button" className="card-compare" aria-pressed={compared} aria-label={'مقایسه: ' + product.name} onClick={() => store.toggleComparison(product.id)}>{compared ? '✓ در مقایسه' : '+ مقایسه'}</button>
    </article>
  );
}
