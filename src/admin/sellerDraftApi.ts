import type { UsageAttributes } from './usageOptions';

export interface FamilyOption { id: string; name: string; notes: { id: string; name: string }[] }

export interface SellerProductDraft extends UsageAttributes {
  id: string;
  name: string;
  brandName: string;
  familyId: string | null;
  noteIds: string[];
  status: 'پیش‌نویس';
  updatedAt: number;
}

const endpoint = import.meta.env.BASE_URL + 'api/v1/seller/products/';

async function request(url: string, options?: RequestInit) {
  const response = await fetch(url, { ...options, credentials: 'same-origin', cache: 'no-store' });
  if (response.status === 403) throw new Error('دسترسی یا نشست معتبر نیست. وضعیت ورود و مجوز حساب را بررسی کن.');
  return response;
}

export const sellerDraftApi = {
  async list(): Promise<SellerProductDraft[]> {
    const response = await request(endpoint);
    if (!response.ok) throw new Error('دریافت فهرست پیش‌نویس‌ها ناموفق بود.');
    return response.json();
  },
  async get(id: string): Promise<SellerProductDraft | null> {
    const response = await request(endpoint + encodeURIComponent(id) + '/');
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('دریافت پیش‌نویس ناموفق بود.');
    return response.json();
  },
  async brands(): Promise<{ name: string }[]> {
    const response = await request(import.meta.env.BASE_URL + 'api/v1/seller/brands/');
    if (!response.ok) throw new Error('دریافت برندها ناموفق بود.');
    return response.json();
  },
  async families(signal?: AbortSignal): Promise<FamilyOption[]> {
    const response = await request(import.meta.env.BASE_URL + 'api/v1/seller/fragrance-families/', { signal });
    if (!response.ok) throw new Error('دریافت خانواده‌های رایحه ناموفق بود.');
    return response.json();
  },
  async save(name: string, csrfToken: string, id?: string, brandName?: string, familyId?: string | null, noteIds?: string[], usage?: UsageAttributes): Promise<SellerProductDraft> {
    const url = id ? endpoint + encodeURIComponent(id) + '/' : endpoint;
    const response = await request(url, {
      method: id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
      body: JSON.stringify({ name, brandName, familyId, noteIds, ...usage }),
    });
    if (response.status === 400) {
      const errors = await response.json();
      if (errors.seasons || errors.occasions || errors.dayTimes) {
        const invalid = [errors.seasons && 'فصل مناسب', errors.occasions && 'موقعیت استفاده', errors.dayTimes && 'زمان استفاده'].filter(Boolean);
        throw new Error('گزینه‌های این بخش‌ها معتبر نیستند: ' + invalid.join('، '));
      }
      if (errors.familyId) throw new Error('خانوادهٔ رایحهٔ انتخاب‌شده معتبر نیست.');
      if (errors.noteIds) throw new Error(errors.noteIds.includes('Select at most four notes.')
        ? 'برای هر محصول حداکثر ۴ نت انتخاب کن.'
        : 'بعضی نت‌ها برای خانوادهٔ رایحهٔ انتخاب‌شده معتبر نیستند.');
    }
    if (response.status === 404) throw new Error('این پیش‌نویس دیگر در دسترس نیست.');
    if (!response.ok) throw new Error('ذخیرهٔ پیش‌نویس ناموفق بود. ورودی شما حفظ شده است.');
    return response.json();
  },
};
