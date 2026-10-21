import { FragranceOrbit } from './FragranceOrbit';
import { ArrowUpLeft } from 'lucide-react';
export function HeroSection() {
  return <section id="home" className="hero orbit-hero"><FragranceOrbit /><div className="container hero-grid">
    <div className="hero-copy"><p className="eyebrow">THE ART OF FINDING YOUR SCENT</p><h1>رایحه‌ای که<br />{' '}شبیه <em>خودِ توست.</em></h1>
      <p>رایحه‌ای را کشف کن که امضای تو باشد.</p>
      <div className="hero-actions"><a className="cta" href="#products">کشف عطرها <ArrowUpLeft size={18} /></a><a className="quiet-link" href="#discovery">از کدام رایحه شروع کنم؟</a></div>
      <div className="hero-caption"><span /> انتخاب با شناخت، تجربه با حوصله</div>
    </div><figure className="hero-art"><img src="/images/hero-editorial.svg" alt="تصویرسازی نمایشی بطری عطر آروما با شاخه‌های گیاهی و زمینهٔ کرم" width={720} height={650} loading="eager" /><figcaption>AROMA ATELIER <span>تصویرسازی نمایشی · ۰۱</span></figcaption></figure>
  </div></section>;
}
