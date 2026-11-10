import { products } from '../data/products';
import { brands } from '../data/brands';
import { fragranceFamilies } from '../data/fragranceFamilies';
import { noteById } from '../data/scentNotes';
import { audienceLabels, occasionLabels, sweetnessLabels, temperatureLabels } from '../data/catalogLabels';
import { DemoImage } from '../components/DemoImage';
import { Dialog } from '../components/SharedUI';
import { useStore } from '../components/StoreContext';
import { demoRating, priceText, numberText } from '../lib/catalog';
import { comparisonHref } from '../lib/routes';
import type { Product } from '../types/product';
import { isCardStudy } from '../data/cardStudyImages';
import { useVariantCodes, VariantCode } from '../components/VariantCode';
import { useState, type ReactNode } from 'react';
import { ArrowLeftRight, Plus } from 'lucide-react';

const comparisonSections = [
  { id: 'purchase', label: 'خرید' },
  { id: 'scent', label: 'رایحه' },
  { id: 'versions', label: 'نسخه‌ها' },
] as const;
type ComparisonSection = (typeof comparisonSections)[number]['id'];

export function ComparisonPage({ ids }: { ids: string[] }) {
  const store = useStore();
  const codes = useVariantCodes();
  const [section, setSection] = useState<ComparisonSection>('purchase');
  const [picking, setPicking] = useState<Product | 'add'>();
  const selected = ids.map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p);
  const replacing = picking === 'add' ? undefined : picking;
  function pickProduct(product: Product) {
    setPicking(undefined);
    if (replacing) location.hash = comparisonHref(ids.map(id => id === replacing.id ? product.id : id));
    else store.toggleComparison(product.id);
  }
  const rows: { section: ComparisonSection; title: string; value: (product: Product) => ReactNode }[] = [
    { section: 'purchase', title: 'قیمت نسخهٔ پایه (نمایشی)', value: p => priceText(p.variants[0].price) },
    { section: 'purchase', title: 'حجم پایه', value: p => numberText(p.variants[0].volumeMl) + ' میلی‌لیتر' },
    { section: 'purchase', title: 'غلظت پایه', value: p => p.variants[0].concentration },
    { section: 'versions', title: 'کد نسخهٔ پایه', value: p => <VariantCode code={codes.get(p.variants[0].id)} /> },
    { section: 'versions', title: 'نسخه‌های دیگر', value: p => p.variants.length > 1 ? p.variants.slice(1).map(v => <div key={v.id}>{numberText(v.volumeMl)} میلی‌لیتر · {v.concentration} · <VariantCode code={codes.get(v.id)} /> · {priceText(v.price)}</div>) : 'تعریف نشده' },
    { section: 'purchase', title: 'موجودی نسخهٔ پایه (نمایشی)', value: p => p.variants[0].stock > 0 ? 'موجود' : 'ناموجود' },
    { section: 'scent', title: 'مخاطب', value: p => audienceLabels[p.targetAudience] },
    { section: 'scent', title: 'طبع / شیرینی', value: p => temperatureLabels[p.temperature] + ' / ' + sweetnessLabels[p.sweetness] },
    ...(isCardStudy ? [{ section: 'scent' as const, title:'نت‌های منتخب', value:(p:Product)=>p.scentNoteIds.map(id=>noteById(id)?.name).join('، ') }] : [
      { section: 'scent' as const, title:'نت‌های آغازین', value:(p:Product)=>p.notePyramid.top.map(id=>noteById(id)?.name).join('، ') || 'تعریف نشده' },
      { section: 'scent' as const, title:'نت‌های میانی', value:(p:Product)=>p.notePyramid.middle.map(id=>noteById(id)?.name).join('، ') || 'تعریف نشده' },
      { section: 'scent' as const, title:'نت‌های پایه', value:(p:Product)=>p.notePyramid.base.map(id=>noteById(id)?.name).join('، ') || 'تعریف نشده' },
    ]),
    { section: 'scent', title: 'خانواده‌های بویایی', value: p => p.fragranceFamilyIds.map(id => fragranceFamilies.find(f => f.id === id)?.name).join('، ') },
    { section: 'scent', title: 'موقعیت پیشنهادی', value: p => p.occasions.map(id => occasionLabels[id]).join('، ') },
    { section: 'purchase', title: 'امتیاز نمونه (نظر واقعی نیست)', value: p => demoRating(p) === undefined ? 'تعریف نشده' : new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(demoRating(p)!) + ' از ۵' },
  ];
  const picker = <fieldset className="compare-picker"><legend>انتخاب عطرها (حداکثر سه مورد)</legend><div>{products.map(product => <label key={product.id}><input type="checkbox" checked={ids.includes(product.id)} disabled={!ids.includes(product.id) && ids.length >= 3} onChange={() => store.toggleComparison(product.id)} /><bdi>{product.name}</bdi></label>)}</div></fieldset>;
  const replaceButton = (product: Product) => <button type="button" className="compare-slot-action"
    aria-label={'تعویض ' + product.name} aria-haspopup="dialog" onClick={() => setPicking(product)}>
    <ArrowLeftRight size={14} aria-hidden="true" />تعویض
  </button>;
  const addSlot = selected.length === 2 && <button className="compare-add-slot" type="button"
    aria-haspopup="dialog" onClick={() => setPicking('add')}>
    <Plus size={16} aria-hidden="true" /> افزودن عطر سوم
  </button>;
  return <section className="step2-page container section compare-page">
    <nav className="breadcrumbs" aria-label="مسیر صفحه"><a href="#home">خانه</a><span>/</span><a href="#/catalog">کاتالوگ</a><span>/</span><span>مقایسه</span></nav>
    <p className="eyebrow">SIDE BY SIDE</p><h1>کنار هم، روشن‌تر انتخاب کن.</h1>
    <p className="page-intro">دو یا سه عطر را بر اساس نسخهٔ پایه مقایسه کنید. اطلاعات خرید و امتیازها نمایشی‌اند.</p>
    {selected.length < 2 && picker}
    {selected.length < 2 ? <div className="empty"><h2>برای مقایسه، دست‌کم دو عطر انتخاب کنید.</h2><p>انتخاب‌های فعلی شما حفظ می‌شوند.</p><a className="text-link" href="#/catalog">ادامهٔ انتخاب در کاتالوگ ↖</a></div> : <>
      <div className="compare-layout" data-count={selected.length}>
        <div className="compare-columns compare-products">
          {selected.map((product, slot) => <div key={slot}>
            <bdi>{brands.find(brand => brand.id === product.brandId)?.name}</bdi>
            <a href={'#/product/' + product.slug} dir="ltr">{product.name}</a>
            {replaceButton(product)}
          </div>)}
        </div>
        {addSlot}
        <div className="compare-sections" role="group" aria-label="بخش مقایسه">
          {comparisonSections.map(item => <button key={item.id} type="button" aria-pressed={section === item.id}
            aria-controls="compare-values" onClick={() => setSection(item.id)}>{item.label}</button>)}
        </div>
        <div id="compare-values" data-section={section}>
          {rows.filter(row => row.section === section).map(row => <section className="compare-feature" key={row.title}>
            <h2>{row.title}</h2>
            <div className="compare-columns">
              {selected.map(product => <div key={product.id}><span className="sr">{product.name}: </span>{row.value(product)}</div>)}
            </div>
          </section>)}
        </div>
      </div>
      {picking && <Dialog title={replacing ? 'تعویض عطر' : 'افزودن عطر سوم'} className="compare-picker-sheet" onClose={() => setPicking(undefined)}>
        {replacing && <div className="compare-picker-current">
          <span>انتخاب فعلی <bdi>{replacing.name}</bdi></span>
          <button type="button" className="text-link" onClick={() => { setPicking(undefined); store.toggleComparison(replacing.id); }}>حذف از مقایسه</button>
        </div>}
        <ul className="compare-picker-options">
          {products.filter(product => !ids.includes(product.id)).map(product => <li key={product.id}>
            <button type="button" onClick={() => pickProduct(product)}>
              <DemoImage src={product.image} alt="" width={44} height={48} />
              <span><bdi>{product.name}</bdi><small><bdi>{brands.find(brand => brand.id === product.brandId)?.name}</bdi></small></span>
              {replacing ? <ArrowLeftRight size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            </button>
          </li>)}
        </ul>
      </Dialog>}
    </>}
  </section>;
}
