import { UsageChoices } from './UsageChoices';
import { usageCodes, usageFields, usageLabel, type UsageAttributes } from './usageOptions';
import { NotePicker } from './NotePicker';
import { FragranceFamilyPicker } from './FragranceFamilyPicker';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, ArrowUpLeft, Clock3, FilePlus2, Package, RefreshCw, Save, ShieldCheck } from 'lucide-react';
import { AdminBadge, Panel } from './AdminUI';
import { sellerDraftApi, type FamilyOption, type SellerProductDraft } from './sellerDraftApi';

const listHref = '#/seller/products';
const createHref = '#/seller/product-new';
const editHref = (id: string) => '#/seller/products/' + encodeURIComponent(id);
const date = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' });
const localizedNumber = new Intl.NumberFormat('fa-IR');

function DraftEmptyState({ canCreate, preview = false }: { canCreate?: boolean; preview?: boolean }) {
  return <div className="admin-draft-empty">
    <span className="admin-draft-empty-icon"><Package size={22} aria-hidden="true" /></span>
    <h3>{preview ? 'نمایش فهرست خالی' : 'هنوز پیش‌نویسی نساخته‌ای'}</h3>
    <p>{preview ? 'با بازگشت به نمایش عادی، فهرست پیش‌نویس‌ها را می‌بینی.' : 'نام اولیهٔ محصول را ثبت کن؛ جزئیات دیگر بعداً به این پیش‌نویس اضافه می‌شوند.'}</p>
    {canCreate && <a className="admin-primary" href={createHref}><FilePlus2 size={16} aria-hidden="true" />ساخت پیش‌نویس</a>}
  </div>;
}

function DraftLoadError({ onRetry }: { onRetry: () => void }) {
  return <div className="admin-draft-state admin-draft-error" role="alert">
    <AlertCircle size={21} aria-hidden="true" />
    <div><strong>فهرست پیش‌نویس‌ها دریافت نشد</strong><p>دوباره تلاش کن.</p></div>
    <button type="button" onClick={onRetry}><RefreshCw size={15} aria-hidden="true" />تلاش دوباره</button>
  </div>;
}

export function SellerDrafts({ canCreate, previewState = 'normal', onRetryPreview }: { canCreate: boolean; previewState?: string; onRetryPreview: () => void }) {
  const [drafts, setDrafts] = useState<SellerProductDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setDrafts(await sellerDraftApi.list()); }
    catch { setError('خواندن فهرست پیش‌نویس‌ها ناموفق بود.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (previewState === 'normal') void load(); }, [load, previewState, reloadKey]);

  return <Panel title="پیش‌نویس‌های محصول">
    <div className="admin-drafts-intro"><p>محصول‌های ناتمام اینجا می‌مانند؛ برای ادامه، هر پیش‌نویس را باز کن.</p>{canCreate && <a className="admin-primary" href={createHref}><FilePlus2 size={16} aria-hidden="true" />پیش‌نویس جدید</a>}</div>
    {previewState === 'loading' ? <div className="admin-draft-skeleton" role="status" aria-label="در حال دریافت پیش‌نویس‌ها"><span/><span/><span/></div>
      : previewState === 'empty' ? <DraftEmptyState preview />
      : previewState === 'error' ? <DraftLoadError onRetry={onRetryPreview} />
      : loading ? <div className="admin-draft-skeleton" role="status" aria-label="در حال دریافت پیش‌نویس‌ها"><span/><span/><span/></div>
      : error ? <DraftLoadError onRetry={() => setReloadKey(key => key + 1)} />
      : drafts.length === 0 ? <DraftEmptyState canCreate={canCreate} />
      : <>
        <ul className="admin-draft-list" aria-label="فهرست پیش‌نویس‌ها">{drafts.map(draft => <li key={draft.id}>
          <a className="admin-draft-row" href={editHref(draft.id)}>
            <span className="admin-draft-mark"><Package size={19} aria-hidden="true" /></span>
            <div className="admin-draft-copy"><h3>{draft.name}</h3><p><span dir="ltr">{draft.id}</span><span><Clock3 size={13} aria-hidden="true" />آخرین تغییر {date.format(draft.updatedAt)}</span></p></div>
            <AdminBadge>پیش‌نویس</AdminBadge>
            <span className="admin-draft-open" aria-hidden="true">باز کردن پیش‌نویس <ArrowUpLeft size={15} aria-hidden="true" /></span>
          </a>
        </li>)}</ul>
        <p className="admin-draft-count"><span>{localizedNumber.format(drafts.length)} پیش‌نویس</span></p>
      </>}
  </Panel>;
}

export function SellerDraftEditor({ id, editable, canCreateBrand, canViewBrand, csrfToken, mockSaveError = false }: { id?: string; editable: boolean; canCreateBrand: boolean; canViewBrand: boolean; csrfToken: string; mockSaveError?: boolean }) {
  const [usage, setUsage] = useState<UsageAttributes>({ seasons: [], occasions: [], dayTimes: [] });
  const [name, setName] = useState('');
  const [noteIds, setNoteIds] = useState<string[]>([]);
  const [notesChanged, setNotesChanged] = useState(false);
  const [removedNotes, setRemovedNotes] = useState<string[]>([]);
  const [familyId, setFamilyId] = useState('');
  const [familyChanged, setFamilyChanged] = useState(false);
  const [families, setFamilies] = useState<FamilyOption[]>([]);
  const [familyState, setFamilyState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [familyRetry, setFamilyRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setFamilyState('loading');
    void sellerDraftApi.families(controller.signal).then(options => {
      if (controller.signal.aborted) return;
      setFamilies(options);
      setFamilyState('ready');
    }).catch(() => {
      if (!controller.signal.aborted) setFamilyState('error');
    });
    return () => controller.abort();
  }, [familyRetry]);

  const [brandName, setBrandName] = useState('');
  const [brands, setBrands] = useState<{ name: string }[]>([]);
  const [brandError, setBrandError] = useState('');
  const [loading, setLoading] = useState(!!id);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setLoadError('');
    try {
      const found = await sellerDraftApi.get(id);
      if (!found) { setLoadError('این پیش‌نویس در فهرست پیدا نشد.'); return; }
      setName(found.name);
      setUsage({ seasons: found.seasons, occasions: found.occasions, dayTimes: found.dayTimes });
      setNoteIds(found.noteIds);
      setFamilyId(found.familyId ?? "");
      setBrandName(found.brandName);
    } catch { setLoadError('دریافت پیش‌نویس ناموفق بود. دوباره تلاش کن.'); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { if (id) void load(); }, [id, load]);
  useEffect(() => {
    if (!id || !canViewBrand) return;
    let active = true;
    void sellerDraftApi.brands().then(value => { if (active) setBrands(value); }).catch(() => {
      if (active) setBrandError('دریافت فهرست برندها ممکن نبود.');
    });
    return () => { active = false; };
  }, [id, canViewBrand]);

  const familyNotes = families.find(family => family.id === familyId)?.notes ?? [];
  const noteNames = new Map(families.flatMap(family => family.notes.map(note => [note.id, note.name] as const)));
  const nameToId = new Map([...noteNames].map(([noteId, noteName]) => [noteName, noteId]));
  const incompatibleNotes = familyState === 'ready' && (familyChanged || notesChanged)
    && noteIds.some(noteId => !familyNotes.some(note => note.id === noteId));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editable || saving || incompatibleNotes) return;
    const normalized = name.trim();
    if (!normalized) { setNameError('نام محصول را وارد کن.'); return; }
    if (Array.from(normalized).length > 180) { setNameError('نام محصول نمی‌تواند بیشتر از ۱۸۰ نویسه باشد.'); return; }
    const normalizedBrand = brandName.trim();
    if (id && normalizedBrand && (Array.from(normalizedBrand).length < 2 || Array.from(normalizedBrand).length > 180)) {
      setBrandError('نام برند باید بین ۲ تا ۱۸۰ نویسه باشد.'); return;
    }
    setNameError('');
    setBrandError('');
    setSaveError('');
    setSaving(true);
    try {
      if (import.meta.env.DEV && mockSaveError) throw new Error('خطای آزمایشی ذخیره. ورودی شما حفظ شده است.');
      await sellerDraftApi.save(normalized, csrfToken, id, id ? normalizedBrand : undefined, familyChanged ? familyId || null : undefined, notesChanged ? noteIds : undefined, usage);
      location.hash = listHref;
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : 'ذخیرهٔ پیش‌نویس ناموفق بود. ورودی شما حفظ شده است.');
    } finally { setSaving(false); }
  }

  if (loading) return <Panel title="دریافت پیش‌نویس"><div className="admin-draft-skeleton" role="status" aria-label="در حال دریافت پیش‌نویس"><span/></div></Panel>;
  if (loadError) return <Panel title="پیش‌نویس در دسترس نیست"><DraftLoadError onRetry={() => void load()} /><div className="admin-actions"><a href={listHref}>بازگشت به فهرست پیش‌نویس‌ها</a></div></Panel>;

  return <Panel title={id ? 'ویرایش پیش‌نویس' : 'ساخت پیش‌نویس'}>
    <div className="admin-draft-editor-head"><a href={listHref}><ArrowUpLeft size={15} aria-hidden="true" />فهرست پیش‌نویس‌ها</a><AdminBadge>{editable ? 'امکان ویرایش' : 'فقط خواندن'}</AdminBadge></div>
    {saveError && <p className="admin-draft-state admin-draft-error" role="alert"><AlertCircle size={18} aria-hidden="true" />{saveError}</p>}
    <form className="admin-draft-form" onSubmit={submit} noValidate>
      <div className="admin-draft-field">
        <div className="admin-draft-label-row"><label htmlFor="draft-product-name">نام محصول <span aria-hidden="true">*</span></label><small>{localizedNumber.format(Array.from(name.trim()).length)} / ۱۸۰</small></div>
        <input id="draft-product-name" value={name} onChange={event => { setName(event.currentTarget.value); setNameError(''); setSaveError(''); }} disabled={!editable || saving} aria-invalid={!!nameError} aria-describedby={nameError ? 'draft-name-error' : 'draft-name-hint'} placeholder="مثلاً عطر چوبی جدید" />
        {nameError ? <p id="draft-name-error" className="admin-error">{nameError}</p> : <p id="draft-name-hint" className="admin-field-hint">نام پس از حذف فاصله‌های ابتدا و انتها ذخیره می‌شود.</p>}
      </div>
      {id && <div className="admin-draft-field">
        <label htmlFor="draft-product-brand">برند محصول</label>
        <input id="draft-product-brand" list={canViewBrand ? 'draft-brand-options' : undefined} value={brandName} onChange={event => { setBrandName(event.currentTarget.value); setBrandError(''); }} disabled={!editable || saving} aria-invalid={!!brandError} aria-describedby={brandError ? 'draft-brand-error' : 'draft-brand-hint'} placeholder="نام برند را انتخاب یا وارد کن" />
        {canViewBrand && <datalist id="draft-brand-options">{brands.map(brand => <option key={brand.name} value={brand.name}/>)}</datalist>}
        {brandError ? <p id="draft-brand-error" className="admin-error">{brandError}</p> : <p id="draft-brand-hint" className="admin-field-hint">{canCreateBrand ? 'برند موجود را انتخاب کن یا نام تازه‌ای بنویس. برند تازه پس از ذخیره ساخته می‌شود.' : 'فقط برندهای موجود قابل انتخاب‌اند؛ برای ساخت برند تازه به مجوز نیاز داری.'}</p>}
      </div>}
      <div className="admin-draft-field">
        <FragranceFamilyPicker options={families} value={familyId}
          disabled={!editable || saving || familyState !== 'ready' || families.length === 0}
          onChange={value => {
            if (value === familyId) return;
            const allowed = new Set(families.find(family => family.id === value)?.notes.map(note => note.id));
            const retained = noteIds.filter(noteId => allowed.has(noteId));
            const removed = noteIds.filter(noteId => !allowed.has(noteId));
            setRemovedNotes(removed.map(noteId => noteNames.get(noteId) ?? noteId));
            if (removed.length) {
              setNoteIds(retained);
              setNotesChanged(true);
            }
            setFamilyId(value);
            setFamilyChanged(true);
            setSaveError('');
          }} />
        {familyState === 'loading' && <p role="status">در حال دریافت خانواده‌های رایحه…</p>}
        {familyState === 'ready' && families.length === 0 && <p>هنوز خانوادهٔ رایحه‌ای ثبت نشده است.</p>}
        {familyState === 'error' && <p role="alert">دریافت خانواده‌های رایحه ناموفق بود. <button type="button" onClick={() => setFamilyRetry(value => value + 1)}>تلاش دوباره</button></p>}
      </div>
      <div className="admin-draft-field">
        <NotePicker label="نت‌های بویایی" inputId="draft-product-notes" required={false}
          value={noteIds.map(noteId => noteNames.get(noteId) ?? noteId).join('، ')}
          options={familyNotes.map(note => note.name)}
          disabled={!editable || saving || familyState !== 'ready'}
          invalid={incompatibleNotes} describedBy="draft-notes-hint"
          onChange={value => {
            setNoteIds(value.split('،').map(name => name.trim()).filter(Boolean).map(name => nameToId.get(name) ?? name));
            setNotesChanged(true);
            setSaveError('');
          }} />
        {removedNotes.length > 0 && <p className="admin-field-hint" role="status">
          نت‌های ناسازگار با خانوادهٔ جدید از انتخاب حذف شدند: {removedNotes.join('، ')}
        </p>}
        <p id="draft-notes-hint" className="admin-field-hint" role={incompatibleNotes ? 'alert' : undefined}>
          {incompatibleNotes ? 'با تغییر خانواده، بعضی نت‌ها دیگر مجاز نیستند. پیش از ذخیره آن‌ها را حذف کن.'
            : familyState === 'loading' ? 'در حال دریافت نت‌های بویایی…'
            : familyState === 'error' ? 'دریافت نت‌ها ناموفق بود. از دکمهٔ تلاش دوباره استفاده کن.'
            : !familyId ? 'برای دیدن نت‌های مجاز یک خانواده انتخاب کن.'
            : !familyNotes.length ? 'برای این خانواده هنوز نتی ثبت نشده است.'
            : 'تا ۴ نت از خانوادهٔ انتخاب‌شده را می‌توانی انتخاب کنی.'}
        </p>
      </div>
      <div className="admin-usage-scenes">
      <p>هرجا مناسب است، می‌توانی چند گزینه انتخاب کنی.</p>
      {usageFields.map(({ key, label, options }) =>
        <UsageChoices key={key} scene={key} label={label} options={options}
          value={usage[key].map(code => usageLabel(key, code)).join('، ')}
          disabled={!editable || saving}
          onChange={value => {
            setUsage(current => ({ ...current, [key]: usageCodes(key, value) }));
            setSaveError('');
          }} />
      )}
      </div>
      <div className="admin-draft-status"><span>وضعیت انتشار</span><AdminBadge>پیش‌نویس</AdminBadge><small>این مرحله فقط پیش‌نویس می‌سازد؛ انتشار در گام جداگانه انجام می‌شود.</small></div>
      {!editable && <p className="admin-draft-readonly-note"><ShieldCheck size={17} aria-hidden="true" />این نقش فقط اجازهٔ مشاهدهٔ پیش‌نویس را دارد.</p>}
      <button className="admin-primary" type="submit" disabled={!editable || saving || incompatibleNotes}>{saving ? <><span className="admin-draft-spinner" aria-hidden="true"/>در حال ذخیره…</> : <><Save size={16} aria-hidden="true"/>{id ? 'ذخیرهٔ پیش‌نویس' : 'ساخت پیش‌نویس'}</>}</button>
    </form>
    <section className="admin-draft-next-steps" aria-labelledby="draft-next-title">
      <div><span className="admin-draft-step-number">۲</span><div><h3 id="draft-next-title">اطلاعات تکمیلی محصول</h3><p>برند، خانوادهٔ رایحه و نت‌ها در پیش‌نویس ذخیره می‌شوند. فصل، موقعیت و زمان استفاده را هم می‌توانی مشخص کنی.</p></div><AdminBadge>در حال تکمیل</AdminBadge></div>
      <div><span className="admin-draft-step-number">۳</span><div><h3>نسخه، عکس و قیمت</h3><p>نسخه‌ها، تصاویر و قیمت تا آماده‌شدن مسیر ذخیره، جدا از این پیش‌نویس نگه داشته می‌شوند.</p></div><AdminBadge>در گام بعد</AdminBadge></div>
    </section>
  </Panel>;
}
