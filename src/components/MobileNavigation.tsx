import { useEffect, useRef } from 'react';
import { X, ShoppingBag, Flower2, Users, Compass, Gem, Gift, Tags, BookOpen, ArrowUpLeft, Info, MessageCircle } from 'lucide-react';
import { containDialogFocus } from '../lib/dialogFocus';
import { useStore } from './StoreContext';
import { comparisonHref } from '../lib/routes';
import { CompareIcon } from './CompareIcon';
import { ScrollRail } from './ScrollRail';
export interface NavLink { label: string; href: string; category?: string }
interface Props { links: NavLink[]; open: boolean; onClose: () => void; }
export function MobileNavigation({ links, open, onClose }: Props) {
  const { comparisonIds } = useStore();
  const ref = useRef<HTMLDialogElement>(null);
  const menuList = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { ref.current?.close(); document.body.style.overflow = overflow; previous?.focus({ preventScroll:true }); };
  }, [open]);
  if (!open) return null;
  return <dialog ref={ref} id="mobile-menu" className="mobile-nav" aria-label="منوی اصلی" onKeyDown={containDialogFocus} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { const box = event.currentTarget.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose(); }}><div className="drawer-top"><span className="logo" dir="ltr">AROMA</span><button className="icon-btn" aria-label="بستن منو" onClick={onClose}><X aria-hidden="true" /></button></div><p className="eyebrow">دنیای عطر، به انتخاب شما</p><div className="mobile-menu-scroll"><nav ref={menuList} id="mobile-menu-links"><ul>{links.map((l,index) => { const Icon = [ShoppingBag,Flower2,Compass,Users,Tags,Compass,Gem,Gift,Info,MessageCircle][index] ?? Compass; return <li key={l.label}><a href={l.href} aria-current={location.hash.split('?')[0] === l.href ? 'page' : undefined} onClick={onClose}><Icon size={16} aria-hidden="true" /><span>{l.label}</span><ArrowUpLeft size={14} aria-hidden="true" /></a></li>; })}</ul></nav><ScrollRail viewportRef={menuList} controlsId="mobile-menu-links" label="پیمایش منوی اصلی" /></div><a className="mobile-menu-journal" href="#/journal" onClick={onClose}><BookOpen size={16} aria-hidden="true" />مجلهٔ آروما<ArrowUpLeft size={14} aria-hidden="true" /></a><a className="menu-comparison" href={comparisonHref(comparisonIds)} onClick={onClose}><CompareIcon selected={comparisonIds.length > 0} /><span>مقایسهٔ عطرها</span><b>{new Intl.NumberFormat('fa-IR').format(comparisonIds.length)}</b></a></dialog>;
}
