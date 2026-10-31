import {usageFields,splitUsage} from './usageOptions';
import { validateAdminProduct, type AdminProduct, type AdminRecord, type AdminState } from './model';

export const NEW_BRAND_OPTION = 'افزودن برند جدید…';
export const NEW_FAMILY_OPTION = 'افزودن خانوادهٔ رایحهٔ جدید…';

const recordName = (value: string) => value.trim().replace(/\s+/gu, ' ');
const recordKey = (value: string) => value.normalize('NFKC').toLocaleLowerCase('fa-IR')
  .replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/[\s\u200c]+/gu, ' ').trim();

export function validateProductDraft(values: Record<string, string>): Record<string, string> {
  const creatingBrand = values.brand === NEW_BRAND_OPTION;
  const creatingFamily = values.family === NEW_FAMILY_OPTION;
  const name = creatingBrand ? recordName(values.newBrand ?? '') : (values.brand ?? '').trim();
  const familyName = creatingFamily ? recordName(values.newFamily ?? '') : (values.family ?? '').trim();
  const errors = validateAdminProduct({ name: values.name ?? '', brand: name, family: familyName, notes: values.notes ?? '' });
  if (creatingBrand) {
    delete errors.brand;
    if (name.length < 2 || name.length > 180) errors.newBrand = 'نام برند جدید باید بین ۲ تا ۱۸۰ نویسه باشد.';
  }
  if (creatingFamily) {
    delete errors.family;
    if (familyName.length < 2 || familyName.length > 180) errors.newFamily = 'نام خانوادهٔ رایحهٔ جدید باید بین ۲ تا ۱۸۰ نویسه باشد.';
  }
  if((values.notes??'').split(/[,،]/).filter(n=>n.trim()).length>4)errors.notes='حداکثر ۴ نت انتخاب کنید.';
  for(const f of usageFields)if(values[f.key]!==undefined&&splitUsage(values[f.key]).some(v=>!f.options.includes(v)))errors[f.key]='از گزینه‌های موجود انتخاب کنید.';
  if(values.audience!==undefined&&!['زنانه','مردانه','یونیسکس'].includes(values.audience))errors.audience='مخاطب عطر را انتخاب کنید.';
  if (!['فعال', 'پیش‌نویس'].includes(values.status ?? '')) errors.status = 'وضعیت انتشار را از فهرست انتخاب کنید.';
  return errors;
}

/** Save the product and optional library records in one immutable demo-state update. */
export function saveProductDraft(
  state: AdminState,
  values: Record<string, string>,
  ids: { product: string; brand: string; variant: string; family?: string },
  existingId?: string,
): AdminState {
  if (Object.keys(validateProductDraft(values)).length) return state;
  const existing = existingId === undefined ? undefined : state.products.find(product => product.id === existingId);
  if (existingId !== undefined && !existing) return state;
  const families = state.records.families ?? [];
  const creatingFamily = values.family === NEW_FAMILY_OPTION;
  const requestedFamilyName = recordName(creatingFamily ? values.newFamily : values.family);
  const family = families.find(record => recordKey(record.name) === recordKey(requestedFamilyName));
  if (!creatingFamily && !family) return state;
  if (!family && (!ids.family || families.some(record => record.id === ids.family))) return state;

  const brands = state.records.brands ?? [];
  const creatingBrand = values.brand === NEW_BRAND_OPTION;
  const requestedName = recordName(creatingBrand ? values.newBrand : values.brand);
  const matched = brands.find(record => recordKey(record.name) === recordKey(requestedName));
  if (!creatingBrand && !matched) return state;
  if (!existing && (!ids.product || !ids.variant || state.products.some(product => product.id === ids.product))) return state;
  if (!matched && (!ids.brand || brands.some(record => record.id === ids.brand))) return state;

  const newBrand: AdminRecord | undefined = matched ? undefined : {
    id: ids.brand,
    name: requestedName,
    detail: values.newBrandDetail?.trim() || 'برند جدید؛ ثبت هم‌زمان با محصول آزمایشی',
    status: 'فعال',
    value: '',
  };
  const newFamily: AdminRecord | undefined = family ? undefined : {
    id: ids.family!,
    name: requestedFamilyName,
    detail: values.newFamilyDetail?.trim() || 'خانوادهٔ رایحهٔ جدید؛ ثبت هم‌زمان با محصول آزمایشی',
    status: 'فعال',
    value: values.newFamilyEnglish?.trim() ?? '',
  };
  const product: AdminProduct = {
    id: existing?.id ?? ids.product,
    name: values.name.trim(),
    brand: matched?.name ?? newBrand!.name,
    family: family?.name ?? newFamily!.name,
    notes: values.notes.trim(),
    seasons:values.seasons===undefined?existing?.seasons??[]:splitUsage(values.seasons),
    occasions:values.occasions===undefined?existing?.occasions??[]:splitUsage(values.occasions),
    dayTimes:values.dayTimes===undefined?existing?.dayTimes??[]:splitUsage(values.dayTimes),
    audience: values.audience ?? existing?.audience ?? 'یونیسکس',
    status: values.status,
    image: existing?.image ?? '/images/hero-editorial.svg',
    variants: existing?.variants ?? [{ id: ids.variant, volume: 50, price: 5000000, stock: 0 }],
  };
  return {
    ...state,
    products: existing ? state.products.map(item => item.id === existing.id ? product : item) : [product, ...state.products],
    records: newBrand || newFamily ? {
      ...state.records,
      ...(newBrand ? { brands: [newBrand, ...brands] } : {}),
      ...(newFamily ? { families: [newFamily, ...families] } : {}),
    } : state.records,
  };
}
