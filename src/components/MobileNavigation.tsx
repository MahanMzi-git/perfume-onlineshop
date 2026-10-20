import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { navigateToSection } from '../lib/navigation';
import { containDialogFocus } from '../lib/dialogFocus';
export interface NavLink { label: string; href: string; category?: string }
interface Props { links: NavLink[]; open: boolean; onClose: () => void; onCategory: (id: string) => void; activeCat?: string }
export function MobileNavigation({ links, open, onClose, onCategory, activeCat }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { ref.current?.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, [open]);
  if (!open) return null;
  return <dialog ref={ref} id="mobile-menu" className="mobile-nav" aria-label="منوی اصلی" onKeyDown={containDialogFocus} onCancel={onClose}><div className="drawer-top"><span className="logo" dir="ltr">AROMA</span><button className="icon-btn" aria-label="بستن منو" onClick={onClose}><X aria-hidden="true" /></button></div><p className="eyebrow">دنیای عطر، به انتخاب شما</p><nav><ul>{links.map(l => <li key={l.label}><a href={l.href} aria-current={l.category === activeCat && l.category ? 'true' : undefined} onClick={event => { event.preventDefault(); if (l.category) onCategory(l.category); else if (l.label === 'همهٔ عطرها') onCategory('all'); onClose(); navigateToSection(l.href.slice(1)); }}>{l.label}<span aria-hidden="true">↖</span></a></li>)}</ul></nav><a href="#journal" onClick={onClose}>مجلهٔ آروما</a></dialog>;
}
