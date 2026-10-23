import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ArrowUpLeft, BookOpen, FlaskConical, Gift, Leaf } from 'lucide-react';
import { Header } from './components/Header';
import { MobileIsland } from './components/MobileIsland';
import { HeroSection } from './components/HeroSection';
import { CategoryTile } from './components/CategoryTile';
import { ProductCard } from './components/ProductCard';
import { FragranceDiscovery } from './components/FragranceDiscovery';
import { BrandBenefits } from './components/BrandBenefits';
import { Footer } from './components/Footer';
import { Dialog, SectionHeading, TextLink } from './components/SharedUI';
import { categories } from './data/categories';
import { brands } from './data/brands';
import { products } from './data/products';
import { isCardStudy } from './data/cardStudyImages';
import { handleArrowFieldNavigation } from './lib/arrowFieldNavigation';
import { announcement, articles } from './data/homepage';
import { NoteFilters } from './components/NoteFilters';
import { ActiveFilters } from './components/ActiveFilters';
import { consumeHomeReturn, navigateToSection } from './lib/navigation';
import { useFavourites } from './lib/useFavourites';
import { emptyFilters, filterProducts } from './lib/filter';
import { StoreContext } from './components/StoreContext';
import { CommercePages } from './components/CommercePages';
import { DiscoveryNavigation } from './components/DiscoveryNavigation';
import { ComparisonBar } from './components/ComparisonBar';
import { addDemoBagItem, changeDemoBagItem, type BagLine } from './lib/demoBag';
import { getLastHomePosition, useHashLocation } from './lib/useHashLocation';
import { catalogHref, comparisonHref, parseRoute } from './lib/routes';
import { addComparison } from './lib/catalog';
import './styles/catalog.css';
import './styles/customer.css';
import type { Product, ProductVariant, Filters, ProductCategory } from './types/product';

export default function App() {
  useEffect(() => { document.addEventListener('keydown',handleArrowFieldNavigation); return () => document.removeEventListener('keydown',handleArrowFieldNavigation); }, []);
  const { hash, restoredScroll } = useHashLocation();
  const route = useMemo(() => parseRoute(hash), [hash]);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [comparisonFeedback, setComparisonFeedback] = useState('');
  useEffect(() => {
    if (!comparisonFeedback) return;
    const timeout = window.setTimeout(() => setComparisonFeedback(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [comparisonFeedback]);
  const [bagLines, setBagLines] = useState<BagLine[]>([]);
  const [discountCode, setDiscountCode] = useState('');
  useEffect(() => {
    if (route.page === 'compare') {
      const ids = [...new Set((route.params.get('ids') ?? '').split(','))].filter(id => products.some(p => p.id === id)).slice(0, 3);
      setComparisonIds(ids);
    }
  }, [hash]);
  const routePath = hash.split('?')[0];
  useLayoutEffect(() => {
    const productTitle = route.page === 'product' ? products.find(p => p.slug === route.slug)?.name : undefined;
    document.title = (productTitle ?? ({ cart: 'سبد خرید', checkout: 'تسویه‌حساب نمایشی', account: 'حساب نمایشی', home: 'فروشگاه عطر', product: 'جزئیات عطر', 'not-found': 'صفحه پیدا نشد', catalog: 'کاتالوگ عطرها', families: 'کتابخانهٔ رایحه', family: 'خانوادهٔ رایحه', notes: 'واژه‌نامه نت‌ها', note: 'شناخت نت', compare: 'مقایسهٔ عطرها' }[route.page] ?? 'فروشگاه عطر')) + ' | آروما';
    if (route.page === 'home' && consumeHomeReturn()) {
      const position = getLastHomePosition();
      window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' });
      let secondFrame = 0;
      const frame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
      });
      return () => { cancelAnimationFrame(frame); cancelAnimationFrame(secondFrame); };
    }
    if (restoredScroll) {
      const frame = requestAnimationFrame(() => window.scrollTo({ left: restoredScroll.x, top: restoredScroll.y, behavior: 'instant' }));
      return () => cancelAnimationFrame(frame);
    }
    if (route.page === 'home') {
      if (hash === '#home') {
        requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
        return;
      }
      if (['#home', '#products', '#brands', '#discovery', '#about', '#gifts', '#journal', '#discovery-sets'].includes(hash)) {
        requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' }));
      }
      return;
    }
    requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>('main h1');
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, [routePath, restoredScroll]);
  function toggleComparison(id: string) {
    const next = addComparison(comparisonIds, id);
    if (next.limitReached) { setComparisonFeedback('حداکثر سه عطر قابل مقایسه‌اند؛ ابتدا یکی از انتخاب‌ها را حذف کنید.'); return; }
    setComparisonIds(next.ids);
    setComparisonFeedback(next.ids.includes(id) ? 'به مقایسه اضافه شد.' : 'از مقایسه حذف شد.');
    if (route.page === 'compare') location.hash = comparisonHref(next.ids);
  }
  function addToBag(product: Product, variant: ProductVariant) {
    const result = addDemoBagItem(bagLines, product, variant.id);
    setBagLines(result.lines);
    return result.message;
  }

  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const activeCat = filters.audience ?? (filters.giftSet ? 'gifts' : filters.niche ? 'niche' : undefined);
  const [modal, setModal] = useState<string>();
  const [email, setEmail] = useState('');
  const [signup, setSignup] = useState(false);
  const [favourites, setFavourites] = useFavourites();
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const results = useMemo(() => filterProducts(products, filters).filter(p => !wishlistOnly || favourites.includes(p.id)), [filters, wishlistOnly, favourites]);
  const set = (patch: Partial<Filters>) => setFilters(f => ({ ...f, ...patch }));
  const toggleNote = (noteId: string) => {
    setFilters(current => {
      const selected = current.noteIds ?? [];
      return { ...current, noteIds: selected.includes(noteId) ? selected.filter(id => id !== noteId) : [...selected, noteId] };
    });
    requestAnimationFrame(() => document.getElementById('home-product-results')?.scrollIntoView({ block: 'start' }));
  };
  const reset = () => { setFilters(emptyFilters); setWishlistOnly(false); };
  const selectCat = (c: ProductCategory) => {
    if (c.scrollTo) { navigateToSection(c.scrollTo); return; }
    setWishlistOnly(false); setFilters({ ...emptyFilters, ...c.patch });
    navigateToSection('products');
  };
  const selectCatId = (id: string) => { if (id === 'all') { reset(); navigateToSection('products'); return; } const c = categories.find(x => x.id === id); if (c) selectCat(c); };
  const action = (id: string) => {
    if (id === 'wishlist') location.hash = '#/account/wishlist';
    else if (id === 'account') location.hash = '#/account';
    else if (id === 'cart') location.hash = '#/cart';
    else setModal(id);
  };
  const curated = (familyId: string) => { reset(); setFilters({ query: '', familyId }); navigateToSection('products'); };
  const bagCount = bagLines.reduce((sum, line) => sum + line.quantity, 0);
  const article = modal?.startsWith('article-') ? articles[Number(modal.slice(8))] : undefined;
  return <StoreContext.Provider value={{ favourites, toggleFavourite: id => setFavourites(list => list.includes(id) ? list.filter(value => value !== id) : [...list, id]), comparisonIds, toggleComparison, addToBag, bagLines, discountCode, setDiscountCode, removeBag: variantId => setBagLines(lines => lines.filter(line => line.variantId !== variantId)), changeBag: (product, fromId, toId, quantity) => { const result = changeDemoBagItem(bagLines, product, fromId, toId, quantity); setBagLines(result.lines); return result.message; } }}>
    <a className="skip" href="#main-content" onClick={event => { event.preventDefault(); const main = document.getElementById('main-content'); if (main) { main.tabIndex = -1; main.focus({ preventScroll: true }); main.scrollIntoView({ block: 'start' }); } }}>پرش به محتوای اصلی</a>
    <div className="announcement">{announcement}</div>
    <Header catalogMode={route.page !== 'home'} query={filters.query} onQuery={query => { setWishlistOnly(false); set({ query }); }} onCategory={id => { if (route.page === 'home') selectCatId(id); else location.hash = catalogHref(categories.find(c => c.id === id)?.patch ?? {}); }} onAction={action} activeCat={activeCat} favouriteCount={favourites.length} bagCount={bagCount} onSearch={query => { if (route.page === 'home') navigateToSection('products'); else location.hash = catalogHref({ query: query ?? filters.query }); }} />
    <DiscoveryNavigation page={route.page} />
    <p className="comparison-feedback container" role="status">{comparisonFeedback}</p>
    <main id="main-content">{route.page === 'home' ? <><HeroSection />
      <section className="section container" aria-label="دسته‌بندی عطرها"><SectionHeading eyebrow="YOUR SCENT, YOUR WORLD" title="دنیای عطر، به انتخاب شما"><TextLink href="#discovery">شناخت رایحه‌ها</TextLink></SectionHeading>
        <div id="categories-title" className="tiles">{categories.map(c => <CategoryTile key={c.id} category={c} active={activeCat === c.id} onSelect={selectCat} />)}</div>
      </section>
      <section id="brands" className="brand-section container" aria-label="برندهای نمایشی"><div><p className="eyebrow">THE BRAND EDIT</p><h2>{isCardStudy ? 'هر نام، یک جهان رایحه' : 'چهار نام، چهار جهان'}</h2><small>{isCardStudy ? 'نام‌های واقعی برای آزمون طراحی؛ خرید و موجودی نمایشی' : 'برندهای خیالی این مجموعه'}</small></div><div className="brand-list">{brands.map(b => <button key={b.id} dir="ltr" aria-pressed={filters.brandId === b.id} onClick={() => { setWishlistOnly(false); set({ brandId: filters.brandId === b.id ? undefined : b.id }); navigateToSection('products'); }}>{b.name}</button>)}</div></section>
      <section id="products" className="section product-section"><div className="container"><SectionHeading eyebrow="THE FRAGRANCE SELECTION" title={wishlistOnly ? 'عطرهای مورد علاقهٔ شما' : 'منتخب عطرهای آروما'}><button className="text-link" onClick={reset}>مشاهدهٔ همه <ArrowUpLeft aria-hidden="true" size={17} /></button></SectionHeading>
        <div className="catalog-toolbar"><div className="chips" role="group" aria-label="نوع مجموعه"><button className="chip catalog-tab" aria-pressed={!filters.bestseller && !filters.featured && !wishlistOnly && !filters.audience && !filters.brandId && !filters.familyId && !filters.noteIds?.length && !filters.query && !filters.niche && !filters.giftSet} onClick={reset}>همهٔ عطرها</button><button className="chip catalog-tab" aria-pressed={!!filters.bestseller} onClick={() => { setWishlistOnly(false); set({ bestseller: filters.bestseller ? undefined : true, featured: undefined }); }}>پرفروش‌ها · نمایشی</button><button className="chip catalog-tab" aria-pressed={!!filters.featured} onClick={() => { setWishlistOnly(false); set({ featured: filters.featured ? undefined : true, bestseller: undefined }); }}>پیشنهاد آروما</button></div><span className="badge">محصولات و قیمت‌های نمایشی</span></div>
        <NoteFilters selectedIds={filters.noteIds ?? []} onToggle={toggleNote} />
        <div id="home-product-results" className="home-product-results">
        <ActiveFilters filters={filters} wishlistOnly={wishlistOnly} count={results.length} onRemoveNote={toggleNote} onRemove={key => set({ [key]: key === 'query' ? '' : undefined })} onReset={reset} />
        {results.length ? <div className="grid">{results.map(p => <ProductCard key={p.id} product={p} onNote={toggleNote} selectedNoteIds={filters.noteIds ?? []} favourite={favourites.includes(p.id)} onFavourite={() => setFavourites(f => f.includes(p.id) ? f.filter(id => id !== p.id) : [...f, p.id])} />)}</div> : <div className="empty"><FlaskConical aria-hidden="true" size={32} /><h3>{wishlistOnly ? 'هنوز عطری انتخاب نکرده‌ای' : 'رایحهٔ مورد نظرت پیدا نشد'}</h3><p>{wishlistOnly ? 'با لمس قلب روی کارت‌ها، مجموعهٔ شخصی‌ات را بساز. انتخاب‌ها در همین مرورگر ذخیره می‌شوند؛ اگر ذخیره‌سازی غیرفعال باشد، فقط تا بازبودن صفحه باقی می‌مانند.' : 'عبارت دیگری امتحان کن یا فیلترها را بردار.'}</p><button className="cta" onClick={reset}>دیدن همهٔ عطرها</button></div>}
        </div>
      </div></section>
      <FragranceDiscovery familyId={filters.familyId} onSelect={familyId => { setWishlistOnly(false); set({ familyId }); navigateToSection('products'); }} />
      <section id="discovery-sets" className="section container"><div className="editorial-panel"><div className="sample-art" aria-hidden="true"><span /><span /><span /><span /><p>THE DISCOVERY EDIT</p></div><div className="editorial-copy"><p className="eyebrow">SMALL BOTTLES. NEW WORLDS.</p><h2>پیش از انتخاب،<br />کشف کن.</h2><p>گاهی یک نمونهٔ کوچک، شروع یک علاقهٔ بزرگ است. با مفهوم ست‌های آشنایی و تجربهٔ عطر روی پوست بیشتر آشنا شو.</p><button className="text-link" onClick={() => setModal('samples')}>دربارهٔ ست‌های کشف رایحه <ArrowUpLeft aria-hidden="true" size={18} /></button><small>معرفی مفهومی؛ نمونه‌ای برای فروش عرضه نشده است.</small></div></div></section>
      <section className="section container"><SectionHeading eyebrow="A SCENT FOR EVERY MOMENT" title="برای حال‌وهوای این روزها" /><div className="collection-grid"><button className="collection collection-fresh" onClick={() => curated('f-citrus')}><Leaf aria-hidden="true" /><span className="eyebrow">FRESH & BRIGHT</span><h3>یک شروعِ روشن</h3><p>نگاهی به عطرهای مرکباتی</p><ArrowUpLeft aria-hidden="true" /></button><button className="collection collection-warm" onClick={() => curated('f-woody')}><FlaskConical aria-hidden="true" /><span className="eyebrow">DEEP & QUIET</span><h3>آرامشِ یک عصر</h3><p>کشف جهان رایحه‌های چوبی</p><ArrowUpLeft aria-hidden="true" /></button></div></section>
      <section id="gifts" className="gift-banner container"><Gift aria-hidden="true" size={38} /><div><p className="eyebrow">A THOUGHTFUL GIFT</p><h2>یک رایحه، به یادِ یک نفر.</h2><p>مجموعه‌های هدیهٔ نمایشی را ببین و برای انتخاب الهام بگیر.</p></div><button className="cta" onClick={() => selectCatId('gifts')}>ایده‌های هدیه <ArrowUpLeft aria-hidden="true" size={18} /></button></section>
      <section id="journal" className="section container"><SectionHeading eyebrow="THE AROMA JOURNAL" title="کمی بیشتر از عطر بدانیم" /><div className="journal-grid">{articles.map((a, i) => <button className="journal-card" key={a.title} onClick={() => setModal('article-' + i)}><div className={'journal-art journal-art-' + i}><BookOpen aria-hidden="true" size={42} /><span>0{i + 1}</span></div><p className="eyebrow">{a.category}</p><h3>{a.title}</h3><span className="text-link">خواندن راهنما <ArrowUpLeft aria-hidden="true" size={16} /></span></button>)}</div></section>
      <BrandBenefits />
      <section className="newsletter container"><div><p className="eyebrow">LET’S STAY INSPIRED</p><h2>نامه‌ای از دنیای رایحه‌ها</h2><p>فرم نمایشی خبرنامه؛ ایمیل شما ذخیره یا ارسال نمی‌شود.</p></div><form onSubmit={e => { e.preventDefault(); setSignup(true); }}><label htmlFor="newsletter-email">ایمیل شما</label><div className="search-row"><input id="newsletter-email" type="email" autoComplete="email" maxLength={254} aria-describedby="newsletter-status" dir="ltr" placeholder="you@example.com" required value={email} onChange={e => { setEmail(e.target.value); setSignup(false); }} /><button className="cta" type="submit">امتحان فرم</button></div><p id="newsletter-status" className="form-status" role="status">{signup ? 'فرمت ایمیل معتبر است؛ در این نسخه هیچ اطلاعاتی ارسال یا ذخیره نشد.' : 'فقط برای پیش‌نمایش تجربهٔ عضویت'}</p></form></section>
    </> : <CommercePages route={route} comparisonIds={comparisonIds} />}</main><ComparisonBar /><Footer onCategory={selectCatId} onInfo={setModal} />
    <MobileIsland route={route} favouriteCount={favourites.length} bagCount={bagCount} />
    {modal && <Dialog title={article?.title ?? ({ account: 'حساب کاربری', cart: 'سبد خرید', samples: 'ست کشف رایحه چیست؟', contact: 'ارتباط با آروما', policies: 'شرایط و حریم خصوصی' }[modal] ?? 'اطلاعات آروما')} onClose={() => setModal(undefined)}>
      {<p>{article?.text ?? ({ account: 'ورود و ثبت‌نام در این مرحله فعال نیست. این پیش‌نمایش حساب واقعی یا احراز هویت ندارد.', cart: 'این نسخه برای آشنایی با طراحی فروشگاه است. افزودن به سبد، سفارش و پرداخت در مرحله‌های بعد ساخته می‌شوند.', samples: 'ست کشف رایحه مجموعه‌ای از نمونه‌های کوچک برای مقایسه و آشنایی است. پیش از خرید یک بطری کامل، می‌توان تغییر رایحه روی پوست را تجربه کرد. این بخش فعلاً معرفی است و موجودی واقعی ندارد.', contact: 'اطلاعات فروشنده، شماره تماس، نشانی و شبکه‌های اجتماعی پس از تأیید مالک فروشگاه درج می‌شوند. در این نسخه کانال ارتباطی فعالی معرفی نشده است.', policies: 'این سایت نسخهٔ نمایشی است و خریدی در آن انجام نمی‌شود. شرایط ارسال، مرجوعی و حریم خصوصی باید پیش از راه‌اندازی فروش واقعی توسط مالک فروشگاه تکمیل شوند. فرم خبرنامه داده‌ای ارسال نمی‌کند.' }[modal])}</p>}<button className="cta" onClick={() => setModal(undefined)}>متوجه شدم</button>
    </Dialog>}
  </StoreContext.Provider>;
}
