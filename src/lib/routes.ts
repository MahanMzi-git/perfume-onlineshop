import { brands } from '../data/brands';
import { fragranceFamilies } from '../data/fragranceFamilies';
import { scentNotes } from '../data/scentNotes';
import type { Filters, SortOrder } from '../types/product';
import { audienceLabels, occasionLabels, seasonLabels, sortLabels, stockLabels, sweetnessLabels, temperatureLabels, productTypeLabels } from '../data/catalogLabels';

export type PageName = 'home' | 'catalog' | 'product' | 'families' | 'family' | 'notes' | 'note' | 'compare' | 'not-found';
export interface Route { page: PageName; slug?: string; params: URLSearchParams }
export function parseRoute(hash: string): Route {
  if (!hash.startsWith('#/')) return { page: 'home', params: new URLSearchParams() };
  const [path, query = ''] = hash.slice(2).split('?');
  const segments = path.split('/').filter(Boolean);
  const params = new URLSearchParams(query);
  if (segments.length === 1 && ['catalog', 'families', 'notes', 'compare'].includes(segments[0])) {
    return { page: segments[0] as PageName, params };
  }
  if (segments.length === 2 && ['product', 'families', 'notes'].includes(segments[0])) {
    return { page: segments[0] === 'product' ? 'product' : segments[0] === 'families' ? 'family' : 'note', slug: segments[1], params };
  }
  return { page: 'not-found', params };
}
function validValue<T extends string>(value: string | null, labels: Record<T, string>): T | undefined {
  return value && Object.prototype.hasOwnProperty.call(labels, value) ? value as T : undefined;
}
export function filtersFromParams(params: URLSearchParams): Filters {
  const number = (key: string) => {
    const raw = params.get(key);
    const value = Number(raw);
    return raw !== null && raw !== '' && Number.isFinite(value) && value >= 0 ? value : undefined;
  };
  const concentration = params.get('concentration');
  return {
    query: (params.get('query') ?? '').slice(0, 120),
    brandId: brands.find(b => b.id === params.get('brandId'))?.id, familyId: fragranceFamilies.find(f => f.id === params.get('familyId'))?.id,
    noteIds: [...new Set((params.get('noteIds') ?? '').split(',').filter(id => scentNotes.some(note => note.id === id)))].slice(0, 30),
    audience: validValue(params.get('audience'), audienceLabels),
    concentration: concentration && ['EDT', 'EDP', 'Parfum', 'Extrait'].includes(concentration) ? concentration as Filters['concentration'] : undefined,
    minPrice: number('minPrice'), maxPrice: number('maxPrice'), volumeMl: number('volumeMl') || undefined,
    temperature: validValue(params.get('temperature'), temperatureLabels),
    sweetness: validValue(params.get('sweetness'), sweetnessLabels),
    season: validValue(params.get('season'), seasonLabels), occasion: validValue(params.get('occasion'), occasionLabels),
    stock: validValue(params.get('stock'), stockLabels), productType: validValue(params.get('productType'), productTypeLabels),
    niche: params.get('niche') === 'true' || undefined,
    featured: params.get('featured') === 'true' || undefined,
    bestseller: params.get('bestseller') === 'true' || undefined,
    giftSet: params.get('giftSet') === 'true' || undefined,
  };
}
export function catalogHref(filters: Partial<Filters> = {}, extras: { sort?: SortOrder; page?: number; wishlist?: boolean } = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) { if (value.length) params.set(key, value.join(',')); }
    else if (value !== undefined && value !== '') params.set(key, String(value));
  });
  if (extras.sort && extras.sort !== 'recommended') params.set('sort', extras.sort);
  if (extras.page && extras.page > 1) params.set('page', String(extras.page));
  if (extras.wishlist) params.set('wishlist', '1');
  const query = params.toString();
  return '#/catalog' + (query ? '?' + query : '');
}
export function sortFromParams(params: URLSearchParams): SortOrder {
  return validValue(params.get('sort'), sortLabels) ?? 'recommended';
}
export function comparisonHref(ids: string[]) { return '#/compare?ids=' + ids.join(','); }
