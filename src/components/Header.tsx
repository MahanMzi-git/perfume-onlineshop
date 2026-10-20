import { useState } from 'react';
import { Search, User, ShoppingBag, Menu, Heart, X } from 'lucide-react';
import { MobileNavigation, type NavLink } from './MobileNavigation';
export const navLinks: NavLink[] = [
  { label: 'همهٔ عطرها', href: '#products' }, { label: 'زنانه', href: '#products', category: 'women' },
  { label: 'مردانه', href: '#products', category: 'men' }, { label: 'یونیسکس', href: '#products', category: 'unisex' },
  { label: 'برندها', href: '#brands' }, { label: 'دنیای رایحه‌ها', href: '#discovery' },
  { label: 'عطرهای نیش', href: '#products', category: 'niche' }, { label: 'هدیه و ست‌ها', href: '#gifts' },
];
interface Props { query: string; onQuery: (q: string) => void; onCategory: (id: string) => void; onAction: (action: string) => void; activeCat?: string }
export function Header({ query, onQuery, onCategory, onAction, activeCat }: Props) {
  const [menu, setMenu] = useState(false);
  const [searching, setSearching] = useState(false);
  return <header className="header"><div className="bar container">
    <button className="icon-btn menu-btn" aria-label="باز کردن منو" aria-expanded={menu} onClick={() => setMenu(true)}><Menu /></button>
    <a href="#home" className="logo" dir="ltr" aria-label="آروما، خانه">AROMA<span>THE FRAGRANCE EDIT</span></a>
    <p className="header-tagline">روایتِ تو، به زبانِ رایحه</p>
    <div className="actions"><button className="icon-btn" aria-label="جستجو" aria-expanded={searching} aria-controls="site-search" onClick={() => setSearching(!searching)}>{searching ? <X /> : <Search />}</button>
      <button className="icon-btn" aria-label="حساب کاربری" onClick={() => onAction('account')}><User /></button>
      <button className="icon-btn" aria-label="علاقه‌مندی‌ها" onClick={() => onAction('wishlist')}><Heart /></button>
      <button className="icon-btn" aria-label="سبد خرید" onClick={() => onAction('cart')}><ShoppingBag /></button></div>
  </div><nav className="desktop-nav container" aria-label="ناوبری اصلی"><ul>{navLinks.map(l => <li key={l.label}><a href={l.href} aria-current={l.category && l.category === activeCat ? 'true' : undefined} onClick={() => { if (l.category) onCategory(l.category); else if (l.label === 'همهٔ عطرها') onCategory('all'); }}>{l.label}</a></li>)}</ul><a href="#journal">مجلهٔ آروما ↖</a></nav>
  {searching && <form id="site-search" className="search container" role="search" onSubmit={e => { e.preventDefault(); location.hash = 'products'; }}><label htmlFor="q">جستجوی عطر، برند یا نت</label><div className="search-row"><input id="q" type="search" autoFocus value={query} onChange={e => onQuery(e.target.value)} placeholder="مثلاً رز، Santal یا Maison…" /><button className="cta" type="submit">جستجو</button></div></form>}
  <MobileNavigation links={navLinks} open={menu} onClose={() => setMenu(false)} onCategory={onCategory} activeCat={activeCat} /></header>;
}
