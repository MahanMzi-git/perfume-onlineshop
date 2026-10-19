import { useState } from 'react';
import { Search, User, ShoppingBag, Menu } from 'lucide-react';
import { MobileNavigation, type NavLink } from './MobileNavigation';
export const navLinks: NavLink[] = [
  { label: 'خانه', href: '#home' }, { label: 'محصولات', href: '#products' }, { label: 'برندها', href: '#brands' },
  { label: 'خانواده‌های بویایی', href: '#discovery' }, { label: 'عطرهای نیش', href: '#products', niche: true }, { label: 'درباره ما', href: '#about' },
];
interface Props { query: string; onQuery: (q: string) => void; onNiche: () => void }
export function Header({ query, onQuery, onNiche }: Props) {
  const [menu, setMenu] = useState(false);
  const [searching, setSearching] = useState(false);
  return (
    <header className="header">
      <div className="bar container">
        <button type="button" className="icon-btn menu-btn" aria-label="باز کردن منو" onClick={() => setMenu(true)}><Menu /></button>
        <a href="#home" className="logo" dir="ltr">Aroma</a>
        <nav aria-label="ناوبری اصلی" className="desktop-nav"><ul>{navLinks.map((l) => (
          <li key={l.href + l.label}><a href={l.href} onClick={l.niche ? onNiche : undefined}>{l.label}</a></li>
        ))}</ul></nav>
        <div className="actions">
          <button type="button" className="icon-btn" aria-label="جستجو" aria-expanded={searching} onClick={() => setSearching(!searching)}><Search /></button>
          <button type="button" className="icon-btn" disabled aria-label="حساب کاربری (به‌زودی)" title="به‌زودی"><User /></button>
          <button type="button" className="icon-btn" disabled aria-label="سبد خرید (به‌زودی)" title="به‌زودی"><ShoppingBag /></button>
        </div>
      </div>
      {searching && (
        <form className="search container" role="search" onSubmit={(e) => { e.preventDefault(); location.hash = '#products'; }}>
          <label htmlFor="q" className="sr">جستجوی عطر، برند یا نت</label>
          <input id="q" type="search" autoFocus value={query} onChange={(e) => onQuery(e.target.value)} placeholder="جستجوی عطر، برند یا نت…" />
        </form>
      )}
      <MobileNavigation links={navLinks} open={menu} onClose={() => setMenu(false)} onNiche={onNiche} />
    </header>
  );
}
