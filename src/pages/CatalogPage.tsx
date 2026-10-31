import type { Collection } from '../data/collections';
import { products } from '../data/products';
import { isCardStudy } from '../data/cardStudyImages';
import { sortLabels } from '../data/catalogLabels';
import { ActiveFilters } from '../components/ActiveFilters';
import { AdvancedFilters } from '../components/AdvancedFilters';
import { NoteFilters } from '../components/NoteFilters';
import { ProductGrid } from '../components/ProductGrid';
import { LuxurySelect } from '../components/LuxurySelect';
import { useStore } from '../components/StoreContext';
import { filterProducts } from '../lib/filter';
import { sortProducts } from '../lib/catalog';
import { catalogHref, filtersFromParams, sortFromParams } from '../lib/routes';
import type { Filters, SortOrder } from '../types/product';

export function CatalogPage({ params, collection, baseHref = '#/catalog' }: { params: URLSearchParams; collection?: Collection; baseHref?: string }) {
  const scope = collection?.filters ?? {};
  const filters = { ...filtersFromParams(params), ...scope };
  const visibleFilters = { ...filters };
  for (const key of Object.keys(scope)) delete visibleFilters[key as keyof Filters];
  const href = (values: Partial<Filters> = {}, extras: Parameters<typeof catalogHref>[1] = {}) => catalogHref(values, extras).replace('#/catalog', baseHref);
  const sort = sortFromParams(params);
  const wishlistOnly = params.get('wishlist') === '1';
  const { favourites } = useStore();
  const results = sortProducts(filterProducts(products, filters).filter(p => !wishlistOnly || favourites.includes(p.id)), sort, filters);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const emptyCollection = !!collection && filterProducts(products, { query:'', ...scope }).length === 0;
  const requestedPage = Number(params.get('page') ?? 1);
  const page = Math.min(totalPages, Math.max(1, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1));
  function update(patch: Partial<Filters>, replace = false) {
    const next = href({ ...filters, ...patch }, { sort, wishlist: wishlistOnly });
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
  const reset = () => { location.hash = href(); };
  function goPage(value: number) {
    location.hash = href(filters, { sort, wishlist: wishlistOnly, page: value });
    requestAnimationFrame(() => document.getElementById('catalog-results')?.scrollIntoView({ block: 'start' }));
  }
  return <section className="step2-page container section" aria-labelledby="catalog-title">
    <nav className="breadcrumbs" aria-label="مسیر صفحه"><a href="#home">خانه</a><span>/</span><a href="#/catalog">کاتالوگ</a>{collection && <><span>/</span><span>{collection.title}</span></>}</nav>
    <p className="eyebrow">THE FRAGRANCE CATALOG</p><h1 id="catalog-title">{collection?.title ?? (wishlistOnly ? 'علاقه‌مندی‌های شما' : 'عطر بعدی‌ات را کشف کن.')}</h1>
    {collection && <p className="collection-intro">{collection.intro}</p>}
    <p className="page-intro">{isCardStudy ? 'نام و عکس عطرها واقعی و نت‌ها برگرفته از معرفی برندند؛ قیمت، حجم‌های انتخابی، موجودی و ویژگی‌های خرید صرفاً نمایشی‌اند.' : 'هشت عطر خیالی، با مشخصات قابل مقایسه. قیمت، موجودی، تاریخ و امتیازها صرفاً برای پیش‌نمایش‌اند.'}</p>
    <div className="catalog-search-sort">
      <label>جستجوی نام، برند یا نت<input type="search" maxLength={120} value={filters.query} onChange={e => update({ query: e.target.value }, true)} placeholder="نام عطر، برند یا نت…" /></label>
      <LuxurySelect label="مرتب‌سازی" value={sort} options={Object.entries(sortLabels).map(([value, label]) => ({ value, label }))} onChange={value => { location.hash = href(filters, { sort: value as SortOrder, wishlist: wishlistOnly }); }} />
    </div>
    <AdvancedFilters lockedKeys={Object.keys(scope) as (keyof Filters)[]} filters={filters} onChange={patch => update(patch, patch.minPrice !== undefined || patch.maxPrice !== undefined)} />
    <NoteFilters selectedIds={filters.noteIds ?? []} onToggle={toggleNote} />
    <div id="catalog-results" className="catalog-result-area"><h2 className="sr">نتایج کاتالوگ</h2>
      <ActiveFilters filters={visibleFilters} wishlistOnly={wishlistOnly} count={results.length} onRemoveNote={toggleNote} onRemove={key => update({ [key]: key === 'query' ? '' : undefined })} onReset={reset} />
      {results.length ? <><p className="fine-print">قیمت کارت مربوط به اولین حجم و غلظت منطبق با فیلترهاست؛ نسخهٔ دقیق را در جزئیات انتخاب کنید.</p><ProductGrid list={results.slice((page - 1) * pageSize, page * pageSize)} filters={filters} onNote={toggleNote} /></> : emptyCollection ? <div className="empty"><h2>این مجموعه فعلاً محصول نمایشی ندارد.</h2><p>می‌توانید عطرهای مجموعه‌های دیگر را ببینید.</p><a className="step-action" href="#/catalog">دیدن همهٔ عطرها</a></div> : <div className="empty"><h2>عطری مطابق این انتخاب پیدا نشد.</h2><p>می‌توانید یک فیلتر را حذف کنید یا از ابتدا شروع کنید.</p><button className="step-action" onClick={reset}>پاک کردن همهٔ فیلترها</button></div>}
    </div>
    {results.length > 0 && <nav className="pagination" aria-label="صفحه‌بندی محصولات">
      <button className="step-action" disabled={page === 1} onClick={() => goPage(page - 1)}>صفحهٔ قبل</button>
      <span aria-live="polite">صفحهٔ {new Intl.NumberFormat('fa-IR').format(page)} از {new Intl.NumberFormat('fa-IR').format(totalPages)}</span>
      <button className="step-action" disabled={page === totalPages} onClick={() => goPage(page + 1)}>صفحهٔ بعد</button>
    </nav>}
  </section>;
}
