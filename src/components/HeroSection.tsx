export function HeroSection() {
  return (
    <section id="home" className="hero">
      <div className="container hero-grid">
        <div>
          <h1 dir="ltr" lang="en"><span>More Than Just</span> <span>a Scent</span></h1>
          <p>هر رایحه، داستانی برای گفتن دارد.</p>
          <a className="cta" href="#products">مشاهده عطرها</a>
        </div>
        <img src="/images/hero.svg" alt="تصویر نمایشی بطری عطر با رنگ‌های رز و ایوری" width={400} height={500} fetchPriority="high" />
      </div>
    </section>
  );
}
