import { useEffect } from 'react';
import { X } from 'lucide-react';
export interface NavLink { label: string; href: string; niche?: boolean }
interface Props { links: NavLink[]; open: boolean; onClose: () => void; onNiche: () => void }
export function MobileNavigation({ links, open, onClose, onNiche }: Props) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="mobile-nav" role="dialog" aria-modal="true" aria-label="منوی اصلی">
      <button type="button" className="icon-btn" aria-label="بستن منو" onClick={onClose}><X /></button>
      <nav><ul>{links.map((l) => (
        <li key={l.href + l.label}><a href={l.href} onClick={() => { if (l.niche) onNiche(); onClose(); }}>{l.label}</a></li>
      ))}</ul></nav>
    </div>
  );
}
