import { useEffect, useRef, type RefObject } from 'react';

/** Approved thin track + fixed-size oval, with native range drag/keyboard support. */
export function ScrollRail({ viewportRef, controlsId, label }: { viewportRef: RefObject<HTMLElement>; controlsId: string; label: string }) {
  const control = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const viewport = viewportRef.current;
    const rail = control.current;
    if (!viewport || !rail) return;
    let frame = 0;
    const update = () => {
      const maximum = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
      const progress = maximum ? Math.max(0, Math.min(100, viewport.scrollTop / maximum * 100)) : 0;
      rail.hidden = maximum <= 1;
      rail.value = String(progress);
      rail.setAttribute('aria-valuetext', new Intl.NumberFormat('fa-IR').format(Math.round(progress)) + ' درصد');
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    const resize = new ResizeObserver(schedule);
    resize.observe(viewport);
    if (viewport.firstElementChild) resize.observe(viewport.firstElementChild);
    const mutation = new MutationObserver(schedule);
    mutation.observe(viewport, { childList:true, subtree:true, characterData:true });
    viewport.addEventListener('scroll', schedule, { passive:true });
    schedule();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); mutation.disconnect(); viewport.removeEventListener('scroll', schedule); };
  }, [viewportRef]);
  return <input ref={control} className="scroll-rail" type="range" min="0" max="100" step="0.1" defaultValue="0" hidden aria-label={label} aria-controls={controlsId} onChange={event => {
    const viewport = viewportRef.current;
    if (viewport) viewport.scrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight) * event.currentTarget.valueAsNumber / 100;
  }} />;
}
