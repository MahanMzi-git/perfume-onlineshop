import { X } from 'lucide-react';
import { brands } from '../data/brands';
import { fragranceFamilies } from '../data/fragranceFamilies';
import { noteById } from '../data/scentNotes';
import type { Filters } from '../types/product';

interface Props {
  filters: Filters;
  wishlistOnly: boolean;
  count: number;
  onRemove: (key: keyof Filters) => void;
  onRemoveNote: (id: string) => void;
  onReset: () => void;
}

export function ActiveFilters({ filters, wishlistOnly, count, onRemove, onRemoveNote, onReset }: Props) {
  const audienceNames = { women: 'زنانه', men: 'مردانه', unisex: 'یونیسکس' };
  const labels: [keyof Filters, string | undefined][] = [
    ['query', filters.query ? `جستجو: ${filters.query}` : undefined],
    ['audience', filters.audience && audienceNames[filters.audience]],
    ['brandId', brands.find(b => b.id === filters.brandId)?.name],
    ['familyId', fragranceFamilies.find(f => f.id === filters.familyId)?.name],
    ['niche', filters.niche ? 'عطر نیش' : undefined],
    ['giftSet', filters.giftSet ? 'ست هدیه' : undefined],
    ['featured', filters.featured ? 'پیشنهاد آروما' : undefined],
    ['bestseller', filters.bestseller ? 'پرفروش نمایشی' : undefined],
  ];
  const activeLabels = labels.filter((entry): entry is [keyof Filters, string] => !!entry[1]);
  const selectedNotes = (filters.noteIds ?? []).map(noteById).filter(note => !!note);
  const hasFilters = activeLabels.length > 0 || selectedNotes.length > 0;
  return <div className="filter-summary">
    <p className="result-count" role="status" aria-live="polite" aria-atomic="true">
      {new Intl.NumberFormat('fa-IR').format(count)} عطر{wishlistOnly ? ' در علاقه‌مندی‌ها' : ' مطابق انتخاب شما'}
    </p>
    {hasFilters && <ul className="active-filters" aria-label="فیلترهای فعال">
      {activeLabels.map(([key, label]) => <li key={key}><button type="button" className="chip removable-chip" aria-label={`حذف فیلتر ${label}`} onClick={() => onRemove(key)}><bdi>{label}</bdi><X size={15} aria-hidden="true" /></button></li>)}
      {selectedNotes.map(note => <li key={note.id}><button type="button" className="chip removable-chip" aria-label={`حذف فیلتر نت: ${note.name}`} onClick={() => onRemoveNote(note.id)}><span>نت: {note.name}</span><X size={15} aria-hidden="true" /></button></li>)}
    </ul>}
    {(hasFilters || wishlistOnly) && <button className="link" onClick={onReset}>پاک کردن فیلترها</button>}
  </div>;
}
