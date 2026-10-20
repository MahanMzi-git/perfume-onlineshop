import { products } from '../data/products';
import { priceText, numberText } from '../lib/catalog';
import type { BagLine } from '../lib/demoBag';
export function DemoBag({ lines, onRemove }: { lines: BagLine[]; onRemove: (variantId: string) => void }) {
  return <div className="demo-bag"><p>این سبد فقط در حافظهٔ همین صفحه است؛ سفارش یا پرداخت واقعی انجام نمی‌شود.</p>
    {lines.length ? <ul>{lines.map(line => {
      const product = products.find(p => p.id === line.productId)!;
      const variant = product.variants.find(v => v.id === line.variantId)!;
      return <li key={line.variantId}><bdi>{product.name}</bdi><p>{numberText(variant.volumeMl)} میلی‌لیتر · {variant.concentration} · تعداد {new Intl.NumberFormat('fa-IR').format(line.quantity)}</p><strong>{priceText(variant.price * line.quantity)}</strong><button className="text-link" aria-label={'حذف از سبد نمایشی: ' + product.name} onClick={() => onRemove(line.variantId)}>حذف</button></li>;
    })}</ul> : <p className="empty">سبد نمایشی خالی است.</p>}
  </div>;
}
