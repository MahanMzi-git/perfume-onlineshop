import { useEffect, useRef, useState } from 'react';
export function FragranceOrbit() {
  const host = useRef<HTMLDivElement>(null);
  const pause = useRef<HTMLButtonElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const element = host.current!;
    const observer = new MutationObserver(() => setReady(element.dataset.ready === 'true'));
    observer.observe(element, { attributes: true, attributeFilter: ['data-ready'] });
    const modulePath = new URL('/motion-lab/photo-orbit.js', window.location.origin).href;
    import(/* @vite-ignore */ modulePath).then(module => {
      if (disposed) return;
      cleanup = module.mountOrbit({ host: element, hero: document.getElementById('home'), docks: [...document.querySelectorAll('[data-orbit-dock]')], pause: pause.current });
    }).catch(() => setReady(false));
    return () => { disposed = true; observer.disconnect(); cleanup?.(); };
  }, []);
  return <><div ref={host} className="home-orbit-stage" aria-hidden="true" /><button ref={pause} className="home-orbit-pause" hidden={!ready} aria-pressed="false">توقف گردش</button></>;
}
