import { useState } from 'react';
import { Heart } from 'lucide-react';
import type { Product } from '../types/product';
import { brands } from '../data/brands';
import { ScentNoteList } from './ScentNoteList';
export function ProductCard({ product, onNote }: { product: Product; onNote: (id: string) => void }) {
  const [fav, setFav] = useState(false);
  const brand = brands.find((b) => b.id === product.brandId);
  return (
    <article className="card">
      <div className="card-img">
        <img src={product.image} alt={`تصویر نمایشی بطری عطر ${product.name} (دمو)`} width={400} height={500} loading="lazy" />
        <button type="button" className="fav" aria-pressed={fav} aria-label={`${fav ? 'حذف از' : 'افزودن به'} علاقه‌مندی‌ها: ${product.name}`} onClick={() => setFav(!fav)}>
          <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
        </button>
      </div>
      <p className="brand" dir="ltr">{brand?.name}</p>
      <h3 dir="ltr">{product.name} <small>{product.concentration}</small></h3>
      <ScentNoteList noteIds={product.scentNoteIds} onSelect={onNote} />
      <p className="price">{new Intl.NumberFormat('fa-IR').format(product.price)} {product.currency} <small>(قیمت نمایشی)</small></p>
    </article>
  );
}
