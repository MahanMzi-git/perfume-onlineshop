import { useState } from 'react';
import { ArrowUpLeft, BookOpen, FlaskConical, Heart, MessageCircle, Mail, MapPin } from 'lucide-react';
import { brands } from '../data/brands';
import { products } from '../data/products';
import { articles } from '../data/homepage';
import { CustomerForm } from '../components/CustomerForm';
import { contactFields } from '../lib/customerForms';
import { numberText } from '../lib/catalog';

export function InformationPage({ page }: { page: 'brands' | 'about' | 'contact' | 'journal' }) {
  const [saved, setSaved] = useState(false);
  const title = { brands: 'برندها؛ هر نام، یک جهان', about: 'دربارهٔ آروما', contact: 'ارتباط با آروما', journal: 'مجلهٔ آروما' }[page];
  return <section className="section container step2-page information-page">
    <nav className="breadcrumbs" aria-label="مسیر صفحه"><a href="#home">خانه</a><span>/</span><span>{title}</span></nav>
    <p className="eyebrow">THE FRAGRANCE EDIT</p><h1>{title}</h1>
    {page === 'brands' && <><p className="page-intro">عطرها را از دریچهٔ برند محبوبتان کشف کنید.</p><div className="brand-directory">{brands.map(brand => <a className="information-card brand-directory-link" href={'#/brands/' + brand.id} key={brand.id}><span dir="ltr">{brand.name}</span><small>{numberText(products.filter(product => product.brandId === brand.id).length)} عطر در این مجموعه</small><ArrowUpLeft aria-hidden="true" size={20} /></a>)}</div></>}
    {page === 'about' && <><p className="information-lead">رایحه‌ای که شبیه خود توست.</p><p className="page-intro">آروما فضایی برای کشف عطر، شناخت نت‌ها و پیدا کردن انتخابی متناسب با سلیقهٔ شماست.</p><div className="information-grid">{[{ icon: FlaskConical, title: 'شناخت، پیش از انتخاب', text: 'با خانواده‌های بویایی و نت‌های هر عطر آشنا شوید و انتخاب‌هایتان را کنار هم مقایسه کنید.' }, { icon: Heart, title: 'مجموعه‌ای به سلیقهٔ شما', text: 'عطرهای مورد علاقه را نگه دارید و تجربه‌های خود را در کمد شخصی رایحه‌ها مرور کنید.' }, { icon: BookOpen, title: 'فرصتی برای کشف', text: 'از راهنمای رایحه‌ها تا مجلهٔ آروما؛ با هر انتخاب، کمی بیشتر سلیقهٔ خود را بشناسید.' }].map(({ icon: Icon, title, text }) => <article className="information-card" key={title}><Icon aria-hidden="true" /><h2>{title}</h2><p>{text}</p></article>)}</div><p className="customer-notice">فروشگاه در مرحلهٔ طراحی است. خرید، پرداخت و خدمات ارسال این نسخه نمایشی‌اند.</p><a className="step-action step-primary" href="#/catalog">کشف عطرها <ArrowUpLeft aria-hidden="true" size={18} /></a></>}
    {page === 'journal' && <><p className="page-intro">یادداشت‌های کوتاه برای شناخت بهتر دنیای رایحه.</p><div className="information-grid">{articles.map(article => <article className="information-card" key={article.title}><BookOpen aria-hidden="true" /><p className="eyebrow">{article.category}</p><h2>{article.title}</h2><p>{article.text}</p></article>)}</div><a className="text-link" href="#/families">به کتابخانهٔ رایحه بروید <ArrowUpLeft aria-hidden="true" size={18} /></a></>}
    {page === 'contact' && <><p className="page-intro">برای پرسش‌ها و پیشنهادهای شما، اینجا فضایی در نظر گرفته‌ایم.</p><div className="contact-layout"><div className="information-card"><MessageCircle aria-hidden="true" /><h2>پیامی برای آروما</h2><p id="contact-demo">این فرم برای تست طراحی است؛ پیام ارسال نمی‌شود. فقط از اطلاعات آزمایشی استفاده کنید.</p><CustomerForm fields={[...contactFields.map(field => ({ ...field, label: field.name === 'name' ? 'نام و نام خانوادگی' : field.label })), { name: 'subject', label: 'موضوع', min: 3 }, { name: 'message', label: 'پیام شما', kind: 'textarea', min: 10 }]} submit="بررسی پیام آزمایشی" onSave={() => setSaved(true)} /><p role="status">{saved ? 'فرم معتبر است؛ هیچ پیامی ارسال یا ذخیره نشده است.' : ''}</p></div><aside className="information-card"><Mail aria-hidden="true" /><h2>راه‌های ارتباطی</h2><p>ایمیل و شمارهٔ تماس فروشگاه پس از تأیید اضافه می‌شود.</p><MapPin aria-hidden="true" /><h2>نشانی فروشگاه</h2><p>نشانی و ساعت پاسخ‌گویی هنوز اعلام نشده است.</p><a className="text-link" href="#/account/support">پیش‌نویس‌های پشتیبانی <ArrowUpLeft aria-hidden="true" size={16} /></a></aside></div></>}
  </section>;
}
