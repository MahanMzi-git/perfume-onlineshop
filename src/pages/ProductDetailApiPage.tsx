import { useEffect, useState } from 'react';
import { priceText } from '../lib/catalog';

interface ApiVariant {
  id: string;
  sku: string;
  volume_ml: number;
  concentration: string;
  price: number;
}

interface ApiProduct {
  slug: string;
  name: string;
  price_unit: 'IRT';
  variants: ApiVariant[];
}

type State =
  | { kind: 'loading' | 'missing' | 'error' }
  | { kind: 'ready'; product: ApiProduct };

function isVariant(value: unknown): value is ApiVariant {
  if (typeof value !== 'object' || value === null) return false;
  const variant = value as Partial<ApiVariant>;
  return typeof variant.id === 'string' && typeof variant.sku === 'string' &&
    typeof variant.concentration === 'string' &&
    typeof variant.volume_ml === 'number' && Number.isSafeInteger(variant.volume_ml) && variant.volume_ml > 0 &&
    typeof variant.price === 'number' && Number.isSafeInteger(variant.price) && variant.price > 0;
}

function isProduct(value: unknown, slug: string): value is ApiProduct {
  if (typeof value !== 'object' || value === null) return false;
  const product = value as Partial<ApiProduct>;
  return product.slug === slug && typeof product.name === 'string' &&
    product.price_unit === 'IRT' && Array.isArray(product.variants) && product.variants.every(isVariant);
}

export function ProductDetailApiPage({ slug }: { slug: string }) {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    const url = import.meta.env.BASE_URL + 'api/v1/products/' + encodeURIComponent(slug) + '/';

    async function loadProduct() {
      const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
      if (response.status === 404) {
        if (!controller.signal.aborted) setState({ kind: 'missing' });
        return;
      }
      if (!response.ok) throw new Error('Product request failed');
      const product: unknown = await response.json();
      if (!isProduct(product, slug)) throw new Error('Invalid product response');
      if (!controller.signal.aborted) setState({ kind: 'ready', product });
    }

    void loadProduct().catch(() => {
      if (!controller.signal.aborted) setState({ kind: 'error' });
    });
    return () => controller.abort();
  }, [slug]);

  return <ProductDetailApiContent state={state} />;
}

export function ProductDetailApiContent({ state }: { state: State }) {
  const [variantId, setVariantId] = useState('');
  if (state.kind !== 'ready') {
    return <section className="step2-page container section">
      {state.kind === 'loading' && <p role="status">در حال دریافت اطلاعات محصول…</p>}
      {state.kind === 'missing' && <h1>محصول پیدا نشد</h1>}
      {state.kind === 'error' && <p role="alert">دریافت اطلاعات محصول ممکن نبود. لطفاً صفحه را دوباره بارگذاری کنید.</p>}
      <a href="#/catalog">بازگشت به کاتالوگ</a>
    </section>;
  }

  const { product } = state;
  const variant = product.variants.find(item => item.id === variantId) ?? product.variants[0];
  const number = new Intl.NumberFormat('fa-IR');
  return <section className="step2-page container section">
    <nav className="breadcrumbs" aria-label="مسیر صفحه"><a href="#home">خانه</a><span>/</span><a href="#/catalog">کاتالوگ</a></nav>
    <span className="badge">پیش‌نمایش کاتالوگ</span>
    <h1>{product.name}</h1>
    {variant ? <>
      <label htmlFor="api-product-variant">نسخهٔ محصول</label>
      <select id="api-product-variant" value={variant.id} onChange={event => setVariantId(event.target.value)}>
        {product.variants.map(item => <option key={item.id} value={item.id}>
          {number.format(item.volume_ml)} میلی‌لیتر · {item.concentration} · {item.sku}
        </option>)}
      </select>
      <div className="detail-price" aria-live="polite"><strong>{priceText(variant.price)}</strong></div>
    </> : <p role="status">نسخه‌ای برای نمایش وجود ندارد.</p>}
  </section>;
}
