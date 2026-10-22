import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
export function FragranceOrbit() {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const element = host.current!;
    const observer = new MutationObserver(() => setReady(element.dataset.ready === 'true'));
    observer.observe(element, { attributes: true, attributeFilter: ['data-ready'] });
    const modulePath = new URL('/motion-lab/photo-orbit.js', window.location.origin).href;
    import(/* @vite-ignore */ modulePath).then(module => {
      if (disposed) return;
      cleanup = module.mountOrbit({ host: element, hero: document.getElementById('home'), docks: [...document.querySelectorAll('[data-orbit-dock]')], onPauseChange: setPaused });
    }).catch(() => setReady(false));
    return () => { disposed = true; observer.disconnect(); cleanup?.(); };
  }, []);
  return <><div ref={host} className="home-orbit-stage" aria-hidden="true" /><button type="button" className="home-orbit-pause" hidden={!ready} aria-pressed={paused} aria-label={paused ? 'پخش انیمیشن' : 'توقف انیمیشن'} onClick={() => host.current?.dispatchEvent(new Event('aroma:toggle-motion'))}><span className="motion-control-icon" aria-hidden="true">{paused ? <Play size={13} /> : <Pause size={13} />}</span></button></>;
}
