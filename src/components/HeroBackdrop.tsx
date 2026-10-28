import { useLayoutEffect, useRef } from 'react';

/** Extends the hero photograph behind the floating header without moving orbit anchors. */
export function HeroBackdrop() {
  const backdrop = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = document.getElementById('root');
    const hero = document.getElementById('home');
    const header = document.querySelector('.header');
    const notice = document.querySelector('.announcement');
    if (!root || !hero || !header || !notice) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!backdrop.current) return;
        const top = notice.getBoundingClientRect().bottom;
        backdrop.current.style.top = `${top - root.getBoundingClientRect().top}px`;
        backdrop.current.style.height = `${Math.max(0, hero.getBoundingClientRect().bottom - top)}px`;
      });
    };
    const observer = new ResizeObserver(update);
    [hero, header, notice].forEach(node => observer.observe(node));
    window.addEventListener('resize', update);
    update();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', update); };
  }, []);
  return <div ref={backdrop} className="hero-background floating-hero-backdrop" aria-hidden="true" />;
}
