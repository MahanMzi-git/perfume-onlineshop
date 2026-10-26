import { useLayoutEffect, useRef, useState } from 'react';
import { Search, User, ShoppingBag, Menu, Heart, X } from 'lucide-react';
import { useStore } from './StoreContext';
import { comparisonHref } from '../lib/routes';
import { CompareIcon } from './CompareIcon';
import { MobileNavigation, type NavLink } from './MobileNavigation';

export const navLinks: NavLink[] = [
  { label: 'همهٔ عطرها', href: '#/catalog' },
  { label: 'زنانه', href: '#/collections/women', category: 'women' },
  { label: 'مردانه', href: '#/collections/men', category: 'men' },
  { label: 'یونیسکس', href: '#/collections/unisex', category: 'unisex' },
  { label: 'برندها', href: '#/brands' },
  { label: 'دنیای رایحه‌ها', href: '#/families' },
  { label: 'عطرهای نیش', href: '#/collections/niche', category: 'niche' },
  { label: 'هدیه و ست‌ها', href: '#/collections/gifts', category: 'gifts' },
  { label: 'دربارهٔ ما', href: '#/about' },
  { label: 'ارتباط با ما', href: '#/contact' },
];

interface Props {
  query: string;
  onQuery: (q: string) => void;
  onAction: (action: string) => void;
  onSearch: (query?: string) => void;
  favouriteCount: number;
  bagCount: number;
}

export function Header({ query, onQuery, onAction, onSearch, favouriteCount, bagCount }: Props) {
  const { comparisonIds } = useStore();
  const [menu, setMenu] = useState(false);
  const [searching, setSearching] = useState(false);
  const [compact, setCompact] = useState(() => matchMedia('(max-width:600px)').matches);
  const searchInput = useRef<HTMLInputElement>(null);
  const hideSecondary = compact && searching;
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

  useLayoutEffect(() => {
    const media = matchMedia('(max-width:600px)');
    const update = () => setCompact(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useLayoutEffect(() => {
    if (!searching) return;
    const frame = requestAnimationFrame(() => searchInput.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [searching]);
  useLayoutEffect(() => {
    const toggle = () => setSearching(current => !current);
    window.addEventListener('aroma:toggle-search', toggle);
    return () => window.removeEventListener('aroma:toggle-search', toggle);
  }, []);

  function closeSearch() {
    setSearching(false);
    const returnTarget = compact ? document.querySelector<HTMLButtonElement>('.mobile-island button[aria-controls="header-query"]') : searchToggle.current;
    returnTarget?.focus({ preventScroll: true });
  }

  function clearOrCloseSearch() {
    if (query.length > 0) {
      onQuery('');
      searchInput.current?.focus({ preventScroll: true });
      return;
    }
    closeSearch();
  }

  return <header ref={header} className={`header ${searching ? 'is-searching' : ''}`}>
    <div className="bar container">
      <button className="icon-btn menu-btn" tabIndex={hideSecondary ? -1 : undefined} aria-hidden={hideSecondary || undefined} aria-label="باز کردن منو" aria-expanded={menu} aria-controls={menu ? 'mobile-menu' : undefined} onClick={() => setMenu(true)}><Menu aria-hidden="true" /></button>
      <a href="#home" className="logo" tabIndex={hideSecondary ? -1 : undefined} aria-hidden={hideSecondary || undefined} dir="ltr" aria-label="آروما، خانه">AROMA<span>THE FRAGRANCE EDIT</span></a>
      <p className="header-tagline">روایتِ تو، به زبانِ رایحه</p>
      <div className="actions">
        <div className="header-search-slot">
          <form id="site-search" className="inline-search" role="search" onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); closeSearch(); } }} onSubmit={event => { event.preventDefault(); if (!searching) return; closeSearch(); onSearch(query); }}>
            <label className="sr" htmlFor="header-query">جستجوی عطر، برند یا نت</label>
            <input ref={searchInput} id="header-query" type="search" disabled={!searching} maxLength={120} value={query} onChange={event => onQuery(event.target.value)} placeholder="عطر، برند یا نت دلخواهت…" autoComplete="off" />
            <button type="submit" hidden disabled={!searching}>جستجو</button>
            <button type="button" className="icon-btn inline-search-close" disabled={!searching} aria-label={query.length > 0 ? 'پاک کردن عبارت جستجو' : 'بستن جستجو'} onClick={clearOrCloseSearch}><X size={16} aria-hidden="true" /></button>
            <button ref={searchToggle} type="button" className="icon-btn inline-search-toggle" aria-label={searching ? 'نمایش نتایج جستجو' : 'جستجو'} aria-expanded={searching} aria-controls="header-query" onClick={event => { if (!searching) setSearching(true); else event.currentTarget.form?.requestSubmit(); }}><Search aria-hidden="true" /></button>
          </form>
        </div>
        <button className="icon-btn header-secondary header-account" tabIndex={hideSecondary ? -1 : undefined} aria-hidden={hideSecondary || undefined} aria-label="حساب کاربری" onClick={() => onAction('account')}><span className="header-account-symbol"><User className="header-account-user" aria-hidden="true" /><Search className="header-account-search" aria-hidden="true" /></span></button>
        <button className="icon-btn wishlist-action header-secondary" tabIndex={hideSecondary ? -1 : undefined} aria-hidden={hideSecondary || undefined} aria-label={`علاقه‌مندی‌ها، ${new Intl.NumberFormat('fa-IR').format(favouriteCount)} عطر`} onClick={() => onAction('wishlist')}>
          <Heart aria-hidden="true" /><span className="wishlist-count" aria-hidden="true">{new Intl.NumberFormat('fa-IR').format(favouriteCount)}</span>
        </button>
        <button className="icon-btn wishlist-action header-cart" aria-label={`سبد خرید، ${new Intl.NumberFormat('fa-IR').format(bagCount)} کالا`} onClick={() => onAction('cart')}><ShoppingBag aria-hidden="true" />{bagCount > 0 && <span className="wishlist-count" aria-hidden="true">{new Intl.NumberFormat('fa-IR').format(bagCount)}</span>}</button>
      </div>
    </div>
    <nav className="desktop-nav container" aria-label="ناوبری اصلی">
      <ul>{navLinks.map(link => <li key={link.label}>
        <a href={link.href} aria-current={location.hash.split('?')[0] === link.href ? 'page' : undefined}>{link.label}</a>
      </li>)}<li><a href={comparisonHref(comparisonIds)}><CompareIcon /> مقایسهٔ عطرها ({new Intl.NumberFormat('fa-IR').format(comparisonIds.length)})</a></li></ul>
      <a href="#/journal">مجلهٔ آروما <span aria-hidden="true">↖</span></a>
    </nav>
    <MobileNavigation links={navLinks} open={menu} onClose={() => setMenu(false)} />
  </header>;
}
