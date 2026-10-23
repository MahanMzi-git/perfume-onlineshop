import { useEffect, useRef } from 'react';
import { X, ShoppingBag, Flower2, Users, Compass, Gem, Gift, Tags, BookOpen, ArrowUpLeft } from 'lucide-react';
import { navigateToSection } from '../lib/navigation';
import { containDialogFocus } from '../lib/dialogFocus';
import { ScrollRail } from './ScrollRail';
export interface NavLink { label: string; href: string; category?: string }
interface Props { catalogMode?: boolean; links: NavLink[]; open: boolean; onClose: () => void; onCategory: (id: string) => void; activeCat?: string }
export function MobileNavigation({ catalogMode = false, links, open, onClose, onCategory, activeCat }: Props) {
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
  return <dialog ref={ref} id="mobile-menu" className="mobile-nav" aria-label="منوی اصلی" onKeyDown={containDialogFocus} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { const box = event.currentTarget.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose(); }}><div className="drawer-top"><span className="logo" dir="ltr">AROMA</span><button className="icon-btn" aria-label="بستن منو" onClick={onClose}><X aria-hidden="true" /></button></div><p className="eyebrow">دنیای عطر، به انتخاب شما</p><div className="mobile-menu-scroll"><nav ref={menuList} id="mobile-menu-links"><ul>{links.map((l,index) => { const Icon = [ShoppingBag,Flower2,Compass,Users,Tags,Compass,Gem,Gift][index] ?? Compass; return <li key={l.label}><a href={l.href} aria-current={l.category === activeCat && l.category ? 'true' : undefined} onClick={event => { event.preventDefault(); if (l.category) onCategory(l.category); else if (l.label === 'همهٔ عطرها') onCategory('all'); onClose(); if (!(catalogMode && (l.category || l.label === 'همهٔ عطرها'))) navigateToSection(l.href.slice(1)); }}><Icon size={16} aria-hidden="true" /><span>{l.label}</span><ArrowUpLeft size={14} aria-hidden="true" /></a></li>; })}</ul></nav><ScrollRail viewportRef={menuList} controlsId="mobile-menu-links" label="پیمایش منوی اصلی" /></div><a className="mobile-menu-journal" href="#home" onClick={event => { event.preventDefault(); onClose(); navigateToSection('home'); }}><BookOpen size={16} aria-hidden="true" />مجلهٔ آروما<ArrowUpLeft size={14} aria-hidden="true" /></a></dialog>;
}
