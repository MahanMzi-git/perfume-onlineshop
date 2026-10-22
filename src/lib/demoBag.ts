import type { Product } from '../types/product';
export interface BagLine { productId: string; variantId: string; quantity: number }

export function changeDemoBagItem(lines: BagLine[], product: Product, fromId: string, toId: string, quantity: number) {
  const source = lines.find(line => line.productId === product.id && line.variantId === fromId);
  const variant = product.variants.find(item => item.id === toId);
  const duplicate = fromId === toId ? 0 : lines.find(line => line.variantId === toId)?.quantity ?? 0;
  if (!source || !variant) return { lines, message: 'محصول یا حجم انتخاب‌شده در دسترس نیست.' };
  if (!Number.isInteger(quantity) || quantity < 1 || quantity + duplicate > variant.stock) return { lines, message: 'تعداد باید عدد صحیح و بین ۱ و موجودی نمایشی باشد.' };
  return { lines: [...lines.filter(line => line.variantId !== fromId && line.variantId !== toId), { productId: product.id, variantId: toId, quantity: quantity + duplicate }], message: 'سبد نمایشی به‌روز شد.' };
}

export function bagSummary(lines: BagLine[], catalog: Product[], code = '', shipping = 0) {
  let subtotal = 0;
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const product = catalog.find(p => p.id === line.productId);
    const variant = product?.variants.find(v => v.id === line.variantId);
    if (!variant || seen.has(line.variantId) || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > variant.stock) errors.push('یک قلم سبد موجود نیست یا تعداد نامعتبر دارد.');
    else subtotal += variant.price * line.quantity;
    seen.add(line.variantId);
  }
  const discount = code.trim().toUpperCase() === 'AROMA10' ? Math.min(Math.round(subtotal * .1), 500000) : 0;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping, errors };
}

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
