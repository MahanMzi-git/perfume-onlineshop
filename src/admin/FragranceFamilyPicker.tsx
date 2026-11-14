import { useId, useRef, useState } from 'react';
import { Check, ChevronDown, Flower2, Search } from 'lucide-react';
import { fragranceFamilies } from '../data/fragranceFamilies';
import { familyImageUrl } from '../data/fragranceImages';
import type { FamilyOption } from './sellerDraftApi';

const emptyFamily = { id: '', name: 'بدون خانوادهٔ رایحه' };
const normalize = (text: string) => text.trim().toLocaleLowerCase('fa').replace(/ي/g, 'ی').replace(/ك/g, 'ک');
const picturedFamilies = new Set(fragranceFamilies.map(family => family.slug));

function FamilyPicture({ id }: { id: string }) {
  return picturedFamilies.has(id)
    ? <img className="admin-family-picture" src={familyImageUrl(id)} width="44" height="44" alt="" />
    : <span className="admin-family-picture" aria-hidden="true"><Flower2 size={20} /></span>;
}

export function FragranceFamilyPicker({ options, value, disabled, onChange }: {
  options: FamilyOption[];
  value: string;
  disabled: boolean;
  onChange: (id: string) => void;
}) {
  const labelId = useId();
  const choiceId = useId();
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find(option => option.id === value) ?? (value ? { id: value, name: value } : emptyFamily);
  const normalizedQuery = normalize(query);
  const visibleOptions = [emptyFamily, ...options].filter(option => normalize(option.name).includes(normalizedQuery));

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
    <label id={labelId} htmlFor="draft-product-family">خانوادهٔ رایحه</label>
    <button id="draft-product-family" type="button" ref={trigger} className="admin-family-trigger" disabled={disabled}
      aria-labelledby={labelId + ' ' + choiceId} aria-expanded={open && !disabled} aria-controls={panelId}
      onClick={() => open ? close(false) : setOpen(true)}>
      <FamilyPicture id={selected.id} />
      <span id={choiceId}>{selected.name}</span>
      <ChevronDown size={18} aria-hidden="true" />
    </button>
    <div id={panelId} hidden={!open || disabled} className="admin-family-menu">
      {open && !disabled && <>
        <div className="admin-family-search">
          <Search size={17} aria-hidden="true" />
          <input type="search" autoFocus value={query} aria-label="جست‌وجوی خانوادهٔ رایحه"
            placeholder="جست‌وجوی خانوادهٔ رایحه" onChange={event => setQuery(event.currentTarget.value)} />
        </div>
        <div className="admin-family-options">
          {visibleOptions.map(option => <button key={option.id} type="button" aria-pressed={value === option.id}
            onClick={() => { onChange(option.id); close(true); }}>
            <FamilyPicture id={option.id} />
            <span>{option.name}</span>
            {value === option.id && <Check size={18} aria-hidden="true" />}
          </button>)}
          {visibleOptions.length === 0 && <p role="status">خانواده‌ای با این نام پیدا نشد.</p>}
        </div>
      </>}
    </div>
  </div>;
}
