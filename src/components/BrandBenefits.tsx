import { Info, Truck, MessageCircle } from 'lucide-react';
const items = [
  { icon: Info, t: 'اطلاعات محصول', d: 'نت‌ها و خانواده بویایی هر عطر به‌صورت خلاصه نمایش داده می‌شود.' },
  { icon: Truck, t: 'اطلاعات ارسال', d: 'جزئیات ارسال در مراحل بعدی توسعه تکمیل خواهد شد.' },
  { icon: MessageCircle, t: 'پشتیبانی مشتری', d: 'راه‌های ارتباطی در مراحل بعدی توسعه اضافه می‌شود.' },
];
export function BrandBenefits() {
  return (
    <section id="about" className="benefits-section">
      <div className="container benefits">{items.map(({ icon: I, t, d }) => (
        <div key={t}><I aria-hidden="true" /><h3>{t}</h3><p>{d}</p></div>
      ))}</div>
    </section>
  );
}
