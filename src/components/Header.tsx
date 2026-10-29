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
  isHome: boolean;
  query: string;
  onQuery: (q: string) => void;
  onAction: (action: string) => void;
  onSearch: (query?: string) => void;
  favouriteCount: number;
  bagCount: number;
}

export function Header({ isHome, query, onQuery, onAction, onSearch, favouriteCount, bagCount }: Props) {
  const { comparisonIds } = useStore();
  const [menu, setMenu] = useState(false);
  const [desktopMenu, setDesktopMenu] = useState(false);
  const [desktopMenuFloating, setDesktopMenuFloating] = useState(false);
  const menuToggle = useRef<HTMLButtonElement>(null);
  const desktopNavigation = useRef<HTMLDivElement>(null);
  const [searching, setSearching] = useState(false);
  const [compact, setCompact] = useState(() => matchMedia('(max-width:600px)').matches);
  const searchInput = useRef<HTMLInputElement>(null);
  const hideSecondary = compact && searching;
  const header = useRef<HTMLElement>(null);
  const searchToggle = useRef<HTMLButtonElement>(null);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  useLayoutEffect(() => {
    if (desktopNavigation.current) desktopNavigation.current.inert = desktopCollapsed && !desktopMenu;
  }, [desktopCollapsed, desktopMenu]);
  useLayoutEffect(() => {
    setDesktopMenu(false);
    setDesktopMenuFloating(false);
  }, [desktopCollapsed, isHome]);
  useLayoutEffect(() => {
    if (!desktopMenu) return;
    const close = () => setDesktopMenu(false);
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { close(); menuToggle.current?.focus({ preventScroll:true }); }
    };
    const outside = (event: PointerEvent) => { if (!header.current?.contains(event.target as Node)) close(); };
    window.addEventListener('hashchange', close);
    window.addEventListener('keydown', escape);
    window.addEventListener('pointerdown', outside);
    return () => { window.removeEventListener('hashchange', close); window.removeEventListener('keydown', escape); window.removeEventListener('pointerdown', outside); };
  }, [desktopMenu]);
  useLayoutEffect(() => {
    const desktop = matchMedia('(min-width:901px), (min-width:601px) and (max-width:900px) and (max-height:500px) and (orientation:landscape)');
    let frame = 0;
    const update = () => setDesktopCollapsed(previous => desktop.matches && (matchMedia('(max-width:900px)').matches || !isHome || (previous ? scrollY > 24 : scrollY > 120)));
    const closeMobile = () => { if (desktop.matches) setMenu(false); };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive:true });
    desktop.addEventListener('change', update);
    desktop.addEventListener('change', closeMobile);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); desktop.removeEventListener('change', update); desktop.removeEventListener('change', closeMobile); };
  }, [isHome]);

  useLayoutEffect(() => {
    if (!header.current) return;
    let frame = 0;
    const measure = () => {
      if (!header.current) return;
      const rect = header.current.getBoundingClientRect();
      document.documentElement.style.setProperty('--header-height', rect.height + 'px');
      document.documentElement.style.setProperty('--header-bottom', rect.bottom + 'px');
      if (matchMedia('(min-width:901px), (min-width:601px) and (max-width:900px) and (max-height:500px) and (orientation:landscape)').matches && header.current.dataset.collapsed !== 'true') header.current.style.setProperty('--header-expanded-height', rect.height + 'px');
    };
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(measure);
    observer.observe(header.current);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      observer.disconnect();
      document.documentElement.style.removeProperty('--header-height');
      document.documentElement.style.removeProperty('--header-bottom');
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

  return <header ref={header} data-desktop-menu={desktopMenu || undefined} data-desktop-floating={desktopMenuFloating || undefined} data-collapsed={desktopCollapsed || undefined} data-home={isHome || undefined} className={`header ${searching ? 'is-searching' : ''}`}>
    <div className="bar container">
      <button ref={menuToggle} className="icon-btn menu-btn" tabIndex={hideSecondary ? -1 : undefined} aria-hidden={hideSecondary || undefined} aria-label={desktopMenu ? 'بستن منو' : 'باز کردن منو'} aria-expanded={desktopMenu || menu} aria-controls={desktopCollapsed ? 'desktop-navigation' : menu ? 'mobile-menu' : undefined} onClick={() => { if (matchMedia('(min-width:901px), (min-width:601px) and (max-width:900px) and (max-height:500px) and (orientation:landscape)').matches) { setDesktopMenuFloating(true); setDesktopMenu(current => !current); } else setMenu(true); }}>{desktopMenu ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
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
    <div ref={desktopNavigation} className="desktop-nav-shell"><div className="desktop-nav-clip"><nav id="desktop-navigation" className="desktop-nav container" aria-label="ناوبری اصلی" onClick={() => setDesktopMenu(false)}>
      <ul>{navLinks.map(link => <li key={link.label}>
        <a href={link.href} aria-current={location.hash.split('?')[0] === link.href ? 'page' : undefined}>{link.label}</a>
      </li>)}<li><a href={comparisonHref(comparisonIds)}><CompareIcon /> مقایسهٔ عطرها ({new Intl.NumberFormat('fa-IR').format(comparisonIds.length)})</a></li></ul>
      <a href="#/journal">مجلهٔ آروما <span aria-hidden="true">↖</span></a>
    </nav></div></div>
    <MobileNavigation links={navLinks} open={menu} onClose={() => setMenu(false)} />
  </header>;
}
