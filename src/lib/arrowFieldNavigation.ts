/** Move between fields while retaining text editing, native widgets and browser shortcuts. */
export function handleArrowFieldNavigation(event: KeyboardEvent) {
  if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || !event.key.startsWith('Arrow')) return;
  const field = event.target;
  if (!(field instanceof HTMLElement) || field.closest('.luxury-select-panel') || field.isContentEditable) return;
  const isText = field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement;
  const isSelect = field.matches('.luxury-select-trigger');
  if (!isText && !isSelect && !(field instanceof HTMLSelectElement)) return;
  if (field instanceof HTMLInputElement && ['radio','range','file','date','time','color'].includes(field.type)) return;
  const vertical = event.key === 'ArrowDown' || event.key === 'ArrowUp';
  if (vertical && (isSelect || field instanceof HTMLSelectElement || (field instanceof HTMLInputElement && field.type === 'number'))) return;
  const rtl = getComputedStyle(field).direction === 'rtl';
  const next = vertical ? event.key === 'ArrowDown' : event.key === (rtl ? 'ArrowLeft' : 'ArrowRight');
  if (isText && !(field instanceof HTMLInputElement && field.type === 'checkbox')) {
    const start = field.selectionStart, end = field.selectionEnd;
    // Horizontal arrows edit inside the text; cross-field movement starts at an edge.
    if (!vertical || field instanceof HTMLTextAreaElement) {
      if (start === null && field.value.length > 0) return;
      if (start !== null && (start !== end || (next ? end !== field.value.length : start !== 0))) return;
    }
  }
  const scope = field.closest('dialog') ?? field.closest('.cart-row') ?? field.closest('form') ?? field.closest('fieldset') ?? field.closest('main') ?? document;
  const fields = Array.from(scope.querySelectorAll<HTMLElement>('input:not([type=hidden]), textarea, select, .luxury-select-trigger')).filter(item => !item.matches(':disabled,[aria-disabled=true]') && !item.closest('[hidden],[inert],.luxury-select-panel') && item.getClientRects().length > 0 && item.tabIndex >= 0);
  const index = fields.indexOf(field);
  const destination = index >= 0 ? fields[index + (next ? 1 : -1)] : undefined;
  if (!destination) return;
  event.preventDefault();
  destination.focus({ preventScroll:true });
  const box = destination.getBoundingClientRect();
  const header = document.querySelector('.header')?.getBoundingClientRect().bottom ?? 0;
  const island = document.querySelector('.mobile-island')?.getBoundingClientRect();
  const bottom = island?.height ? island.top : innerHeight;
  if (box.top < header + 12 || box.bottom > bottom - 12) destination.scrollIntoView({ block:'center', behavior:matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth' });
}
