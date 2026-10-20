import { useEffect, useRef } from 'react';
import { X, ArrowUpLeft } from 'lucide-react';
import type { ReactNode } from 'react';
export function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{children}</div>;
}
export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return <a className="text-link" href={href}>{children}<ArrowUpLeft size={17} aria-hidden="true" /></a>;
}
export function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} className="dialog" aria-labelledby="dialog-title" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <button className="icon-btn dialog-close" aria-label="بستن" onClick={onClose}><X /></button>
    <p className="eyebrow">AROMA · نسخهٔ نمایشی</p><h2 id="dialog-title">{title}</h2>{children}
  </dialog>;
}
