import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertCircle, ArrowUpLeft, Check, Clock3, FilePlus2, Package, RefreshCw, Save, ShieldCheck } from 'lucide-react';
import { AdminBadge, Panel } from './AdminUI';
import { createMockSellerDraftApi, sellerDraftApi, type SellerProductDraft } from './sellerDraftApi';

const listHref = '#/seller/products';
const createHref = '#/seller/product-new';
const editHref = (id: string) => '#/seller/products/' + encodeURIComponent(id);
const date = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' });
const localizedNumber = new Intl.NumberFormat('fa-IR');

function DraftEmptyState({ onCreate, preview = false }: { onCreate?: () => void; preview?: boolean }) {
  return <div className="admin-draft-empty">
    <span className="admin-draft-empty-icon"><Package size={22} aria-hidden="true" /></span>
    <h3>{preview ? 'نمایش فهرست خالی' : 'هنوز پیش‌نویسی نساخته‌ای'}</h3>
    <p>{preview ? 'با بازگشت به نمایش عادی، پیش‌نویس‌های نمونه را می‌بینی.' : 'نام اولیهٔ محصول را ثبت کن؛ جزئیات دیگر بعداً به این پیش‌نویس اضافه می‌شوند.'}</p>
    {onCreate && <a className="admin-primary" href={createHref}><FilePlus2 size={16} aria-hidden="true" />ساخت پیش‌نویس</a>}
  </div>;
}

function DraftLoadError({ onRetry }: { onRetry: () => void }) {
  return <div className="admin-draft-state admin-draft-error" role="alert">
    <AlertCircle size={21} aria-hidden="true" />
    <div><strong>فهرست پیش‌نویس‌ها دریافت نشد</strong><p>اتصال آزمایشی را بررسی کن و دوباره تلاش کن.</p></div>
    <button type="button" onClick={onRetry}><RefreshCw size={15} aria-hidden="true" />تلاش دوباره</button>
  </div>;
}

export function SellerDrafts({ previewState = 'normal', onRetryPreview }: { previewState?: string; onRetryPreview: () => void }) {
  const [drafts, setDrafts] = useState<SellerProductDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setDrafts(await sellerDraftApi.list()); }
    catch { setError('خواندن فهرست پیش‌نویس‌ها با Mock ناموفق بود.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (previewState === 'normal') void load(); }, [load, previewState, reloadKey]);

  return <Panel title="پیش‌نویس‌های محصول">
    <div className="admin-drafts-intro"><p>محصول‌های ناتمام اینجا می‌مانند؛ برای ادامه، هر پیش‌نویس را باز کن.</p><a className="admin-primary" href={createHref}><FilePlus2 size={16} aria-hidden="true" />پیش‌نویس جدید</a></div>
    {previewState === 'loading' ? <div className="admin-draft-skeleton" role="status" aria-label="در حال دریافت پیش‌نویس‌ها"><span/><span/><span/></div>
      : previewState === 'empty' ? <DraftEmptyState preview />
      : previewState === 'error' ? <DraftLoadError onRetry={onRetryPreview} />
      : loading ? <div className="admin-draft-skeleton" role="status" aria-label="در حال دریافت پیش‌نویس‌ها"><span/><span/><span/></div>
      : error ? <DraftLoadError onRetry={() => setReloadKey(key => key + 1)} />
      : drafts.length === 0 ? <DraftEmptyState onCreate={() => undefined} />
      : <>
        <ul className="admin-draft-list" aria-label="فهرست پیش‌نویس‌ها">{drafts.map(draft => <li key={draft.id}>
          <article className="admin-draft-row">
            <span className="admin-draft-mark"><Package size={19} aria-hidden="true" /></span>
            <div className="admin-draft-copy"><h3><a href={editHref(draft.id)}>{draft.name}</a></h3><p><span dir="ltr">{draft.id}</span><span><Clock3 size={13} aria-hidden="true" />آخرین تغییر {date.format(draft.updatedAt)}</span></p></div>
            <AdminBadge>پیش‌نویس</AdminBadge>
            <a className="admin-draft-open" href={editHref(draft.id)}>ادامهٔ ویرایش <ArrowUpLeft size={15} aria-hidden="true" /></a>
          </article>
        </li>)}</ul>
        <p className="admin-draft-count"><span>{localizedNumber.format(drafts.length)} پیش‌نویس</span><span>ذخیرهٔ آزمایشی در همین مرورگر</span></p>
      </>}
  </Panel>;
}

export function SellerDraftEditor({ id, editable, mockSaveError = false }: { id?: string; editable: boolean; mockSaveError?: boolean }) {
  const api = useMemo(() => mockSaveError ? createMockSellerDraftApi({ failWrites: true }) : sellerDraftApi, [mockSaveError]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(!!id);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setLoadError('');
    try {
      const found = await sellerDraftApi.get(id);
      if (!found) { setLoadError('این پیش‌نویس در فهرست پیدا نشد.'); return; }
      setName(found.name);
    } catch { setLoadError('دریافت پیش‌نویس ناموفق بود. دوباره تلاش کن.'); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { if (id) void load(); }, [id, load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editable || saving) return;
    const normalized = name.trim();
    if (!normalized) { setNameError('نام محصول را وارد کن.'); return; }
    if (normalized.length > 180) { setNameError('نام محصول نمی‌تواند بیشتر از ۱۸۰ نویسه باشد.'); return; }
    setNameError('');
    setSaveError('');
    setSaving(true);
    try {
      const result = id ? await api.update(id, normalized) : await api.create(normalized);
      setName(result.name);
      setSaved(true);
      if (!id) location.hash = editHref(result.id);
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : 'ذخیرهٔ پیش‌نویس ناموفق بود. ورودی شما حفظ شده است.');
    } finally { setSaving(false); }
  }

  if (loading) return <Panel title="دریافت پیش‌نویس"><div className="admin-draft-skeleton" role="status" aria-label="در حال دریافت پیش‌نویس"><span/></div></Panel>;
  if (loadError) return <Panel title="پیش‌نویس در دسترس نیست"><DraftLoadError onRetry={() => void load()} /><div className="admin-actions"><a href={listHref}>بازگشت به فهرست پیش‌نویس‌ها</a></div></Panel>;

  return <Panel title={id ? 'ویرایش پیش‌نویس' : 'ساخت پیش‌نویس'}>
    <div className="admin-draft-editor-head"><a href={listHref}><ArrowUpLeft size={15} aria-hidden="true" />فهرست پیش‌نویس‌ها</a><AdminBadge>{editable ? 'امکان ویرایش' : 'فقط خواندن'}</AdminBadge></div>
    {saveError && <p className="admin-draft-state admin-draft-error" role="alert"><AlertCircle size={18} aria-hidden="true" />{saveError}</p>}
    {saved && <p className="admin-draft-saved" role="status"><Check size={16} aria-hidden="true" />نام پیش‌نویس ذخیره شد.</p>}
    <form className="admin-draft-form" onSubmit={submit} noValidate>
      <div className="admin-draft-field">
        <div className="admin-draft-label-row"><label htmlFor="draft-product-name">نام محصول <span aria-hidden="true">*</span></label><small>{localizedNumber.format(name.trim().length)} / ۱۸۰</small></div>
        <input id="draft-product-name" value={name} onChange={event => { setName(event.currentTarget.value); setNameError(''); setSaveError(''); setSaved(false); }} disabled={!editable || saving} aria-invalid={!!nameError} aria-describedby={nameError ? 'draft-name-error' : 'draft-name-hint'} placeholder="مثلاً عطر چوبی جدید" />
        {nameError ? <p id="draft-name-error" className="admin-error">{nameError}</p> : <p id="draft-name-hint" className="admin-field-hint">نام پس از حذف فاصله‌های ابتدا و انتها ذخیره می‌شود.</p>}
      </div>
      <div className="admin-draft-status"><span>وضعیت انتشار</span><AdminBadge>پیش‌نویس</AdminBadge><small>این مرحله فقط پیش‌نویس می‌سازد؛ انتشار در گام جداگانه انجام می‌شود.</small></div>
      {!editable && <p className="admin-draft-readonly-note"><ShieldCheck size={17} aria-hidden="true" />این نقش فقط اجازهٔ مشاهدهٔ پیش‌نویس را دارد.</p>}
      <button className="admin-primary" type="submit" disabled={!editable || saving}>{saving ? <><span className="admin-draft-spinner" aria-hidden="true"/>در حال ذخیره…</> : saved ? <><Check size={16} aria-hidden="true"/>ذخیره شد</> : <><Save size={16} aria-hidden="true"/>{id ? 'ذخیرهٔ تغییر نام' : 'ساخت پیش‌نویس'}</>}</button>
    </form>
    <section className="admin-draft-next-steps" aria-labelledby="draft-next-title">
      <div><span className="admin-draft-step-number">۲</span><div><h3 id="draft-next-title">اطلاعات تکمیلی محصول</h3><p>برند، خانوادهٔ رایحه، نت‌ها و ویژگی‌های مصرف در مرحلهٔ تطبیق با مدل داده هستند.</p></div><AdminBadge>در گام بعد</AdminBadge></div>
      <div><span className="admin-draft-step-number">۳</span><div><h3>نسخه، عکس و قیمت</h3><p>نسخه‌ها، تصاویر و قیمت تا آماده‌شدن مسیر ذخیره، جدا از این پیش‌نویس نگه داشته می‌شوند.</p></div><AdminBadge>در گام بعد</AdminBadge></div>
    </section>
  </Panel>;
}
