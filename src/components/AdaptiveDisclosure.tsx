import { useEffect, useRef, type ReactNode } from 'react';

/** Native keyboard-accessible disclosure on phones, expanded content on larger screens. */
export function AdaptiveDisclosure({ className, summary, children }: { className: string; summary: ReactNode; children: ReactNode }) {
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(min-width:768px)');
    const update = () => {
      const element = details.current;
      if (!element) return;
      const summary = element.querySelector('summary')!;
      summary.tabIndex = media.matches ? -1 : 0;
      if (!media.matches && element.contains(document.activeElement) && document.activeElement !== summary) summary.focus({ preventScroll: true });
      element.open = media.matches;
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return <details className={className} ref={details}>
    <summary onClick={event => { if (window.matchMedia('(min-width:768px)').matches) event.preventDefault(); }}>
      {summary}
    </summary>
    {children}
  </details>;
}
