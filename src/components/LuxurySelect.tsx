import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { ScrollRail } from './ScrollRail';

export interface LuxurySelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface Props {
  label: string;
  value: string;
  options: LuxurySelectOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
  disabled?: boolean;
  inputId?: string;
  invalid?: boolean;
  describedBy?: string;
  required?: boolean;
}

const searchableText = (value: string) => value.toLocaleLowerCase('fa-IR').replace(/ي/g, 'ی').replace(/ك/g, 'ک').normalize('NFD').replace(/[\u064b-\u065f]/g, '');

export function LuxurySelect({ label, value, options, onChange, ariaLabel, disabled, inputId, invalid, describedBy, required }: Props) {
  const id = useId().replace(/:/g, '');
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const keyboardOpen = useRef<'first' | 'last' | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find(option => option.value === value) ?? options[0];
  const hasSearch = options.length > 3;
  const filtered = query ? options.filter(option => searchableText(option.label + ' ' + (option.description ?? '')).includes(searchableText(query))) : options;

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', closeOutside);
    const frame = requestAnimationFrame(() => {
      const direction = keyboardOpen.current;
      keyboardOpen.current = null;
      if (direction) {
        const buttons = Array.from(list.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
        (buttons.find(button => button.getAttribute('aria-selected') === 'true') ?? (direction === 'last' ? buttons[buttons.length - 1] : buttons[0]))?.focus();
      } else if (hasSearch) search.current?.focus();
      else list.current?.querySelector<HTMLButtonElement>('button[aria-selected=true]:not(:disabled),button:not(:disabled)')?.focus();
    });
    return () => { cancelAnimationFrame(frame); document.removeEventListener('pointerdown', closeOutside); };
  }, [open, hasSearch]);

  function toggle() { setOpen(current => !current); }
  function choose(next: LuxurySelectOption) {
    if (next.disabled) return;
    onChange(next.value);
    setQuery('');
    setOpen(false);
    requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>('.luxury-select-trigger')?.focus());
  }

  return <div className="luxury-select" ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }} onKeyDown={event => {
    if ((event.target as HTMLElement).matches('input[type=range]')) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!open) {
      if (!disabled && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) { event.preventDefault(); event.stopPropagation(); keyboardOpen.current = event.key === 'ArrowUp' ? 'last' : 'first'; setOpen(true); }
      return;
    }
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); root.current?.querySelector<HTMLButtonElement>('.luxury-select-trigger')?.focus({ preventScroll:true }); return; }
    const buttons = Array.from(list.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || (index >= 0 && ['Home','End'].includes(event.key))) {
      event.preventDefault(); event.stopPropagation();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : index < 0 ? (event.key === 'ArrowDown' ? 0 : buttons.length - 1) : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next]?.focus({ preventScroll:true }); buttons[next]?.scrollIntoView({ block:'nearest' });
    } else if (event.key === 'Enter' && event.target === search.current) {
      event.preventDefault(); buttons[0]?.click();
    }
  }}>
    <span className="luxury-select-label" id={`${id}-label`}>{label}</span>
    <button id={inputId} disabled={disabled} className="luxury-select-trigger" type="button" aria-label={ariaLabel} aria-invalid={invalid || undefined} aria-describedby={[`${id}-value`,describedBy,required ? `${id}-required` : undefined].filter(Boolean).join(' ')} aria-labelledby={ariaLabel ? undefined : `${id}-label ${id}-value`} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? `${id}-list` : undefined} onClick={toggle}>
      <span id={`${id}-value`}><bdi>{selected?.label ?? 'انتخاب کنید'}</bdi>{selected?.description && <small>{selected.description}</small>}</span><ChevronDown aria-hidden="true" />
    </button>
    {required && <span className="sr" id={`${id}-required`}>انتخاب این مورد الزامی است.</span>}
    {open && <>
      <button type="button" className="luxury-select-scrim" aria-label="بستن فهرست" onClick={() => setOpen(false)} />
      <div className="luxury-select-panel">
        <div className="luxury-select-mobile-title"><span>{label}</span><button type="button" onClick={() => setOpen(false)}>بستن</button></div>
        {hasSearch && <label className="luxury-select-search"><Search aria-hidden="true" /><span className="sr">جستجو در {label}</span><input ref={search} type="search" value={query} onChange={event => { setQuery(event.target.value); if (list.current) list.current.scrollTop = 0; }} placeholder="جستجو میان گزینه‌ها…" /></label>}
        <div className="luxury-select-list-wrap">
          <div ref={list} id={`${id}-list`} className="luxury-select-list" role="listbox" aria-labelledby={`${id}-label`}>
            {filtered.map(option => <button key={option.value} type="button" role="option" tabIndex={option.value === value || (!filtered.some(item => item.value === value && !item.disabled) && option === filtered.find(item => !item.disabled)) ? 0 : -1} aria-selected={option.value === value} disabled={option.disabled} onClick={() => choose(option)}>
              <span><bdi>{option.label}</bdi>{option.description && <small>{option.description}</small>}</span>{option.value === value && <Check aria-hidden="true" />}
            </button>)}
            {!filtered.length && <p className="luxury-select-empty">گزینه‌ای پیدا نشد.</p>}
          </div>
          <ScrollRail viewportRef={list} controlsId={`${id}-list`} label={'پیمایش گزینه‌های ' + label} />
        </div>
      </div>
    </>}
  </div>;
}
