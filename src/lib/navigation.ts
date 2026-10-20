/** Repeated anchor actions must still scroll; focus announces the destination. */
export function navigateToSection(id: string) {
  if (location.hash !== `#${id}`) location.hash = id;
  requestAnimationFrame(() => {
    const section = document.getElementById(id);
    const heading = section?.querySelector('h2');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    section?.scrollIntoView({ block: 'start' });
  });
}
