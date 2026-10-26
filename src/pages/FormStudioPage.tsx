import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { CustomerForm } from '../components/CustomerForm';
import { contactFields, type CustomerField } from '../lib/customerForms';
const styles = [
  { id: 'curve', name: '۱. کرم با قوس نرم', description: 'زمینهٔ کرمی، گوشه‌های نرم و هالهٔ طلایی هنگام انتخاب؛ پیشنهاد من برای آروما.' },
  { id: 'capsule-sage', name: '۲. کپسولی مریم‌گلی · انتخاب شما', description: 'فرم کپسولی با زمینهٔ مریم‌گلی، تأکید سبز هنگام انتخاب و سایهٔ بسیار ملایم.' },
  { id: 'sage', name: '۳. مریم‌گلی', description: 'سطح روشن، گوشه‌های جمع‌وجور و تأکید سبز هنگام انتخاب.' },
];
const fields: CustomerField[] = [...contactFields, { name: 'message', label: 'یادداشت (اختیاری)', kind: 'textarea', optional: true }];
function FormSample({ design }: { design: typeof styles[number] }) {
  const [valid, setValid] = useState(false);
  return <article className="form-study-card" data-field-style={design.id}>
    <span className="eyebrow">AROMA / FORM STUDY</span><h2>{design.name}</h2><p>{design.description}</p>
    <CustomerForm fields={fields} submit="تست اعتبارسنجی" onSave={() => setValid(true)} />
    <p className="form-study-status" role="status">{valid ? 'اطلاعات آزمایشی معتبر است؛ چیزی ذخیره یا ارسال نشد.' : ''}</p>
    <label htmlFor={'disabled-' + design.id}>نمونهٔ غیرفعال<input id={'disabled-' + design.id} placeholder="فعلاً در دسترس نیست" disabled /></label>
  </article>;
}
export function FormStudioPage() {
  return <section className="section container step2-page shopping-page form-studio"><p className="eyebrow">DESIGNED FOR YOUR TOUCH</p><h1>سه حس متفاوت برای فرم‌های آروما</h1><p className="page-intro">روی ورودی‌ها کلیک کنید، تایپ کنید و دکمهٔ تست را با فیلد خالی بزنید تا حالت خطا را ببینید. مدل کپسولی مریم‌گلی روی ورودی‌های سایت اعمال شده؛ دو مدل دیگر برای مقایسه باقی مانده‌اند.</p><div className="form-study-grid">{styles.map(design => <FormSample key={design.id} design={design} />)}</div><p className="customer-notice"><Sparkles size={16} aria-hidden="true" /> مدل کپسولی مریم‌گلی انتخاب شده است. ورودی‌های سایت از همین طراحی مشترک استفاده می‌کنند. سرچ‌بار و کنترل تعداد، طراحی اختصاصی خود را دارند.</p><a className="text-link" href="#/checkout">بازگشت به مراحل خرید</a></section>;
}
