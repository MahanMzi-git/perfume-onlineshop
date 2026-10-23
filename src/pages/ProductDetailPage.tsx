import { useEffect, useState } from 'react';
import { Heart, Flower2, Sun, Leaf, Snowflake, Coffee, BriefcaseBusiness, Moon, Sparkles } from 'lucide-react';
import { products } from '../data/products';
import { isCardStudy } from '../data/cardStudyImages';
import { brands } from '../data/brands';
import { fragranceFamilies } from '../data/fragranceFamilies';
import { noteById } from '../data/scentNotes';
import { occasionLabels, seasonLabels, sweetnessLabels, temperatureLabels } from '../data/catalogLabels';
import { DemoImage } from '../components/DemoImage';
import { ScentNoteIcon } from '../components/ScentNoteIcon';
import { ProductGrid } from '../components/ProductGrid';
import { LuxurySelect } from '../components/LuxurySelect';
import { useStore } from '../components/StoreContext';
import { priceText, demoRating } from '../lib/catalog';
import { loadProductIds, saveProductIds } from '../lib/storage';
import type { Product } from '../types/product';

const validIds = new Set(products.map(p => p.id));
export function ProductDetailPage({ product, params }: { product: Product; params: URLSearchParams }) {
  const store = useStore();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [viewed] = useState(() => loadProductIds('aroma-recently-viewed', validIds));
  useEffect(() => {
    saveProductIds('aroma-recently-viewed', [product.id, ...loadProductIds('aroma-recently-viewed', validIds).filter(id => id !== product.id)].slice(0, 6));
  }, [product.id]);
  const requestedVariant = product.variants.find(v => v.id === params.get('variant'));
  const variant = requestedVariant ?? product.variants[0];
  const image = product.gallery[galleryIndex] ?? product.gallery[0];
  const volumes = [...new Set(product.variants.map(v => v.volumeMl))];
  const concentrations = [...new Set(product.variants.map(v => v.concentration))];
  function chooseVariant(id: string) { setFeedback(''); location.hash = '#/product/' + product.slug + '?variant=' + id; }
  const related = products.filter(p => p.id !== product.id && p.fragranceFamilyIds.some(id => product.fragranceFamilyIds.includes(id))).slice(0, 3);
  const recent = viewed.filter(id => id !== product.id).map(id => products.find(p => p.id === id)!).slice(0, 3);
  const brand = brands.find(b => b.id === product.brandId);
  const score = demoRating(product);
  return <section className="step2-page container section">
    <nav className="breadcrumbs" aria-label="مسیر صفحه"><a href="#home">خانه</a><span>/</span><a href="#/catalog">کاتالوگ</a><span>/</span><bdi>{product.name}</bdi></nav>
    <span className="badge">{isCardStudy ? 'عطر واقعی · قیمت، حجم‌های انتخابی و موجودی نمایشی' : 'محصول خیالی · موجودی، قیمت و نظرها نمایشی‌اند'}</span>
    <div className="detail-grid">
      <div className="detail-gallery">
        <div className={'detail-main-image ' + (image.view === 'detail' ? 'image-detail' : '')}><DemoImage src={image.src} alt={image.alt} width={400} height={500} /></div>
        <div className="gallery-thumbnails" role="group" aria-label="تصاویر محصول">{product.gallery.map((item, i) => <button className="step-action" key={item.view} aria-pressed={galleryIndex === i} onClick={() => setGalleryIndex(i)}><DemoImage src={item.src} alt="" width={50} height={60} /><span>{item.view === 'bottle' ? 'نمای بطری' : 'برش نزدیک'}</span></button>)}</div>
        <p className="fine-print">{isCardStudy ? 'عکس مرجع ارسالی برای آزمون طراحی فروشگاه.' : 'تصویرسازی محلی نمایشی؛ نمای دوم برش نزدیک همان تصویر است.'}</p>
      </div>
      <div className="detail-information">
        <p className="eyebrow" dir="ltr">{brand?.name}</p><h1 dir="ltr">{product.name}</h1>
        <p className="detail-description">{product.description}</p>
        {params.has('variant') && !requestedVariant && <p role="status" className="fine-print">نسخهٔ درخواستی پیدا نشد؛ نسخهٔ پایه نمایش داده می‌شود.</p>}
        <div className="variant-selectors">
          <LuxurySelect label="حجم (میلی‌لیتر)" value={String(variant.volumeMl)} options={volumes.map(volume => ({ value: String(volume), label: new Intl.NumberFormat('fa-IR').format(volume) }))} onChange={value => { const volume = Number(value); const next = product.variants.find(v => v.volumeMl === volume && v.concentration === variant.concentration) ?? product.variants.find(v => v.volumeMl === volume)!; chooseVariant(next.id); }} />
          <LuxurySelect label="غلظت" value={variant.concentration} options={concentrations.map(value => ({ value, label: value }))} onChange={value => { const next = product.variants.find(v => v.concentration === value && v.volumeMl === variant.volumeMl) ?? product.variants.find(v => v.concentration === value)!; chooseVariant(next.id); }} />
        </div>
        <p className="fine-print detail-variant-note">فقط ترکیب‌های تعریف‌شده نمایش داده می‌شوند؛ اگر ترکیب فعلی وجود نداشته باشد، نزدیک‌ترین نسخهٔ معتبر انتخاب می‌شود.</p>
        <div className="detail-price" aria-live="polite"><strong>{priceText(variant.price)}</strong>{variant.compareAtPrice && variant.compareAtPrice > variant.price && <><del>{priceText(variant.compareAtPrice)}</del><span className="badge">تخفیف نمایشی</span></>}<p>{variant.stock > 0 ? 'موجودی نمایشی: ' + new Intl.NumberFormat('fa-IR').format(variant.stock) : 'این حجم و غلظت ناموجودِ نمایشی است.'}</p></div>
        <div className="detail-actions">
          <button className="step-action step-primary" disabled={variant.stock === 0} onClick={() => setFeedback(store.addToBag(product, variant))}>افزودن به سبد نمایشی</button>
          <button className="step-action detail-favourite" aria-pressed={store.favourites.includes(product.id)} onClick={() => store.toggleFavourite(product.id)}><Heart aria-hidden="true" size={16} fill={store.favourites.includes(product.id) ? 'currentColor' : 'none'} />علاقه‌مندی</button>
          <button className="step-action" aria-pressed={store.comparisonIds.includes(product.id)} onClick={() => store.toggleComparison(product.id)}>مقایسهٔ این عطر</button>
        </div>
        <p className="local-feedback" role="status">{feedback}</p>
        <dl className="profile-facts"><div><dt>طبع نمایشی</dt><dd>{temperatureLabels[product.temperature]}</dd></div><div><dt>شیرینی نمایشی</dt><dd>{sweetnessLabels[product.sweetness]}</dd></div><div><dt>قیمت هر میلی‌لیتر</dt><dd>{priceText(Math.round(variant.price / variant.volumeMl))}</dd></div></dl>
        <div className="scent-signature" aria-label="خانواده، فصل و موقعیت پیشنهادی">
          <div className="signature-families">{product.fragranceFamilyIds.map(id => { const family = fragranceFamilies.find(f => f.id === id)!; return <a className="signature-family" href={'#/families/' + family.slug} key={id}>{family.id === 'floral' ? <Flower2 size={16} aria-hidden="true" /> : <ScentNoteIcon note={noteById(family.representativeNoteIds[0])!} size={16} decorative />}{family.name}</a>; })}</div>
          <ul className="signature-tags" aria-label="فصل پیشنهادی">{product.seasons.map(season => { const Icon = season === 'spring' ? Flower2 : season === 'summer' ? Sun : season === 'autumn' ? Leaf : Snowflake; return <li className="signature-tag" key={season}><Icon size={15} aria-hidden="true" /><span>{seasonLabels[season]}</span></li>; })}</ul>
          <ul className="signature-tags" aria-label="موقعیت پیشنهادی">{product.occasions.map(occasion => { const Icon = occasion === 'date' ? Heart : occasion === 'work' ? BriefcaseBusiness : occasion === 'daily' ? Coffee : occasion === 'evening' ? Moon : Sparkles; return <li className="signature-tag" key={occasion}><Icon size={15} aria-hidden="true" /><span>{occasionLabels[occasion]}</span></li>; })}</ul>
        </div>
      </div>
    </div>
    <section className="detail-section"><h2>{isCardStudy ? 'نت‌های منتخب' : 'هرم نت‌ها'}</h2><p>{isCardStudy ? 'این نت‌ها از معرفی عطر انتخاب شده‌اند؛ فهرست کامل یا ترتیب تبخیر نیستند.' : 'این تقسیم‌بندی یک راهنمای نمایشی است؛ نت مشترک، رایحهٔ یکسان یا زمان‌بندی ثابت را تضمین نمی‌کند.'}</p><div className="pyramid-grid">{([['top', 'نت‌های آغازین'], ['middle', 'نت‌های میانی'], ['base', 'نت‌های پایه']] as const).filter(([key]) => !isCardStudy || key === 'middle').map(([key, label]) => <div className="pyramid-level" key={key}><h3>{isCardStudy ? 'شناخت رایحه' : label}</h3><ul>{product.notePyramid[key].map(id => { const n = noteById(id)!; return <li key={id}><a href={'#/notes/' + n.slug}><ScentNoteIcon note={n} decorative size={20} />{n.name}</a></li>; })}</ul></div>)}</div></section>
    <section className="detail-section"><h2>نظرها و امتیازهای نمونه · کاملاً نمایشی</h2><p>این متن‌ها و امتیازها متعلق به خریداران واقعی نیستند و صرفاً نمونهٔ رابط‌اند.</p>{score !== undefined ? <><p className="demo-rating">میانگین نمونه: {new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(score)} از ۵</p><div className="review-grid">{product.reviews.map((review, i) => <article className="demo-review" key={review.id}><h3>نمونهٔ طراحی {new Intl.NumberFormat('fa-IR').format(i + 1)}</h3><span>امتیاز نمایشی: {new Intl.NumberFormat('fa-IR').format(review.score)} از ۵</span><p>{review.text}</p></article>)}</div></> : <p className="empty">برای این محصول حتی نظر نمونه هم تعریف نشده است.</p>}</section>
    <div className="detail-policies"><details><summary>اطلاعات ارسال</summary><p>هزینه، روش و زمان ارسال هنوز توسط مالک فروشگاه تأیید نشده است؛ سفارش واقعی ثبت نمی‌شود.</p></details><details><summary>مرجوعی و شرایط</summary><p>قوانین فروش و مرجوعی پیش از راه‌اندازی خرید واقعی تکمیل می‌شوند. این صفحه یک پیش‌نمایش است.</p></details></div>
    {related.length > 0 && <section className="related-section"><h2>عطرهای هم‌خانواده · نمایشی</h2><ProductGrid list={related} /></section>}
    {recent.length > 0 && <section className="related-section"><h2>آخرین بازدیدهای شما در این مرورگر</h2><ProductGrid list={recent} /></section>}
  </section>;
}
