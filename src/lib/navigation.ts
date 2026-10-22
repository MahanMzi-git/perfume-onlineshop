let homeReturnPending = false;
export function consumeHomeReturn() {
  const pending = homeReturnPending;
  homeReturnPending = false;
  return pending;
}
/** Repeated anchor actions must still scroll; focus announces the destination. */
export function navigateToSection(id: string) {
  if (id === 'home' && location.hash.startsWith('#/')) {
    homeReturnPending = true;
    location.hash = id;
    return;
  }
  if (location.hash !== `#${id}`) location.hash = id;
  requestAnimationFrame(() => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      return;
    }
    const section = document.getElementById(id);
    const heading = section?.querySelector('h2');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    section?.scrollIntoView({ block: 'start' });
  });
}
