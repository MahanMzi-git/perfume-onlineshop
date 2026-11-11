export interface SellerProductDraft {
  id: string;
  name: string;
  status: 'پیش‌نویس';
  updatedAt: number;
}

/** Contract for the seller draft API planned at /api/v1/seller/products/. */
export interface SellerDraftApi {
  list(): Promise<SellerProductDraft[]>;
  get(id: string): Promise<SellerProductDraft | null>;
  create(name: string): Promise<SellerProductDraft>;
  update(id: string, name: string): Promise<SellerProductDraft>;
}

const storageKey = 'aroma-seller-product-drafts-v1';
export const sellerProductsEndpoint = '/api/v1/seller/products/';
export const sellerProductEndpoint = (id: string) => sellerProductsEndpoint + encodeURIComponent(id) + '/';
const demoDrafts: SellerProductDraft[] = [
  { id: 'draft-demo-01', name: 'عطر چوبی جدید', status: 'پیش‌نویس', updatedAt: Date.UTC(2026, 10, 8) },
  { id: 'draft-demo-02', name: 'رایحهٔ تازهٔ بهاری', status: 'پیش‌نویس', updatedAt: Date.UTC(2026, 10, 6) },
];

function readDrafts(): SellerProductDraft[] {
  const stored = window.localStorage.getItem(storageKey);
  if (stored === null) return demoDrafts.map(draft => ({ ...draft }));
  const value: unknown = JSON.parse(stored);
  if (!Array.isArray(value)) throw new Error('ساختار فهرست پیش‌نویس‌ها معتبر نیست.');
  return value.filter((item): item is SellerProductDraft =>
    !!item && typeof item === 'object' && typeof item.id === 'string' && typeof item.name === 'string' &&
    item.status === 'پیش‌نویس' && Number.isFinite(item.updatedAt),
  ).map(draft => ({ ...draft }));
}

function writeDrafts(drafts: SellerProductDraft[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(drafts));
}

const pause = () => new Promise<void>(resolve => window.setTimeout(resolve, 120));

/** Replace this mock with the HTTP adapter once Django's seller API is ready. */
export function createMockSellerDraftApi({ failWrites = false }: { failWrites?: boolean } = {}): SellerDraftApi {
  return {
    async list() { await pause(); return readDrafts(); },
    async get(id) { await pause(); return readDrafts().find(draft => draft.id === id) ?? null; },
    async create(name) {
      await pause();
      if (failWrites) throw new Error('ذخیرهٔ پیش‌نویس در سرویس آزمایشی ناموفق بود. ورودی شما حفظ شده است.');
      const drafts = readDrafts();
      const draft: SellerProductDraft = { id: `draft-${crypto.randomUUID()}`, name, status: 'پیش‌نویس', updatedAt: Date.now() };
      writeDrafts([draft, ...drafts]);
      return draft;
    },
    async update(id, name) {
      await pause();
      if (failWrites) throw new Error('ذخیرهٔ پیش‌نویس در سرویس آزمایشی ناموفق بود. ورودی شما حفظ شده است.');
      const drafts = readDrafts();
      const current = drafts.find(draft => draft.id === id);
      if (!current) throw new Error('این پیش‌نویس در فهرست پیدا نشد.');
      const updated = { ...current, name, updatedAt: Date.now() };
      writeDrafts(drafts.map(draft => draft.id === id ? updated : draft));
      return updated;
    },
  };
}

export const sellerDraftApi = createMockSellerDraftApi();
