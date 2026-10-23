import { brands } from '../data/brands';
import { fragranceFamilies } from '../data/fragranceFamilies';
import { products } from '../data/products';
import { audienceLabels, occasionLabels, productTypeLabels, seasonLabels, stockLabels, sweetnessLabels, temperatureLabels } from '../data/catalogLabels';
import type { Filters } from '../types/product';
import { LuxurySelect } from './LuxurySelect';

interface Props { filters: Filters; onChange: (patch: Partial<Filters>) => void }
export function AdvancedFilters({ filters, onChange }: Props) {
  const select = (key: keyof Filters, label: string, options: { value: string; label: string }[]) => <LuxurySelect key={key} label={label} value={String(filters[key] ?? '')} options={[{ value: '', label: 'همه' }, ...options]} onChange={value => onChange({ [key]: value ? key === 'volumeMl' ? Number(value) : value : undefined })} />;
  const entries = (labels: Record<string, string>) => Object.entries(labels).map(([value, label]) => ({ value, label }));
  const volumes = [...new Set(products.flatMap(p => p.variants.map(v => v.volumeMl)))].sort((a, b) => a - b);
  return <details className="advanced-filters">
    <summary>فیلترهای پیشرفته</summary>
    <div className="filter-fields">
      {select('brandId', 'برند', brands.map(b => ({ value: b.id, label: b.name })))}
      {select('audience', 'مخاطب', entries(audienceLabels))}
      {select('familyId', 'خانوادهٔ بویایی', fragranceFamilies.map(f => ({ value: f.id, label: f.name })))}
      {select('concentration', 'غلظت', ['EDT', 'EDP', 'Parfum', 'Extrait'].map(value => ({ value, label: value })))}
      {select('volumeMl', 'حجم', volumes.map(v => ({ value: String(v), label: new Intl.NumberFormat('fa-IR').format(v) + ' میلی‌لیتر' })))}
      <label>حداقل قیمت (تومان)<input type="number" inputMode="numeric" min="0" step="100000" value={filters.minPrice ?? ''} onChange={e => onChange({ minPrice: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)) })} /></label>
      <label>حداکثر قیمت (تومان)<input type="number" inputMode="numeric" min="0" step="100000" value={filters.maxPrice ?? ''} onChange={e => onChange({ maxPrice: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)) })} /></label>
      {select('temperature', 'طبع نمایشی', entries(temperatureLabels))}
      {select('sweetness', 'شیرینی نمایشی', entries(sweetnessLabels))}
      {select('season', 'فصل پیشنهادی', entries(seasonLabels))}
      {select('occasion', 'موقعیت پیشنهادی', entries(occasionLabels))}
      {select('stock', 'وضعیت موجودی نمایشی', entries(stockLabels))}
      {select('productType', 'نوع محصول', entries(productTypeLabels))}
    </div>
    {filters.minPrice !== undefined && filters.maxPrice !== undefined && filters.minPrice > filters.maxPrice && <p className="field-error" role="alert">حداقل قیمت باید کمتر یا مساوی حداکثر قیمت باشد.</p>}
    <p className="fine-print">حجم، غلظت، قیمت و موجودی روی یک نسخهٔ مشترک از محصول تطبیق داده می‌شوند. همهٔ اطلاعات تجاری نمایشی‌اند.</p>
  </details>;
}
