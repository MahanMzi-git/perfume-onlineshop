import { ArrowUpLeft } from 'lucide-react';
import { categories } from '../data/categories';

export function Footer({ onInfo }: { onInfo: (id: string) => void }) {
  return (
    <footer className="footer aroma-footer">
      <div className="container aroma-footer-inner">
        <div className="aroma-footer-identity">
          <a className="aroma-footer-wordmark" href="#home" aria-label="آروما، خانه" dir="ltr">
            AROMA
          </a>
          <p>روایتِ تو، به زبانِ رایحه.</p>
          <a className="aroma-footer-contact" href="#/contact">
            ارتباط با ما <ArrowUpLeft size={16} aria-hidden="true" />
          </a>
        </div>

        <nav className="aroma-footer-nav" aria-label="فروشگاه و راهنما">
          <div>
            <h2>کشف عطرها</h2>
            <ul>
              <li><a href="#/catalog">همهٔ عطرها</a></li>
              {categories.filter(category => !category.scrollTo).map(category => (
                <li key={category.id}>
                  <a href={'#/collections/' + category.id}>{category.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>راهنما و پشتیبانی</h2>
            <ul>
              <li><a href="#/families">راهنمای رایحه‌ها</a></li>
              <li><a href="#/journal">مجلهٔ آروما</a></li>
              <li><a href="#/about">دربارهٔ ما</a></li>
              <li><button type="button" onClick={() => onInfo('shipping')}>ارسال و مرجوعی</button></li>
              <li><button type="button" onClick={() => onInfo('policies')}>حریم خصوصی و شرایط</button></li>
            </ul>
          </div>
        </nav>

        <p className="aroma-footer-status">پیش‌نمایش فروشگاه آروما · خرید فعال نیست.</p>
      </div>
    </footer>
  );
}
