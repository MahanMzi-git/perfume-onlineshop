import { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryTile } from './components/CategoryTile';
import { ProductCard } from './components/ProductCard';
import { FragranceDiscovery } from './components/FragranceDiscovery';
import { BrandBenefits } from './components/BrandBenefits';
import { Footer } from './components/Footer';
import { categories } from './data/categories';
import { brands } from './data/brands';
import { products } from './data/products';
import { noteById } from './data/scentNotes';
import { emptyFilters, filterProducts } from './lib/filter';
import type { Filters, ProductCategory } from './types/product';

export default function App() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [activeCat, setActiveCat] = useState<string>();
  const results = useMemo(() => filterProducts(products, filters), [filters]);
  const selectCat = (c: ProductCategory) => {
    if (c.scrollTo) { document.getElementById(c.scrollTo)?.scrollIntoView(); return; }
    setActiveCat(c.id); setFilters({ ...emptyFilters, ...c.patch });
    document.getElementById('products')?.scrollIntoView();
  };
  const selectCatId = (id: string) => { const c = categories.find((x) => x.id === id); if (c) selectCat(c); };
  const reset = () => { setFilters(emptyFilters); setActiveCat(undefined); };
  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const active = Object.entries(filters).some(([k, v]) => (k === 'query' ? !!v : v !== undefined));
  return (
    <>
      <a className="skip" href="#products">پرش به محصولات</a>
      <Header query={filters.query} onQuery={(query) => set({ query })} onNiche={() => selectCatId('niche')} />
      <main>
        <HeroSection />
        <section className="section" aria-labelledby="cats"><div className="container">
          <h2 id="cats" className="serif">دسته‌بندی‌ها</h2>
          <div className="tiles">{categories.map((c) => <CategoryTile key={c.id} category={c} active={activeCat === c.id} onSelect={selectCat} />)}</div>
        </div></section>
        <section id="products" className="section"><div className="container">
          <h2 className="serif">پرفروش‌ترین عطرها</h2>
          <div id="brands" className="chips" role="group" aria-label="فیلتر برند" dir="ltr">
            {brands.map((b) => (
              <button key={b.id} type="button" className="chip" aria-pressed={filters.brandId === b.id}
                onClick={() => set({ brandId: filters.brandId === b.id ? undefined : b.id })}>{b.name}</button>))}
          </div>
          <div className="status" role="status">
            <span>{results.length} عطر (داده نمایشی)</span>
            {filters.familyId && <span>خانواده فعال</span>}
            {filters.noteId && <span>نت: {noteById(filters.noteId)?.name}</span>}
            {active && <button type="button" className="link" onClick={reset}>پاک کردن فیلترها</button>}
          </div>
          {results.length ? <div className="grid">{results.map((p) => <ProductCard key={p.id} product={p} onNote={(noteId) => set({ noteId })} />)}</div>
            : <p className="empty">عطری مطابق جستجو پیدا نشد. <button type="button" className="link" onClick={reset}>بازنشانی</button></p>}
        </div></section>
        <FragranceDiscovery familyId={filters.familyId} onSelect={(familyId) => set({ familyId })} />
        <BrandBenefits />
      </main>
      <Footer onCategory={selectCatId} />
    </>
  );
}
