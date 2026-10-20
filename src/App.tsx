import { useMemo, useState } from 'react';
import { ArrowUpLeft, BookOpen, FlaskConical, Gift, Leaf } from 'lucide-react';
import { Header } from './components/Header';
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
import { announcement, articles } from './data/homepage';
import { NoteFilters } from './components/NoteFilters';
import { ActiveFilters } from './components/ActiveFilters';
import { navigateToSection } from './lib/navigation';
import { useFavourites } from './lib/useFavourites';
import { emptyFilters, filterProducts } from './lib/filter';
import type { Filters, ProductCategory } from './types/product';

export default function App() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const activeCat = filters.audience ?? (filters.giftSet ? 'gifts' : filters.niche ? 'niche' : undefined);
  const [modal, setModal] = useState<string>();
  const [email, setEmail] = useState('');
  const [signup, setSignup] = useState(false);
  const [favourites, setFavourites] = useFavourites();
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const results = useMemo(() => filterProducts(products, filters).filter(p => !wishlistOnly || favourites.includes(p.id)), [filters, wishlistOnly, favourites]);
  const set = (patch: Partial<Filters>) => setFilters(f => ({ ...f, ...patch }));
  const toggleNote = (noteId: string) => setFilters(current => {
    const selected = current.noteIds ?? [];
    return { ...current, noteIds: selected.includes(noteId) ? selected.filter(id => id !== noteId) : [...selected, noteId] };
  });
  const reset = () => { setFilters(emptyFilters); setWishlistOnly(false); };
  const selectCat = (c: ProductCategory) => {
    if (c.scrollTo) { navigateToSection(c.scrollTo); return; }
    setWishlistOnly(false); setFilters({ ...emptyFilters, ...c.patch });
    navigateToSection('products');
  };
  const selectCatId = (id: string) => { if (id === 'all') { reset(); return; } const c = categories.find(x => x.id === id); if (c) selectCat(c); };
  const action = (id: string) => {
    if (id === 'wishlist') { setFilters(emptyFilters); setWishlistOnly(true); navigateToSection('products'); }
    else setModal(id);
  };
  const curated = (familyId: string) => { reset(); setFilters({ query: '', familyId }); navigateToSection('products'); };
  const article = modal?.startsWith('article-') ? articles[Number(modal.slice(8))] : undefined;
  return <>
    <a className="skip" href="#products">پرش به محصولات</a>
    <div className="announcement">{announcement}</div>
    <Header query={filters.query} onQuery={query => { setWishlistOnly(false); set({ query }); }} onCategory={selectCatId} onAction={action} activeCat={activeCat} favouriteCount={favourites.length} onSearch={() => navigateToSection('products')} />
    <main><HeroSection />
      <section className="section container" aria-label="دسته‌بندی عطرها"><SectionHeading eyebrow="YOUR SCENT, YOUR WORLD" title="دنیای عطر، به انتخاب شما"><TextLink href="#discovery">شناخت رایحه‌ها</TextLink></SectionHeading>
        <div id="categories-title" className="tiles">{categories.map(c => <CategoryTile key={c.id} category={c} active={activeCat === c.id} onSelect={selectCat} />)}</div>
      </section>
      <section id="brands" className="brand-section container" aria-label="برندهای نمایشی"><div><p className="eyebrow">THE BRAND EDIT</p><h2>چهار نام، چهار جهان</h2><small>برندهای خیالی این مجموعه</small></div><div className="brand-list">{brands.map(b => <button key={b.id} dir="ltr" aria-pressed={filters.brandId === b.id} onClick={() => { setWishlistOnly(false); set({ brandId: filters.brandId === b.id ? undefined : b.id }); navigateToSection('products'); }}>{b.name}</button>)}</div></section>
      <section id="products" className="section product-section"><div className="container"><SectionHeading eyebrow="THE FRAGRANCE SELECTION" title={wishlistOnly ? 'عطرهای مورد علاقهٔ شما' : 'منتخب عطرهای آروما'}><button className="text-link" onClick={reset}>مشاهدهٔ همه <ArrowUpLeft aria-hidden="true" size={17} /></button></SectionHeading>
        <div className="catalog-toolbar"><div className="chips" role="group" aria-label="نوع مجموعه"><button className="chip catalog-tab" aria-pressed={!filters.bestseller && !filters.featured && !wishlistOnly && !filters.audience && !filters.brandId && !filters.familyId && !filters.noteIds?.length && !filters.query && !filters.niche && !filters.giftSet} onClick={reset}>همهٔ عطرها</button><button className="chip catalog-tab" aria-pressed={!!filters.bestseller} onClick={() => { setWishlistOnly(false); set({ bestseller: filters.bestseller ? undefined : true, featured: undefined }); }}>پرفروش‌ها · نمایشی</button><button className="chip catalog-tab" aria-pressed={!!filters.featured} onClick={() => { setWishlistOnly(false); set({ featured: filters.featured ? undefined : true, bestseller: undefined }); }}>پیشنهاد آروما</button></div><span className="badge">محصولات و قیمت‌های نمایشی</span></div>
        <NoteFilters selectedIds={filters.noteIds ?? []} onToggle={toggleNote} />
        <ActiveFilters filters={filters} wishlistOnly={wishlistOnly} count={results.length} onRemoveNote={toggleNote} onRemove={key => set({ [key]: key === 'query' ? '' : undefined })} onReset={reset} />
        {results.length ? <div className="grid">{results.map(p => <ProductCard key={p.id} product={p} onNote={toggleNote} selectedNoteIds={filters.noteIds ?? []} favourite={favourites.includes(p.id)} onFavourite={() => setFavourites(f => f.includes(p.id) ? f.filter(id => id !== p.id) : [...f, p.id])} />)}</div> : <div className="empty"><FlaskConical aria-hidden="true" size={32} /><h3>{wishlistOnly ? 'هنوز عطری انتخاب نکرده‌ای' : 'رایحهٔ مورد نظرت پیدا نشد'}</h3><p>{wishlistOnly ? 'با لمس قلب روی کارت‌ها، مجموعهٔ شخصی‌ات را بساز. انتخاب‌ها در همین مرورگر ذخیره می‌شوند؛ اگر ذخیره‌سازی غیرفعال باشد، فقط تا بازبودن صفحه باقی می‌مانند.' : 'عبارت دیگری امتحان کن یا فیلترها را بردار.'}</p><button className="cta" onClick={reset}>دیدن همهٔ عطرها</button></div>}
      </div></section>
      <FragranceDiscovery familyId={filters.familyId} onSelect={familyId => { setWishlistOnly(false); set({ familyId }); navigateToSection('products'); }} />
      <section id="discovery-sets" className="section container"><div className="editorial-panel"><div className="sample-art" aria-hidden="true"><span /><span /><span /><span /><p>THE DISCOVERY EDIT</p></div><div className="editorial-copy"><p className="eyebrow">SMALL BOTTLES. NEW WORLDS.</p><h2>پیش از انتخاب،<br />کشف کن.</h2><p>گاهی یک نمونهٔ کوچک، شروع یک علاقهٔ بزرگ است. با مفهوم ست‌های آشنایی و تجربهٔ عطر روی پوست بیشتر آشنا شو.</p><button className="text-link" onClick={() => setModal('samples')}>دربارهٔ ست‌های کشف رایحه <ArrowUpLeft aria-hidden="true" size={18} /></button><small>معرفی مفهومی؛ نمونه‌ای برای فروش عرضه نشده است.</small></div></div></section>
      <section className="section container"><SectionHeading eyebrow="A SCENT FOR EVERY MOMENT" title="برای حال‌وهوای این روزها" /><div className="collection-grid"><button className="collection collection-fresh" onClick={() => curated('f-citrus')}><Leaf aria-hidden="true" /><span className="eyebrow">FRESH & BRIGHT</span><h3>یک شروعِ روشن</h3><p>نگاهی به عطرهای مرکباتی</p><ArrowUpLeft aria-hidden="true" /></button><button className="collection collection-warm" onClick={() => curated('f-woody')}><FlaskConical aria-hidden="true" /><span className="eyebrow">DEEP & QUIET</span><h3>آرامشِ یک عصر</h3><p>کشف جهان رایحه‌های چوبی</p><ArrowUpLeft aria-hidden="true" /></button></div></section>
      <section id="gifts" className="gift-banner container"><Gift aria-hidden="true" size={38} /><div><p className="eyebrow">A THOUGHTFUL GIFT</p><h2>یک رایحه، به یادِ یک نفر.</h2><p>مجموعه‌های هدیهٔ نمایشی را ببین و برای انتخاب الهام بگیر.</p></div><button className="cta" onClick={() => selectCatId('gifts')}>ایده‌های هدیه <ArrowUpLeft aria-hidden="true" size={18} /></button></section>
      <section id="journal" className="section container"><SectionHeading eyebrow="THE AROMA JOURNAL" title="کمی بیشتر از عطر بدانیم" /><div className="journal-grid">{articles.map((a, i) => <button className="journal-card" key={a.title} onClick={() => setModal('article-' + i)}><div className={'journal-art journal-art-' + i}><BookOpen aria-hidden="true" size={42} /><span>0{i + 1}</span></div><p className="eyebrow">{a.category}</p><h3>{a.title}</h3><span className="text-link">خواندن راهنما <ArrowUpLeft aria-hidden="true" size={16} /></span></button>)}</div></section>
      <BrandBenefits />
      <section className="newsletter container"><div><p className="eyebrow">LET’S STAY INSPIRED</p><h2>نامه‌ای از دنیای رایحه‌ها</h2><p>فرم نمایشی خبرنامه؛ ایمیل شما ذخیره یا ارسال نمی‌شود.</p></div><form onSubmit={e => { e.preventDefault(); setSignup(true); }}><label htmlFor="newsletter-email">ایمیل شما</label><div className="search-row"><input id="newsletter-email" type="email" autoComplete="email" maxLength={254} aria-describedby="newsletter-status" dir="ltr" placeholder="you@example.com" required value={email} onChange={e => { setEmail(e.target.value); setSignup(false); }} /><button className="cta" type="submit">امتحان فرم</button></div><p id="newsletter-status" className="form-status" role="status">{signup ? 'فرمت ایمیل معتبر است؛ در این نسخه هیچ اطلاعاتی ارسال یا ذخیره نشد.' : 'فقط برای پیش‌نمایش تجربهٔ عضویت'}</p></form></section>
    </main><Footer onCategory={selectCatId} onInfo={setModal} />
    {modal && <Dialog title={article?.title ?? ({ account: 'حساب کاربری', cart: 'سبد خرید', samples: 'ست کشف رایحه چیست؟', contact: 'ارتباط با آروما', policies: 'شرایط و حریم خصوصی' }[modal] ?? 'اطلاعات آروما')} onClose={() => setModal(undefined)}>
      <p>{article?.text ?? ({ account: 'ورود و ثبت‌نام در این مرحله فعال نیست. این پیش‌نمایش حساب واقعی یا احراز هویت ندارد.', cart: 'این نسخه برای آشنایی با طراحی فروشگاه است. افزودن به سبد، سفارش و پرداخت در مرحله‌های بعد ساخته می‌شوند.', samples: 'ست کشف رایحه مجموعه‌ای از نمونه‌های کوچک برای مقایسه و آشنایی است. پیش از خرید یک بطری کامل، می‌توان تغییر رایحه روی پوست را تجربه کرد. این بخش فعلاً معرفی است و موجودی واقعی ندارد.', contact: 'اطلاعات فروشنده، شماره تماس، نشانی و شبکه‌های اجتماعی پس از تأیید مالک فروشگاه درج می‌شوند. در این نسخه کانال ارتباطی فعالی معرفی نشده است.', policies: 'این سایت نسخهٔ نمایشی است و خریدی در آن انجام نمی‌شود. شرایط ارسال، مرجوعی و حریم خصوصی باید پیش از راه‌اندازی فروش واقعی توسط مالک فروشگاه تکمیل شوند. فرم خبرنامه داده‌ای ارسال نمی‌کند.' }[modal])}</p><button className="cta" onClick={() => setModal(undefined)}>متوجه شدم</button>
    </Dialog>}
  </>;
}
