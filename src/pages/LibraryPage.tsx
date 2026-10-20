import { fragranceFamilies } from '../data/fragranceFamilies';
import { scentNotes, noteById } from '../data/scentNotes';
import { products } from '../data/products';
import { ScentNoteIcon } from '../components/ScentNoteIcon';
import { ProductGrid } from '../components/ProductGrid';
import { catalogHref } from '../lib/routes';

interface Props { mode: 'families' | 'family' | 'notes' | 'note'; slug?: string }
export function LibraryPage({ mode, slug }: Props) {
  const isNotes = mode === 'notes' || mode === 'note';
  const family = mode === 'family' ? fragranceFamilies.find(f => f.slug === slug) : undefined;
  const note = mode === 'note' ? scentNotes.find(n => n.slug === slug) : undefined;
  if ((mode === 'family' && !family) || (mode === 'note' && !note)) return <LibraryNotFound />;
  const title = family?.name ?? note?.name ?? (isNotes ? 'واژه‌نامهٔ نت‌های بویایی' : 'کتابخانهٔ خانواده‌های رایحه');
  const matches = family ? products.filter(p => p.fragranceFamilyIds.includes(family.id)) : note ? products.filter(p => p.scentNoteIds.includes(note.id)) : [];
  return <section className="step2-page container section">
    <nav className="breadcrumbs" aria-label="مسیر صفحه"><a href="#home">خانه</a><span>/</span><a href={isNotes ? '#/notes' : '#/families'}>{isNotes ? 'نت‌ها' : 'خانواده‌ها'}</a>{(family || note) && <><span>/</span><span>{title}</span></>}</nav>
    <p className="eyebrow">THE SCENT LIBRARY</p><h1>{title}</h1>
    <p className="page-intro">دسته‌بندی‌ها هم‌پوشانی دارند؛ یک عطر می‌تواند در چند خانواده قرار بگیرد. داشتن نت مشترک، به معنی بوی یکسان نیست. مشخصات محصولات این کتابخانه نمایشی‌اند.</p>
    {family ? <>
      <div className="library-feature"><ScentNoteIcon note={noteById(family.representativeNoteIds[0])!} size={64} decorative /><div><h2>{family.name}</h2><p>{family.description}</p><p className="fine-print">زیرخانواده‌های رایج: {family.subfamilies.join('، ')}</p></div></div>
      <h2 className="small-heading">نت‌های نماینده</h2><div className="chips">{family.representativeNoteIds.map(id => { const n = noteById(id)!; return <a className="chip" key={id} href={'#/notes/' + n.slug}>{n.name}</a>; })}</div>
      <a className="text-link" href={catalogHref({ familyId: family.id })}>دیدن محصولات منطبق و فیلترهای بیشتر ↖</a>
    </> : note ? <>
      <div className="library-feature"><ScentNoteIcon note={note} size={64} decorative /><div><h2>{note.name}</h2><p>{note.description ?? 'این نت یک برداشت بویایی است؛ نقش و شدت آن بسته به فرمول عطر تغییر می‌کند.'}</p><p className="fine-print">وجود نام یک نت، تضمین‌کنندهٔ مادهٔ طبیعی، شدت مشخص یا رفتار یکسان روی پوست نیست.</p></div></div>
      <a className="text-link" href={catalogHref({ noteIds: [note.id] })}>دیدن همهٔ عطرهای دارای {note.name} ↖</a>
    </> : <div className="library-grid">{isNotes ? scentNotes.map(n => <a className="library-card" key={n.id} href={'#/notes/' + n.slug}><ScentNoteIcon note={n} size={42} decorative /><h2>{n.name}</h2><p>{products.filter(p => p.scentNoteIds.includes(n.id)).length} محصول نمایشی مرتبط</p><span>شناخت نت ↖</span></a>) : fragranceFamilies.map(f => <a className="library-card" key={f.id} href={'#/families/' + f.slug}><ScentNoteIcon note={noteById(f.representativeNoteIds[0])!} size={48} decorative /><h2>{f.name}</h2><p>{f.description}</p><span>{f.subfamilies.join(' · ')} ↖</span></a>)}</div>}
    {(family || note) && <section className="related-section"><h2>عطرهای مرتبط · نمایشی</h2>{matches.length ? <ProductGrid list={matches} /> : <div className="empty"><p>در مجموعهٔ فعلی محصولی با این ویژگی نداریم.</p><a className="text-link" href="#/catalog">بازگشت به کاتالوگ ↖</a></div>}</section>}
    <p className="fine-print library-source">برای مطالعهٔ بیشتر دربارهٔ طبقه‌بندی رایحه: <a href="https://ffonline.fragrancesoftheworld.com/family/details/01" target="_blank" rel="noreferrer">Fragrances of the World</a>. برچسب‌های این فروشگاه مسیر کشف هستند، نه طبقه‌بندی انحصاری یا تأیید رسمی.</p>
  </section>;
}
export function LibraryNotFound() {
  return <section className="step2-page container section empty"><h1>این صفحه پیدا نشد.</h1><p>ممکن است نشانی محصول یا رایحه درست نباشد.</p><a className="cta" href="#/catalog">بازگشت به کاتالوگ</a></section>;
}
