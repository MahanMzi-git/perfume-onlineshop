import { useId, useRef, useState } from 'react';
import { Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import type { Product, ProductVariant } from '../types/product';
import { useStore } from './StoreContext';

export function CardCartControl({ product, variant }: { product: Product; variant?: ProductVariant }) {
  const store = useStore();
  const addButton = useRef<HTMLButtonElement>(null);
  const [feedback, setFeedback] = useState('');
  const presenceId = useId();
  const productQuantity = store.bagLines.filter(line => line.productId === product.id).reduce((sum, line) => sum + line.quantity, 0);
  const inBag = productQuantity > 0;
  const quantity = store.bagLines.find(line => line.productId === product.id && line.variantId === variant?.id)?.quantity ?? 0;
  const added = quantity > 0;
  const unavailable = !variant || variant.stock === 0;
  const atLimit = !!variant && quantity >= variant.stock;
  const context = `${product.name}${variant ? `، ${new Intl.NumberFormat('fa-IR').format(variant.volumeMl)} میلی‌لیتر ${variant.concentration}` : ''}`;
  const number = new Intl.NumberFormat('fa-IR').format(quantity);

  function increment() {
    if (variant && !unavailable && !atLimit) setFeedback(store.addToBag(product, variant));
  }
  function decrement() {
    if (!variant || !added) return;
    if (quantity === 1) {
      store.removeBag(variant.id);
      setFeedback('این نسخه از سبد نمایشی حذف شد.');
      // The add button keeps its DOM identity when the minus control disappears.
      addButton.current?.focus({ preventScroll: true });
    } else {
      setFeedback(store.changeBag(product, variant.id, variant.id, quantity - 1));
    }
  }

  return <>
    <div className="card-photo-cta card-cart-control" data-added={added || undefined} data-cart-mark="overlay" data-in-bag={inBag || undefined} data-unavailable={unavailable || undefined} role="group" aria-label={`سبد خرید: ${context}`}>
      <button ref={addButton} type="button" className="card-cart-add" disabled={unavailable || atLimit}
        aria-describedby={inBag ? presenceId : undefined} aria-label={`${unavailable ? 'ناموجود' : atLimit ? 'حداکثر موجودی نمایشی' : 'افزودن به سبد'}: ${context}`} onClick={increment}>
        <span>{unavailable ? 'ناموجود' : 'افزودن به سبد'}</span>
      </button>
      <span className="card-cart-status" aria-hidden="true">
        <span className="card-cart-icon"><ShoppingBag className="card-cart-bag" size={16} />{inBag && <Check className="card-cart-presence" size={12} />}</span>
      </span>
      {added && <div className="card-cart-stepper">
        <button type="button" className="card-cart-plus" disabled={unavailable || atLimit} aria-label={`افزایش تعداد: ${context}`} onClick={increment}><Plus size={15} aria-hidden="true" /></button>
        <span className="card-cart-count" aria-hidden="true">{number}</span>
        <button type="button" className="card-cart-minus" aria-label={`کاهش تعداد: ${context}`} onClick={decrement}><Minus size={15} aria-hidden="true" /></button>
      </div>}
    </div>
    {inBag && <span className="sr" id={presenceId}>این عطر قبلاً به سبد اضافه شده است؛ تعداد کل در حجم‌های مختلف: {new Intl.NumberFormat('fa-IR').format(productQuantity)}.{!added && ' حجم نمایش‌داده‌شده روی این کارت هنوز در سبد نیست.'}</span>}
    <span className="sr" role="status" aria-atomic="true">{feedback && `${feedback} تعداد ${product.name} در این حجم در سبد: ${number}`}</span>
  </>;
}
