import type { KeyboardEvent } from 'react';

/** Keep Tab navigation inside dialogs, including when the dialog itself has focus. */
export function containDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== 'Tab') return;
  const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
    'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
  )).filter(element => element.getClientRects().length > 0);
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (!first) return;
  const focused = document.activeElement;
  if (!controls.some(control => control === focused) || (event.shiftKey ? focused === first : focused === last)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  }
}
