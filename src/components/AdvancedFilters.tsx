import { brands } from '../data/brands';
import { fragranceFamilies } from '../data/fragranceFamilies';
import { products } from '../data/products';
import { audienceLabels, occasionLabels, productTypeLabels, seasonLabels, stockLabels, sweetnessLabels, temperatureLabels } from '../data/catalogLabels';
import type { Filters } from '../types/product';
import { LuxurySelect } from './LuxurySelect';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { FilterChoices } from './FilterChoices';
import { PriceRange } from './PriceRange';

interface Props { study?:boolean; lockedKeys?: (keyof Filters)[]; filters: Filters; onChange: (patch: Partial<Filters>) => void }
export function AdvancedFilters({ filters, onChange, lockedKeys = [], study=false }: Props) {
  const select = (key: keyof Filters, label: string, options: { value: string; label: string }[]) => lockedKeys.includes(key) ? null : <LuxurySelect key={key} label={label} value={String(filters[key] ?? '')} options={[{ value: '', label: 'همه' }, ...options]} onChange={value => onChange({ [key]: value ? key === 'volumeMl' ? Number(value) : value : undefined })} />;
  const entries = (labels: Record<string, string>) => Object.entries(labels).map(([value, label]) => ({ value, label }));
  const volumes = [...new Set(products.flatMap(p => p.variants.map(v => v.volumeMl)))].sort((a, b) => a - b);
  const activeCount = Object.entries(filters).filter(([key,value]) => !['query','noteIds'].includes(key) && !lockedKeys.includes(key as keyof Filters) && value !== undefined && value !== '' && value !== false).length;
  return <details className="advanced-filters filter-disclosure">
    <summary><span className="filter-disclosure-icon"><SlidersHorizontal size={19} aria-hidden="true" /></span><span className="filter-disclosure-copy"><span className="filter-disclosure-title">فیلترهای پیشرفته</span><span className="filter-disclosure-hint">برند، حجم، قیمت و حال‌وهوای رایحه</span></span>{activeCount > 0 && <span className="filter-disclosure-count">{new Intl.NumberFormat('fa-IR').format(activeCount)} فعال</span>}<ChevronDown className="filter-disclosure-chevron" size={18} aria-hidden="true" /></summary>
    <div className="filter-fields">
      {select('brandId', 'برند', brands.map(b => ({ value: b.id, label: b.name })))}
      {select('audience', 'مخاطب', entries(audienceLabels))}
      {select('familyId', 'خانوادهٔ بویایی', fragranceFamilies.map(f => ({ value: f.id, label: f.name })))}
      {select('concentration', 'غلظت', ['EDT', 'EDP', 'Parfum', 'Extrait'].map(value => ({ value, label: value })))}
      {select('volumeMl', 'حجم', volumes.map(v => ({ value: String(v), label: new Intl.NumberFormat('fa-IR').format(v) + ' میلی‌لیتر' })))}
      {study ? <PriceRange min={filters.minPrice} max={filters.maxPrice} ceiling={Math.max(...products.flatMap(p=>p.variants.map(v=>v.price)))} onChange={onChange}/> : <><label>حداقل قیمت (تومان)<input placeholder="مبلغ به تومان" type="number" inputMode="numeric" min="0" step="100000" value={filters.minPrice ?? ''} onChange={e => onChange({ minPrice: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)) })} /></label>
      <label>حداکثر قیمت (تومان)<input placeholder="مبلغ به تومان" type="number" inputMode="numeric" min="0" step="100000" value={filters.maxPrice ?? ''} onChange={e => onChange({ maxPrice: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)) })} /></label></>}
      {select('temperature', 'طبع نمایشی', entries(temperatureLabels))}
      {select('sweetness', 'شیرینی نمایشی', entries(sweetnessLabels))}
      {study ? !lockedKeys.includes('season')&&<FilterChoices label="فصل پیشنهادی" labels={seasonLabels} value={filters.season} onChange={value=>onChange({season:value as Filters['season']})}/> : select('season', 'فصل پیشنهادی', entries(seasonLabels))}
      {study ? !lockedKeys.includes('occasion')&&<FilterChoices label="موقعیت پیشنهادی" labels={occasionLabels} value={filters.occasion} onChange={value=>onChange({occasion:value as Filters['occasion']})}/> : select('occasion', 'موقعیت پیشنهادی', entries(occasionLabels))}
      {select('stock', 'وضعیت موجودی نمایشی', entries(stockLabels))}
      {study ? !lockedKeys.includes('productType')&&<FilterChoices label="نوع محصول" labels={productTypeLabels} value={filters.productType} onChange={value=>onChange({productType:value as Filters['productType']})}/> : select('productType', 'نوع محصول', entries(productTypeLabels))}
    </div>
    {filters.minPrice !== undefined && filters.maxPrice !== undefined && filters.minPrice > filters.maxPrice && <p className="field-error" role="alert">حداقل قیمت باید کمتر یا مساوی حداکثر قیمت باشد.</p>}
    <p className="fine-print">حجم، غلظت، قیمت و موجودی روی یک نسخهٔ مشترک از محصول تطبیق داده می‌شوند. همهٔ اطلاعات تجاری نمایشی‌اند.</p>
  </details>;
}
