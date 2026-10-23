import { iranProvinces } from '../data/iranLocations';
export type FieldValues = Record<string, string>;
export interface CustomerField { name: string; label: string; kind?: 'email' | 'phone' | 'postal' | 'textarea' | 'province' | 'city'; optional?: boolean; min?: number }
export const contactFields: CustomerField[] = [{ name: 'name', label: 'نام گیرنده', min: 2 }, { name: 'phone', label: 'شماره همراه', kind: 'phone' }, { name: 'email', label: 'ایمیل (اختیاری)', kind: 'email', optional: true }];
export const addressFields: CustomerField[] = [{ name: 'province', label: 'استان', kind:'province' }, { name: 'city', label: 'شهر', kind:'city' }, { name: 'address', label: 'نشانی، پلاک و واحد', kind: 'textarea', min: 10 }, { name: 'postal', label: 'کد پستی ۱۰ رقمی', kind: 'postal' }];
export function latinDigits(value: string) { return value.replace(/[۰-۹]/g, char => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(char))).replace(/[٠-٩]/g, char => String('٠١٢٣٤٥٦٧٨٩'.indexOf(char))); }
export function validateFields(fields: CustomerField[], values: FieldValues) {
  const errors: FieldValues = {};
  for (const field of fields) {
    const value = (values[field.name] ?? '').trim();
    if (!value && field.optional) continue;
    if (!value) errors[field.name] = `${field.label} را وارد کنید.`;
    else if (value.length > 500) errors[field.name] = 'متن را کوتاه‌تر از ۵۰۰ نویسه وارد کنید.';
    else if (field.kind === 'province' && !iranProvinces.some(item => item.name === value)) errors[field.name] = 'استان را از فهرست انتخاب کنید.';
    else if (field.kind === 'city' && !iranProvinces.find(item => item.name === values.province)?.cities.includes(value)) errors[field.name] = 'شهر را از فهرست استان انتخاب‌شده انتخاب کنید.';
    else if (field.kind === 'phone' && !/^09\d{9}$/.test(latinDigits(value))) errors[field.name] = 'شماره همراه ۱۱ رقمی با ۰۹ وارد کنید.';
    else if (field.kind === 'postal' && !/^\d{10}$/.test(latinDigits(value))) errors[field.name] = 'کد پستی باید ۱۰ رقم باشد.';
    else if (field.kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[field.name] = 'ایمیل معتبر وارد کنید.';
    else if (value.length < (field.min ?? 1)) errors[field.name] = `حداقل ${field.min} نویسه وارد کنید.`;
  }
  return errors;
}
