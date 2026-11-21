import { useId, useRef, useState } from 'react';
import { Check, ChevronDown, Flower2, Search } from 'lucide-react';
import { fragranceFamilies } from '../data/fragranceFamilies';
import { familyImageUrl } from '../data/fragranceImages';
import type { FamilyOption } from './sellerDraftApi';

const normalize = (text: string) => text.trim().toLocaleLowerCase('fa').replace(/ي/g, 'ی').replace(/ك/g, 'ک');
const picturedFamilies = new Set(fragranceFamilies.map(family => family.slug));

function FamilyPicture({ id }: { id: string }) {
  return picturedFamilies.has(id)
    ? <img className="admin-family-picture" src={familyImageUrl(id)} width="44" height="44" alt="" />
    : <span className="admin-family-picture" aria-hidden="true"><Flower2 size={20} /></span>;
}

export function FragranceFamilyPicker({ options, value, disabled, onChange }: {
  options: FamilyOption[];
  value: string[];
  disabled: boolean;
  onChange: (ids: string[]) => void;
}) {
  const labelId = useId();
  const choiceId = useId();
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = value.map(id => options.find(option => option.id === id) ?? { id, name: id });
  const normalizedQuery = normalize(query);
  const visibleOptions = options.filter(option => normalize(option.name).includes(normalizedQuery));

  function close(restoreFocus: boolean) {
    setOpen(false);
    setQuery('');
    if (restoreFocus) trigger.current?.focus();
  }

  return <div className="admin-family-picker"
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(false); }}
    onKeyDown={event => {
      if (event.key === 'Escape' && open) {
        event.stopPropagation();
        close(true);
      }
      if (event.key === 'Enter' && event.target instanceof HTMLInputElement) event.preventDefault();
    }}>
    <label id={labelId} htmlFor="draft-product-family">خانواده‌های رایحه</label>
    <button id="draft-product-family" type="button" ref={trigger} className="admin-family-trigger" disabled={disabled}
      aria-labelledby={labelId + ' ' + choiceId} aria-expanded={open && !disabled} aria-controls={panelId}
      onClick={() => open ? close(false) : setOpen(true)}>
      <FamilyPicture id={selected[0]?.id ?? ''} />
      <span id={choiceId}>{selected.length ? selected.map(family => family.name).join('، ') : 'انتخاب خانواده‌های رایحه'}</span>
      <ChevronDown size={18} aria-hidden="true" />
    </button>
    <p className="admin-field-hint">می‌توانی چند خانواده انتخاب کنی؛ برای حذف هر انتخاب دوباره روی آن بزن.</p>
    <div id={panelId} hidden={!open || disabled} className="admin-family-menu">
      {open && !disabled && <>
        <div className="admin-family-search">
          <Search size={17} aria-hidden="true" />
          <input type="search" autoFocus value={query} aria-label="جست‌وجوی خانوادهٔ رایحه"
            placeholder="جست‌وجوی خانوادهٔ رایحه" onChange={event => setQuery(event.currentTarget.value)} />
        </div>
        <div className="admin-family-options">
          {visibleOptions.map(option => <button key={option.id} type="button" aria-pressed={value.includes(option.id)}
            onClick={() => onChange(value.includes(option.id) ? value.filter(id => id !== option.id) : [...value, option.id])}>
            <FamilyPicture id={option.id} />
            <span>{option.name}</span>
            {value.includes(option.id) && <Check size={18} aria-hidden="true" />}
          </button>)}
          {visibleOptions.length === 0 && <p role="status">خانواده‌ای با این نام پیدا نشد.</p>}
        </div>
        <button type="button" className="admin-primary" onClick={() => close(true)}>تأیید انتخاب خانواده‌ها</button>
      </>}
    </div>
  </div>;
}
