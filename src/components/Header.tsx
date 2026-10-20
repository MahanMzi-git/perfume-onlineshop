import { useLayoutEffect, useRef, useState } from 'react';
import { Search, User, ShoppingBag, Menu, Heart, X } from 'lucide-react';
import { MobileNavigation, type NavLink } from './MobileNavigation';

export const navLinks: NavLink[] = [
  { label: 'همهٔ عطرها', href: '#products' },
  { label: 'زنانه', href: '#products', category: 'women' },
  { label: 'مردانه', href: '#products', category: 'men' },
  { label: 'یونیسکس', href: '#products', category: 'unisex' },
  { label: 'برندها', href: '#brands' },
  { label: 'دنیای رایحه‌ها', href: '#discovery' },
  { label: 'عطرهای نیش', href: '#products', category: 'niche' },
  { label: 'هدیه و ست‌ها', href: '#gifts' },
];

interface Props {
  catalogMode?: boolean;
  query: string;
  onQuery: (q: string) => void;
  onCategory: (id: string) => void;
  onAction: (action: string) => void;
  onSearch: () => void;
  activeCat?: string;
  favouriteCount: number;
}

export function Header({ catalogMode = false, query, onQuery, onCategory, onAction, onSearch, activeCat, favouriteCount }: Props) {
  const [menu, setMenu] = useState(false);
  const [searching, setSearching] = useState(false);
  const header = useRef<HTMLElement>(null);
  const searchToggle = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (!header.current) return;
    const observer = new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty('--header-height', entry.target.getBoundingClientRect().height + 'px');
    });
    observer.observe(header.current);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--header-height');
    };
  }, []);

  function closeSearch() {
    setSearching(false);
    searchToggle.current?.focus();
  }

  return <header ref={header} className="header">
    <div className="bar container">
      <button className="icon-btn menu-btn" aria-label="باز کردن منو" aria-expanded={menu} aria-controls={menu ? 'mobile-menu' : undefined} onClick={() => setMenu(true)}><Menu aria-hidden="true" /></button>
      <a href="#home" className="logo" dir="ltr" aria-label="آروما، خانه">AROMA<span>THE FRAGRANCE EDIT</span></a>
      <p className="header-tagline">روایتِ تو، به زبانِ رایحه</p>
      <div className="actions">
        <button ref={searchToggle} className="icon-btn" aria-label={searching ? 'بستن جستجو' : 'جستجو'} aria-expanded={searching} aria-controls={searching ? 'site-search' : undefined} onClick={() => searching ? closeSearch() : setSearching(true)}>
          {searching ? <X aria-hidden="true" /> : <Search aria-hidden="true" />}
        </button>
        <button className="icon-btn" aria-label="حساب کاربری" onClick={() => onAction('account')}><User aria-hidden="true" /></button>
        <button className="icon-btn wishlist-action" aria-label={`علاقه‌مندی‌ها، ${new Intl.NumberFormat('fa-IR').format(favouriteCount)} عطر`} onClick={() => onAction('wishlist')}>
          <Heart aria-hidden="true" /><span className="wishlist-count" aria-hidden="true">{new Intl.NumberFormat('fa-IR').format(favouriteCount)}</span>
        </button>
        <button className="icon-btn" aria-label="سبد خرید" onClick={() => onAction('cart')}><ShoppingBag aria-hidden="true" /></button>
      </div>
    </div>
    <nav className="desktop-nav container" aria-label="ناوبری اصلی">
      <ul>{navLinks.map(link => <li key={link.label}>
        <a href={link.href} aria-current={link.category && link.category === activeCat ? 'true' : undefined} onClick={event => {
          if (link.category || link.label === 'همهٔ عطرها') {
            event.preventDefault();
            onCategory(link.category ?? 'all');
          }
        }}>{link.label}</a>
      </li>)}</ul>
      <a href="#journal">مجلهٔ آروما <span aria-hidden="true">↖</span></a>
    </nav>
    {searching && <form id="site-search" className="search container" role="search" onKeyDown={event => { if (event.key === 'Escape') closeSearch(); }} onSubmit={event => { event.preventDefault(); onSearch(); }}>
      <label htmlFor="q">جستجوی عطر، برند یا نت</label>
      <div className="search-row">
        <input id="q" type="search" autoFocus maxLength={120} value={query} onChange={event => onQuery(event.target.value)} placeholder="مثلاً رز، Santal یا Maison…" />
        <button className="cta" type="submit">جستجو</button>
      </div>
      <p className="search-help">{catalogMode ? 'برای دیدن نتیجه‌ها در کاتالوگ، «جستجو» را بزنید.' : 'نتیجه‌ها هم‌زمان به‌روز می‌شوند؛ برای رفتن به آن‌ها «جستجو» را بزنید.'}</p>
    </form>}
    <MobileNavigation links={navLinks} open={menu} onClose={() => setMenu(false)} onCategory={onCategory} activeCat={activeCat} catalogMode={catalogMode} />
  </header>;
}
