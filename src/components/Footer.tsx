import { navLinks } from './Header';
import { categories } from '../data/categories';
export function Footer({ onCategory }: { onCategory: (id: string) => void }) {
  return (
    <footer className="footer"><div className="container foot-grid">
      <div><p className="logo" dir="ltr">Aroma</p><p>نمونه فروشگاه عطر (نسخه نمایشی). اطلاعات تماس در مراحل بعدی اضافه می‌شود.</p></div>
      <nav aria-label="پیوندهای فوتر"><h2>دسترسی سریع</h2><ul>{navLinks.map((l) => <li key={l.href + l.label}><a href={l.href}>{l.label}</a></li>)}</ul></nav>
      <nav aria-label="دسته‌بندی‌ها"><h2>دسته‌بندی‌ها</h2><ul>{categories.map((c) => (
        <li key={c.id}><a href="#products" onClick={() => onCategory(c.id)}>{c.label}</a></li>))}</ul></nav>
      <div><h2>شبکه‌های اجتماعی</h2><p>به‌زودی</p></div>
    </div></footer>
  );
}
