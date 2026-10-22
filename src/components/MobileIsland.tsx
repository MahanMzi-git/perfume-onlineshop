import { Heart, Home, Search, ShoppingBag } from 'lucide-react';
import type { Route } from '../lib/routes';

interface Props {
  route: Route;
  favouriteCount: number;
  bagCount: number;
}

export function MobileIsland({ route, favouriteCount, bagCount }: Props) {
  const accountSection = route.page === 'account' ? route.slug : undefined;
  return <nav className="mobile-island" aria-label="دسترسی سریع موبایل">
    <a href="#home" aria-current={route.page === 'home' ? 'page' : undefined}>
      <Home aria-hidden="true" /><span>خانه</span>
    </a>
    <button type="button" aria-controls="header-query" onClick={() => window.dispatchEvent(new Event('aroma:toggle-search'))}>
      <Search aria-hidden="true" /><span>جستجو</span>
    </button>
    <a href="#/account/wishlist" aria-current={accountSection === 'wishlist' ? 'page' : undefined}>
      <span className="mobile-island-icon"><Heart aria-hidden="true" />{favouriteCount > 0 && <b aria-hidden="true">{new Intl.NumberFormat('fa-IR').format(favouriteCount)}</b>}</span><span>علاقه‌مندی</span>
    </a>
    <a href="#/cart" aria-current={route.page === 'cart' || route.page === 'checkout' ? 'page' : undefined}>
      <span className="mobile-island-icon"><ShoppingBag aria-hidden="true" />{bagCount > 0 && <b aria-hidden="true">{new Intl.NumberFormat('fa-IR').format(bagCount)}</b>}</span><span>سبد</span>
    </a>
  </nav>;
}
