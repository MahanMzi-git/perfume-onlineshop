import { products } from '../data/products';
import { sortLabels } from '../data/catalogLabels';
import { ActiveFilters } from '../components/ActiveFilters';
import { AdvancedFilters } from '../components/AdvancedFilters';
import { NoteFilters } from '../components/NoteFilters';
import { ProductGrid } from '../components/ProductGrid';
import { useStore } from '../components/StoreContext';
import { filterProducts } from '../lib/filter';
import { sortProducts } from '../lib/catalog';
import { catalogHref, filtersFromParams, sortFromParams } from '../lib/routes';
import type { Filters, SortOrder } from '../types/product';

export function CatalogPage({ params }: { params: URLSearchParams }) {
  const filters = filtersFromParams(params);
  const sort = sortFromParams(params);
  const wishlistOnly = params.get('wishlist') === '1';
  const { favourites } = useStore();
  const results = sortProducts(filterProducts(products, filters).filter(p => !wishlistOnly || favourites.includes(p.id)), sort, filters);
  const totalPages = Math.max(1, Math.ceil(results.length / 4));
  const requestedPage = Number(params.get('page') ?? 1);
  const page = Math.min(totalPages, Math.max(1, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1));
  function update(patch: Partial<Filters>, replace = false) {
    const next = catalogHref({ ...filters, ...patch }, { sort, wishlist: wishlistOnly });
    if (replace) {
      history.replaceState(null, '', next);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else location.hash = next;
  }
  function toggleNote(id: string) {
    const selected = filters.noteIds ?? [];
    update({ noteIds: selected.includes(id) ? selected.filter(note => note !== id) : [...selected, id] });
    requestAnimationFrame(() => document.getElementById('catalog-results')?.scrollIntoView({ block: 'start' }));
  }
  const reset = () => { location.hash = catalogHref(); };
  function goPage(value: number) {
    location.hash = catalogHref(filters, { sort, wishlist: wishlistOnly, page: value });
    requestAnimationFrame(() => document.getElementById('catalog-results')?.scrollIntoView({ block: 'start' }));
  }
  return <section className="step2-page container section" aria-labelledby="catalog-title">
    <nav className="breadcrumbs" aria-label="مسیر صفحه"><a href="#home">خانه</a><span>/</span><span>کاتالوگ</span></nav>
    <p className="eyebrow">THE FRAGRANCE CATALOG</p><h1 id="catalog-title">{wishlistOnly ? 'علاقه‌مندی‌های شما' : 'عطر بعدی‌ات را کشف کن.'}</h1>
    <p className="page-intro">هشت عطر خیالی، با مشخصات قابل مقایسه. قیمت، موجودی، تاریخ و امتیازها صرفاً برای پیش‌نمایش‌اند.</p>
    <div className="catalog-search-sort">
      <label>جستجوی نام، برند یا نت<input type="search" maxLength={120} value={filters.query} onChange={e => update({ query: e.target.value }, true)} placeholder="نام عطر، برند یا نت…" /></label>
      <label>مرتب‌سازی<select value={sort} onChange={e => { location.hash = catalogHref(filters, { sort: e.target.value as SortOrder, wishlist: wishlistOnly }); }}>{Object.entries(sortLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </div>
    <AdvancedFilters filters={filters} onChange={patch => update(patch, patch.minPrice !== undefined || patch.maxPrice !== undefined)} />
    <NoteFilters selectedIds={filters.noteIds ?? []} onToggle={toggleNote} />
    <div id="catalog-results" className="catalog-result-area"><h2 className="sr">نتایج کاتالوگ</h2>
      <ActiveFilters filters={filters} wishlistOnly={wishlistOnly} count={results.length} onRemoveNote={toggleNote} onRemove={key => update({ [key]: key === 'query' ? '' : undefined })} onReset={reset} />
      {results.length ? <><p className="fine-print">قیمت کارت مربوط به اولین حجم و غلظت منطبق با فیلترهاست؛ نسخهٔ دقیق را در جزئیات انتخاب کنید.</p><ProductGrid list={results.slice((page - 1) * 4, page * 4)} filters={filters} onNote={toggleNote} /></> : <div className="empty"><h2>عطری مطابق این انتخاب پیدا نشد.</h2><p>می‌توانید یک فیلتر را حذف کنید یا از ابتدا شروع کنید.</p><button className="step-action" onClick={reset}>پاک کردن همهٔ فیلترها</button></div>}
    </div>
    {results.length > 0 && <nav className="pagination" aria-label="صفحه‌بندی محصولات">
      <button className="step-action" disabled={page === 1} onClick={() => goPage(page - 1)}>صفحهٔ قبل</button>
      <span aria-live="polite">صفحهٔ {new Intl.NumberFormat('fa-IR').format(page)} از {new Intl.NumberFormat('fa-IR').format(totalPages)}</span>
      <button className="step-action" disabled={page === totalPages} onClick={() => goPage(page + 1)}>صفحهٔ بعد</button>
    </nav>}
  </section>;
}
