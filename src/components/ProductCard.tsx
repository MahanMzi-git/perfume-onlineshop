import { DemoImage } from './DemoImage';

import { type CSSProperties } from 'react';
import { Check, Heart, Scale } from 'lucide-react';
import { useStore } from './StoreContext';
import type { Product, ProductVariant } from '../types/product';
import { brands } from '../data/brands';
import { AudienceIcon } from './AudienceIcon';
import { cardStudyImages, isCardStudy } from '../data/cardStudyImages';
import { ScentNoteList } from './ScentNoteList';
import { CardCartControl } from './CardCartControl';
export function ProductCard({ product, onNote, selectedNoteIds, displayVariant, favourite: fav, onFavourite }: { product: Product; displayVariant?: ProductVariant; onNote: (id: string) => void; selectedNoteIds: string[]; favourite: boolean; onFavourite: () => void }) {

  const store = useStore();
  const detailHref = '#/product/' + product.slug + (displayVariant ? '?variant=' + displayVariant.id : '');
  const compared = store.comparisonIds.includes(product.id);
  const brand = brands.find((b) => b.id === product.brandId);
  const photoPreview = isCardStudy;
  const studyImage = photoPreview ? cardStudyImages[product.id] : undefined;
  const variant = displayVariant ?? product.variants.find(item => item.price === product.price && item.concentration === product.concentration) ?? product.variants[0];
  const information = <>
    <p className="brand card-brand-row" dir="ltr"><span>{brand?.name}</span><AudienceIcon audience={product.targetAudience} /></p>
    <h3 dir="ltr"><a className="card-detail-link" href={detailHref}>{product.name}</a> <small>{displayVariant?.concentration ?? product.concentration}</small></h3>
    <ScentNoteList noteIds={product.scentNoteIds} onSelect={onNote} selectedNoteIds={selectedNoteIds} />
  </>;
  return (
    <article className={'card' + (photoPreview ? ' card-photo-preview' : '')} data-card-tone={photoPreview ? 'black' : undefined} data-photo-id={photoPreview ? product.id : undefined} data-photo-full={photoPreview || undefined}>
      <div className="card-img" style={studyImage ? { '--photo-scene': `url("${studyImage.src}")` } as CSSProperties : undefined}>
        <a href={detailHref} aria-label={'جزئیات عطر ' + product.name}><DemoImage src={studyImage?.src ?? product.image} alt={studyImage?.alt ?? `تصویر نمایشی بطری عطر ${product.name} (دمو)`} width={400} height={500} loading="lazy" decoding="async" /></a>
        <button type="button" className="fav" aria-pressed={fav} aria-label={`${fav ? 'حذف از' : 'افزودن به'} علاقه‌مندی‌ها: ${product.name}`} onClick={onFavourite}>
          <Heart aria-hidden="true" size={18} fill={fav ? 'currentColor' : 'none'} />
        </button>
        <button type="button" className="card-compare" aria-pressed={compared} aria-label={`${compared ? 'حذف از' : 'افزودن به'} مقایسه: ${product.name}`} title={compared ? 'حذف از مقایسه' : 'افزودن به مقایسه'} onClick={() => store.toggleComparison(product.id)}>
          <Scale aria-hidden="true" size={17} />
          {compared && <span className="compare-check" aria-hidden="true"><Check size={8} /></span>}
        </button>
      </div>
      {photoPreview ? <>
        <div className="card-photo-copy"><span className="card-photo-veil" aria-hidden="true"><i /><i /><i /></span>{information}<CardCartControl product={product} variant={variant} /></div>
      </> : information}
      <p className="price">{photoPreview ? <><span className="card-price-value">{new Intl.NumberFormat('fa-IR').format(displayVariant?.price ?? product.price)}</span><span className="card-price-currency">{product.currency}{variant && <> · <bdi>{new Intl.NumberFormat('fa-IR').format(variant.volumeMl)} میل</bdi></>}</span></> : <>{new Intl.NumberFormat('fa-IR').format(displayVariant?.price ?? product.price)} {product.currency}</>}</p>
    </article>
  );
}
