import { products } from '../data/products';
import { brands } from '../data/brands';
import { fragranceFamilies } from '../data/fragranceFamilies';
import { noteById } from '../data/scentNotes';
import { audienceLabels, occasionLabels, sweetnessLabels, temperatureLabels } from '../data/catalogLabels';
import { DemoImage } from '../components/DemoImage';
import { useStore } from '../components/StoreContext';
import { demoRating, priceText, numberText } from '../lib/catalog';
import type { Product } from '../types/product';

export function ComparisonPage({ ids }: { ids: string[] }) {
  const store = useStore();
  const selected = ids.map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p);
  const rows: { title: string; value: (product: Product) => string }[] = [
    { title: 'برند', value: p => brands.find(b => b.id === p.brandId)?.name ?? '' },
    { title: 'قیمت نسخهٔ پایه (نمایشی)', value: p => priceText(p.variants[0].price) },
    { title: 'حجم پایه', value: p => numberText(p.variants[0].volumeMl) + ' میلی‌لیتر' },
    { title: 'غلظت پایه', value: p => p.variants[0].concentration },
    { title: 'نسخه‌های دیگر', value: p => p.variants.slice(1).map(v => numberText(v.volumeMl) + ' میلی‌لیتر ' + v.concentration + ': ' + priceText(v.price)).join(' / ') || 'تعریف نشده' },
    { title: 'موجودی نسخهٔ پایه (نمایشی)', value: p => p.variants[0].stock > 0 ? 'موجود' : 'ناموجود' },
    { title: 'مخاطب', value: p => audienceLabels[p.targetAudience] },
    { title: 'طبع / شیرینی', value: p => temperatureLabels[p.temperature] + ' / ' + sweetnessLabels[p.sweetness] },
    { title: 'نت‌های آغازین', value: p => p.notePyramid.top.map(id => noteById(id)?.name).join('، ') },
    { title: 'نت‌های میانی', value: p => p.notePyramid.middle.map(id => noteById(id)?.name).join('، ') },
    { title: 'نت‌های پایه', value: p => p.notePyramid.base.map(id => noteById(id)?.name).join('، ') },
    { title: 'خانواده‌های بویایی', value: p => p.fragranceFamilyIds.map(id => fragranceFamilies.find(f => f.id === id)?.name).join('، ') },
    { title: 'موقعیت پیشنهادی', value: p => p.occasions.map(id => occasionLabels[id]).join('، ') },
    { title: 'امتیاز نمونه (نظر واقعی نیست)', value: p => demoRating(p) === undefined ? 'تعریف نشده' : new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(demoRating(p)!) + ' از ۵' },
  ];
  return <section className="step2-page container section">
    <nav className="breadcrumbs" aria-label="مسیر صفحه"><a href="#home">خانه</a><span>/</span><a href="#/catalog">کاتالوگ</a><span>/</span><span>مقایسه</span></nav>
    <p className="eyebrow">SIDE BY SIDE</p><h1>کنار هم، روشن‌تر انتخاب کن.</h1>
    <p className="page-intro">دو یا سه محصول را مقایسه کنید. جدول بر اساس نسخهٔ پایهٔ هر محصول است؛ همهٔ اطلاعات تجاری و امتیازها نمایشی‌اند.</p>
    <fieldset className="compare-picker"><legend>انتخاب عطرها (حداکثر سه مورد)</legend><div>{products.map(product => <label key={product.id}><input type="checkbox" checked={ids.includes(product.id)} disabled={!ids.includes(product.id) && ids.length >= 3} onChange={() => store.toggleComparison(product.id)} /><bdi>{product.name}</bdi></label>)}</div></fieldset>
    {selected.length < 2 ? <div className="empty"><h2>برای مقایسه، دست‌کم دو عطر انتخاب کنید.</h2><p>انتخاب‌های فعلی شما حفظ می‌شوند.</p><a className="text-link" href="#/catalog">ادامهٔ انتخاب در کاتالوگ ↖</a></div> : <>
      <p id="compare-scroll-hint" className="fine-print">در موبایل جدول را افقی جابه‌جا کنید؛ با کیبورد هم می‌توانید روی جدول فوکوس کنید.</p>
      <div className="compare-table-scroll" role="region" aria-label="جدول مقایسه عطرها" aria-describedby="compare-scroll-hint" tabIndex={0}>
        <table className="compare-table"><caption>مقایسهٔ مشخصات نمایشی عطرها</caption><thead><tr><th scope="col">ویژگی</th>{selected.map(product => <th scope="col" key={product.id}><DemoImage src={product.image} alt="" width={90} height={110} loading="lazy" /><a dir="ltr" href={'#/product/' + product.slug}>{product.name}</a><button className="text-link" aria-label={'حذف از مقایسه: ' + product.name} onClick={() => store.toggleComparison(product.id)}>حذف</button></th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.title}><th scope="row">{row.title}</th>{selected.map(product => <td key={product.id}>{row.value(product)}</td>)}</tr>)}</tbody></table>
      </div>
    </>}
  </section>;
}
