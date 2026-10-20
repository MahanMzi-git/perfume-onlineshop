import type { Product } from '../types/product';
export interface BagLine { productId: string; variantId: string; quantity: number }

/** In-memory preview only. A real order must revalidate all values on a server. */
export function addDemoBagItem(lines: BagLine[], product: Product, variantId: string) {
  const variant = product.variants.find(item => item.id === variantId);
  const current = lines.find(line => line.variantId === variantId)?.quantity ?? 0;
  if (!variant || variant.stock === 0 || current >= variant.stock) {
    return { lines, message: 'تعداد انتخاب‌شده از موجودی نمایشی این نسخه بیشتر است.' };
  }
  const updated = current
    ? lines.map(line => line.variantId === variantId ? { ...line, quantity: line.quantity + 1 } : line)
    : [...lines, { productId: product.id, variantId, quantity: 1 }];
  return { lines: updated, message: 'به سبد نمایشی اضافه شد؛ از آیکن سبد در هدر می‌توانید آن را ببینید. خرید واقعی فعال نیست.' };
}
