import { categories } from '../data/categories';
import { ChevronDown } from 'lucide-react';
import { AdaptiveDisclosure } from './AdaptiveDisclosure';
export function Footer({ onInfo }: { onInfo: (id: string) => void }) {
  const title = (text: string) => <><span>{text}</span><ChevronDown size={17} aria-hidden="true" /></>;
  return <footer className="footer">
    <div className="container footer-intro">
      <div className="footer-brand"><p className="logo" dir="ltr">AROMA<span>THE FRAGRANCE EDIT</span></p><span className="badge">فروشگاه نمایشی</span></div>
      <p>روایتِ تو، به زبانِ رایحه.<br />فضایی برای شناخت و کشف دنیای عطر.</p>
    </div>
    <div className="container foot-grid">
      <AdaptiveDisclosure className="footer-group" summary={title('دنیای آروما')}>
        <nav aria-label="خرید"><ul><li><a href="#/catalog">همهٔ عطرها</a></li>{categories.filter(c => !c.scrollTo).map(c => <li key={c.id}><a href={'#/collections/' + c.id}>{c.label}</a></li>)}</ul></nav>
      </AdaptiveDisclosure>
      <AdaptiveDisclosure className="footer-group" summary={title('همراه شما')}>
        <nav aria-label="راهنما"><ul><li><a href="#/families">راهنمای رایحه‌ها</a></li><li><a href="#/collections/gifts">ست‌های آشنایی</a></li><li><a href="#/journal">مجلهٔ آروما</a></li><li><a href="#/about">دربارهٔ ما</a></li><li><button onClick={() => onInfo('policies')}>ارسال و مرجوعی</button></li><li><button onClick={() => onInfo('policies')}>حریم خصوصی و شرایط</button></li></ul></nav>
      </AdaptiveDisclosure>
      <AdaptiveDisclosure className="footer-group" summary={title('در ارتباط بمانیم')}>
        <p>اطلاعات تماس و شبکه‌های اجتماعی<br />پس از تأیید فروشگاه اضافه می‌شوند.</p><a className="text-link" href="#/contact">ارتباط با ما ↖</a>
      </AdaptiveDisclosure>
    </div>
    <div className="container footer-bottom"><span>آروما · پیش‌نمایش رابط فروشگاه؛ خرید فعال نیست.</span><span dir="ltr">A LITTLE SCENT. A LASTING MEMORY.</span></div>
  </footer>;
}
