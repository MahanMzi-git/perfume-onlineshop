import { useEffect, useRef } from 'react';
import { officialBrandLogo } from '../admin/brandLogos';
import { brands } from '../data/brands';

const marqueeBrands = brands.map(brand => ({ ...brand, logo: officialBrandLogo(brand.id)?.logo }));

export function BrandMarquee({ selectedBrandId, onSelect }: {
  selectedBrandId?: string;
  onSelect: (id: string) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const group = groupRef.current;
    if (!viewport || !group) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hoverPointer = window.matchMedia('(hover: hover)');
    let frame = 0;
    let lastTime = 0;
    let position = viewport.scrollLeft;
    let lastScroll = position;
    let resumeAt = 0;
    const scrollSpeed = 32;

    function scroll(time: number) {
      if (!viewport || !group) return;
      const elapsed = Math.min(time - (lastTime || time), 40);
      lastTime = time;
      const currentScroll = viewport.scrollLeft;
      if (Math.abs(currentScroll - lastScroll) > 1) {
        position = currentScroll;
        resumeAt = time + 1600;
      }
      if (time >= resumeAt && !viewport.matches(':focus-within, :active') &&
          !(hoverPointer.matches && viewport.matches(':hover'))) {
        const distance = group.offsetWidth;
        if (distance > 0) {
          position = (position - scrollSpeed * elapsed / 1000 + distance) % distance;
          viewport.scrollLeft = position;
        }
      }
      lastScroll = viewport.scrollLeft;
      frame = requestAnimationFrame(scroll);
    }

    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      lastTime = 0;
      if (entry.isIntersecting && !reducedMotion.matches) frame = requestAnimationFrame(scroll);
    });
    function resetMotion() {
      cancelAnimationFrame(frame);
      observer.unobserve(viewport!);
      observer.observe(viewport!);
    }
    observer.observe(viewport);
    reducedMotion.addEventListener('change', resetMotion);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      reducedMotion.removeEventListener('change', resetMotion);
    };
  }, []);

  return (
    <div className="brand-list" dir="ltr" ref={viewportRef}>
      <div className="brand-marquee-track">
        {[false, true].map(copy => (
          <div className="brand-marquee-group" key={String(copy)}
            ref={copy ? undefined : groupRef} aria-hidden={copy || undefined}>
            {marqueeBrands.map(brand => (
              <button key={brand.id} type="button" tabIndex={copy ? -1 : undefined}
                aria-pressed={selectedBrandId === brand.id}
                onMouseDown={copy ? event => event.preventDefault() : undefined}
                onClick={() => onSelect(brand.id)}>
                {brand.logo && (
                  <span className="brand-marquee-logo-frame" data-brand={brand.id}>
                    <img className="brand-marquee-logo" src={brand.logo} alt="" width={36} height={36}
                      onError={event => { event.currentTarget.hidden = true; }} />
                  </span>
                )}
                <span>{brand.name}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
