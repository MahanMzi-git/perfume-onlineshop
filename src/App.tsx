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
import { noteById } from './data/scentNotes';
import { emptyFilters, filterProducts } from './lib/filter';
import type { Filters, ProductCategory } from './types/product';

export default function App() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [activeCat, setActiveCat] = useState<string>();
  const [modal, setModal] = useState<string>();
  const [email, setEmail] = useState('');
  const [signup, setSignup] = useState(false);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const results = useMemo(() => filterProducts(products, filters).filter(p => !wishlistOnly || favourites.includes(p.id)), [filters, wishlistOnly, favourites]);
  const set = (patch: Partial<Filters>) => setFilters(f => ({ ...f, ...patch }));
  const reset = () => { setFilters(emptyFilters); setActiveCat(undefined); setWishlistOnly(false); };
  const selectCat = (c: ProductCategory) => {
    if (c.scrollTo) { document.getElementById(c.scrollTo)?.scrollIntoView(); return; }
    setActiveCat(c.id); setWishlistOnly(false); setFilters({ ...emptyFilters, ...c.patch });
    document.getElementById('products')?.scrollIntoView();
  };
  const selectCatId = (id: string) => { if (id === 'all') { reset(); return; } const c = categories.find(x => x.id === id); if (c) selectCat(c); };
  const action = (id: string) => {
    if (id === 'wishlist') { setFilters(emptyFilters); setActiveCat(undefined); setWishlistOnly(true); location.hash = 'products'; }
    else setModal(id);
  };
  const curated = (familyId: string) => { reset(); setFilters({ query: '', familyId }); location.hash = 'products'; };
  const active = wishlistOnly || Object.entries(filters).some(([k, v]) => k === 'query' ? !!v : v !== undefined);
  const article = modal?.startsWith('article-') ? articles[Number(modal.slice(8))] : undefined;
  return <>
    <a className="skip" href="#products">پرش به محصولات</a>
    <div className="announcement">{announcement}</div>
    <Header query={filters.query} onQuery={query => set({ query })} onCategory={selectCatId} onAction={action} activeCat={activeCat} />
    <main><HeroSection />
      <section className="section container" aria-label="دسته‌بندی عطرها"><SectionHeading eyebrow="YOUR SCENT, YOUR WORLD" title="دنیای عطر، به انتخاب شما"><TextLink href="#discovery">شناخت رایحه‌ها</TextLink></SectionHeading>
        <div id="categories-title" className="tiles">{categories.map(c => <CategoryTile key={c.id} category={c} active={activeCat === c.id} onSelect={selectCat} />)}</div>
      </section>
      <section id="brands" className="brand-section container" aria-label="برندهای نمایشی"><div><p className="eyebrow">THE BRAND EDIT</p><h2>چهار نام، چهار جهان</h2><small>برندهای خیالی این مجموعه</small></div><div className="brand-list">{brands.map(b => <button key={b.id} dir="ltr" aria-pressed={filters.brandId === b.id} onClick={() => { set({ brandId: filters.brandId === b.id ? undefined : b.id }); location.hash = 'products'; }}>{b.name}</button>)}</div></section>
      <section id="products" className="section product-section"><div className="container"><SectionHeading eyebrow="THE FRAGRANCE SELECTION" title={wishlistOnly ? 'عطرهای مورد علاقهٔ شما' : 'منتخب عطرهای آروما'}><button className="text-link" onClick={reset}>مشاهدهٔ همه <ArrowUpLeft size={17} /></button></SectionHeading>
        <div className="catalog-toolbar"><div className="chips" role="group" aria-label="نوع مجموعه"><button className="chip" aria-pressed={!filters.bestseller && !filters.featured && !wishlistOnly} onClick={reset}>همهٔ عطرها</button><button className="chip" aria-pressed={!!filters.bestseller} onClick={() => { setWishlistOnly(false); set({ bestseller: filters.bestseller ? undefined : true, featured: undefined }); }}>پرفروش‌ها · نمایشی</button><button className="chip" aria-pressed={!!filters.featured} onClick={() => { setWishlistOnly(false); set({ featured: filters.featured ? undefined : true, bestseller: undefined }); }}>پیشنهاد آروما</button></div><span className="badge">محصولات و قیمت‌های نمایشی</span></div>
        <div className="status" role="status"><span>{new Intl.NumberFormat('fa-IR').format(results.length)} عطر</span>{filters.brandId && <span>{brands.find(b => b.id === filters.brandId)?.name}</span>}{filters.familyId && <span>خانوادهٔ بویایی فعال</span>}{filters.noteId && <span>نت: {noteById(filters.noteId)?.name}</span>}{active && <button className="link" onClick={reset}>پاک کردن فیلترها</button>}</div>
        {results.length ? <div className="grid">{results.map(p => <ProductCard key={p.id} product={p} onNote={noteId => set({ noteId })} favourite={favourites.includes(p.id)} onFavourite={() => setFavourites(f => f.includes(p.id) ? f.filter(id => id !== p.id) : [...f, p.id])} />)}</div> : <div className="empty"><FlaskConical size={32} /><h3>{wishlistOnly ? 'هنوز عطری انتخاب نکرده‌ای' : 'رایحهٔ مورد نظرت پیدا نشد'}</h3><p>{wishlistOnly ? 'با لمس قلب روی کارت‌ها، مجموعهٔ شخصی‌ات را بساز. انتخاب‌ها فقط تا بازبودن این صفحه باقی می‌مانند.' : 'عبارت دیگری امتحان کن یا فیلترها را بردار.'}</p><button className="cta" onClick={reset}>دیدن همهٔ عطرها</button></div>}
      </div></section>
      <FragranceDiscovery familyId={filters.familyId} onSelect={familyId => { setWishlistOnly(false); set({ familyId }); location.hash = 'products'; }} />
      <section id="discovery-sets" className="section container"><div className="editorial-panel"><div className="sample-art" aria-hidden="true"><span /><span /><span /><span /><p>THE DISCOVERY EDIT</p></div><div className="editorial-copy"><p className="eyebrow">SMALL BOTTLES. NEW WORLDS.</p><h2>پیش از انتخاب،<br />کشف کن.</h2><p>گاهی یک نمونهٔ کوچک، شروع یک علاقهٔ بزرگ است. با مفهوم ست‌های آشنایی و تجربهٔ عطر روی پوست بیشتر آشنا شو.</p><button className="text-link" onClick={() => setModal('samples')}>دربارهٔ ست‌های کشف رایحه <ArrowUpLeft size={18} /></button><small>معرفی مفهومی؛ نمونه‌ای برای فروش عرضه نشده است.</small></div></div></section>
      <section className="section container"><SectionHeading eyebrow="A SCENT FOR EVERY MOMENT" title="برای حال‌وهوای این روزها" /><div className="collection-grid"><button className="collection collection-fresh" onClick={() => curated('f-citrus')}><Leaf /><span className="eyebrow">FRESH & BRIGHT</span><h3>یک شروعِ روشن</h3><p>نگاهی به عطرهای مرکباتی</p><ArrowUpLeft /></button><button className="collection collection-warm" onClick={() => curated('f-woody')}><FlaskConical /><span className="eyebrow">DEEP & QUIET</span><h3>آرامشِ یک عصر</h3><p>کشف جهان رایحه‌های چوبی</p><ArrowUpLeft /></button></div></section>
      <section id="gifts" className="gift-banner container"><Gift size={38} /><div><p className="eyebrow">A THOUGHTFUL GIFT</p><h2>یک رایحه، به یادِ یک نفر.</h2><p>مجموعه‌های هدیهٔ نمایشی را ببین و برای انتخاب الهام بگیر.</p></div><button className="cta" onClick={() => selectCatId('gifts')}>ایده‌های هدیه <ArrowUpLeft size={18} /></button></section>
      <section id="journal" className="section container"><SectionHeading eyebrow="THE AROMA JOURNAL" title="کمی بیشتر از عطر بدانیم" /><div className="journal-grid">{articles.map((a, i) => <button className="journal-card" key={a.title} onClick={() => setModal('article-' + i)}><div className={'journal-art journal-art-' + i}><BookOpen size={42} /><span>0{i + 1}</span></div><p className="eyebrow">{a.category}</p><h3>{a.title}</h3><span className="text-link">خواندن راهنما <ArrowUpLeft size={16} /></span></button>)}</div></section>
      <BrandBenefits />
      <section className="newsletter container"><div><p className="eyebrow">LET’S STAY INSPIRED</p><h2>نامه‌ای از دنیای رایحه‌ها</h2><p>فرم نمایشی خبرنامه؛ ایمیل شما ذخیره یا ارسال نمی‌شود.</p></div><form onSubmit={e => { e.preventDefault(); setSignup(true); }}><label htmlFor="newsletter-email" className="sr">ایمیل شما</label><div className="search-row"><input id="newsletter-email" type="email" dir="ltr" placeholder="you@example.com" required value={email} onChange={e => { setEmail(e.target.value); setSignup(false); }} /><button className="cta" type="submit">امتحان فرم</button></div><p className="form-status" role="status">{signup ? 'فرمت ایمیل معتبر است؛ در این نسخه هیچ اطلاعاتی ارسال یا ذخیره نشد.' : 'فقط برای پیش‌نمایش تجربهٔ عضویت'}</p></form></section>
    </main><Footer onCategory={selectCatId} onInfo={setModal} />
    {modal && <Dialog title={article?.title ?? ({ account: 'حساب کاربری', cart: 'سبد خرید', samples: 'ست کشف رایحه چیست؟', contact: 'ارتباط با آروما', policies: 'شرایط و حریم خصوصی' }[modal] ?? 'اطلاعات آروما')} onClose={() => setModal(undefined)}>
      <p>{article?.text ?? ({ account: 'ورود و ثبت‌نام در این مرحله فعال نیست. این پیش‌نمایش حساب واقعی یا احراز هویت ندارد.', cart: 'این نسخه برای آشنایی با طراحی فروشگاه است. افزودن به سبد، سفارش و پرداخت در مرحله‌های بعد ساخته می‌شوند.', samples: 'ست کشف رایحه مجموعه‌ای از نمونه‌های کوچک برای مقایسه و آشنایی است. پیش از خرید یک بطری کامل، می‌توان تغییر رایحه روی پوست را تجربه کرد. این بخش فعلاً معرفی است و موجودی واقعی ندارد.', contact: 'اطلاعات فروشنده، شماره تماس، نشانی و شبکه‌های اجتماعی پس از تأیید مالک فروشگاه درج می‌شوند. در این نسخه کانال ارتباطی فعالی معرفی نشده است.', policies: 'این سایت نسخهٔ نمایشی است و خریدی در آن انجام نمی‌شود. شرایط ارسال، مرجوعی و حریم خصوصی باید پیش از راه‌اندازی فروش واقعی توسط مالک فروشگاه تکمیل شوند. فرم خبرنامه داده‌ای ارسال نمی‌کند.' }[modal])}</p><button className="cta" onClick={() => setModal(undefined)}>متوجه شدم</button>
    </Dialog>}
  </>;
}
