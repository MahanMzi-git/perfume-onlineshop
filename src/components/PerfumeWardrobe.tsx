import { useRef, useState, type CSSProperties } from 'react';
import { Heart, X } from 'lucide-react';
import { brands } from '../data/brands';
import { fragranceFamilies } from '../data/fragranceFamilies';
import { noteById } from '../data/scentNotes';
import { useCustomer, type CabinetEntry } from './CustomerContext';
import { useStore } from './StoreContext';
import type { Product } from '../types/product';

const shelfHeights = [29.1, 48.7, 67.8, 86.9];
const slotsPerShelf = 6;
const shelfLeft = 12;
const shelfWidth = 76;
const slotsPerCabinet = slotsPerShelf * shelfHeights.length;
const formatNumber = new Intl.NumberFormat('fa-IR');

export interface WardrobePerfume {
  position: number;
  id: string;
  name: string;
  image: string;
  fallback?: string;
  product?: Product;
}

function Bottle({ perfume, className }: { perfume: WardrobePerfume; className: string }) {
  return <img className={className} src={perfume.image} alt="" onError={event => {
    if (perfume.fallback && event.currentTarget.getAttribute('src') !== perfume.fallback) {
      event.currentTarget.src = perfume.fallback;
    }
  }} />;
}

function PerfumeSlot({ perfume, selected, onPick }: {
  perfume: WardrobePerfume;
  selected: boolean;
  onPick: (perfume: WardrobePerfume, trigger: HTMLButtonElement) => void;
}) {
  const slot = perfume.position % slotsPerCabinet;
  const position: CSSProperties = {
    left: `${shelfLeft + (slot % slotsPerShelf + 0.5) * shelfWidth / slotsPerShelf}%`,
    top: `${shelfHeights[Math.floor(slot / slotsPerShelf)]}%`,
  };
  return <li className="wardrobe-slot" style={position}>
    <button type="button" className="wardrobe-artwork" data-lifted={selected}
      onClick={event => onPick(perfume, event.currentTarget)}>
      <Bottle perfume={perfume} className="wardrobe-bottle" />
      <bdi className="wardrobe-label">{perfume.name}</bdi>
    </button>
  </li>;
}

function PerfumeDetails({ perfume }: { perfume: WardrobePerfume }) {
  const { customer, setCustomer } = useCustomer();
  const store = useStore();
  const entry = customer.cabinet[perfume.id] ?? {};
  const product = perfume.product;
  const favourite = product ? store.favourites.includes(perfume.id) : !!entry.favourite;
  function update(patch: CabinetEntry) {
    setCustomer(current => ({
      ...current,
      cabinet: { ...current.cabinet, [perfume.id]: { ...current.cabinet[perfume.id], ...patch } },
    }));
  }

  return <div className="wardrobe-details">
    <h2 id="wardrobe-selection-title"><bdi>{perfume.name}</bdi></h2>
    {product && <>
      <p>{[
        brands.find(brand => brand.id === product.brandId)?.name,
        product.concentration,
        { women: 'زنانه', men: 'مردانه', unisex: 'یونیسکس' }[product.targetAudience],
      ].filter(Boolean).join(' · ')}</p>
      <p>{fragranceFamilies.filter(family => product.fragranceFamilyIds.includes(family.id)).map(family => family.name).join('، ')}</p>
      <dl className="wardrobe-notes">
        {([{ key: 'top', label: 'آغازین' }, { key: 'middle', label: 'میانی' }, { key: 'base', label: 'پایه' }] as const).map(({ key, label }) => {
          const names = product.notePyramid[key].map(id => noteById(id)?.name).filter(Boolean);
          return names.length > 0 && <div key={key}><dt>{label}</dt><dd>{names.join('، ')}</dd></div>;
        })}
      </dl>
      {product.description && <p>{product.description}</p>}
    </>}
    <fieldset>
      <legend>تجربهٔ من</legend>
      <button type="button" aria-pressed={entry.experience === 'used'}
        onClick={() => update({ experience: entry.experience === 'used' ? undefined : 'used' })}>قبلاً استفاده کردم</button>
      <button type="button" aria-pressed={entry.experience === 'smelled'}
        onClick={() => update({ experience: entry.experience === 'smelled' ? undefined : 'smelled' })}>فقط بو کردم</button>
    </fieldset>
    <fieldset>
      <legend>نظر من</legend>
      <button type="button" aria-pressed={entry.opinion === 'liked'} onClick={() => update({ opinion: 'liked' })}>دوستش دارم</button>
      <button type="button" aria-pressed={entry.opinion === 'disliked'} onClick={() => update({ opinion: 'disliked' })}>دوستش ندارم</button>
    </fieldset>
    <button type="button" className="wardrobe-favourite" aria-pressed={favourite}
      onClick={() => product ? store.toggleFavourite(product.id) : update({ favourite: !favourite })}>
      <Heart size={18} fill={favourite ? 'currentColor' : 'none'} aria-hidden="true" /> علاقه‌مندی
    </button>
    <p className="wardrobe-session-note">{product ? "تجربه و نظر تا پایان این نشست نگه‌داری می‌شوند." : "این عطر نمونه است و انتخاب‌هایش فقط در همین نشست می‌مانند."}</p>
  </div>;
}

function bottleMotion(image: HTMLImageElement, shelf: DOMRect, returning: boolean) {
  const foreground = image.getBoundingClientRect();
  if (!foreground.width || !foreground.height || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const fromShelf = {
    transform: `translate(${shelf.left - foreground.left}px, ${shelf.top - foreground.top}px) scale(${shelf.width / foreground.width}, ${shelf.height / foreground.height})`,
  };
  return image.animate([fromShelf, { transform: 'none' }], {
    duration: returning ? 320 : 520,
    direction: returning ? 'reverse' : 'normal',
    easing: 'cubic-bezier(.22, .8, .25, 1)',
    fill: 'both',
  });
}

export function PerfumeWardrobe({ perfumes }: { perfumes: readonly WardrobePerfume[] }) {
  const [requestedPage, setPage] = useState(0);
  const [selection, setSelection] = useState<WardrobePerfume>();
  const dialog = useRef<HTMLDialogElement>(null);
  const source = useRef<HTMLButtonElement>();
  const motion = useRef<Animation>();
  const busy = useRef(false);
  const pageCount = perfumes.reduce((count, perfume) =>
    Math.max(count, Math.floor(perfume.position / slotsPerCabinet) + 1), 1);
  const page = Math.min(requestedPage, pageCount - 1);
  const start = page * slotsPerCabinet;
  const visible = perfumes.filter(perfume => perfume.position >= start && perfume.position < start + slotsPerCabinet);

  function pick(perfume: WardrobePerfume, trigger: HTMLButtonElement) {
    if (busy.current || dialog.current?.open) return;
    source.current = trigger;
    setSelection(perfume);
  }

  function startSelection(panel: HTMLDivElement | null) {
    const modal = dialog.current;
    const origin = source.current?.querySelector('img');
    const image = panel?.querySelector('img');
    if (!modal || modal.open || !origin || !image) return;
    const shelf = origin.getBoundingClientRect();
    modal.showModal();
    motion.current = bottleMotion(image, shelf, false);
  }

  async function closeSelection() {
    const modal = dialog.current;
    if (!modal?.open || busy.current) return;
    busy.current = true;
    const image = modal.querySelector<HTMLImageElement>('.wardrobe-foreground');
    const origin = source.current?.querySelector('img');
    if (motion.current?.playState === 'running') motion.current.finish();
    motion.current?.cancel();
    modal.scrollTop = 0;
    modal.dataset.closing = 'true';
    try {
      if (image && origin) await bottleMotion(image, origin.getBoundingClientRect(), true)?.finished;
    } finally {
      modal.close();
      delete modal.dataset.closing;
      setSelection(undefined);
      source.current?.focus({ preventScroll: true });
      busy.current = false;
    }
  }

  return <section className="perfume-wardrobe" aria-label="طبقه‌های کمد عطر">
    <div className="wardrobe-scene">
      <img className="wardrobe-background" src={import.meta.env.BASE_URL + 'images/wardrobe/empty-cabinet.png'}
        alt="" width={1024} height={1536} />
      <ul className="wardrobe-perfumes" aria-label="عطرهای روی طبقه‌ها">
        {visible.map(perfume => <PerfumeSlot key={perfume.position} perfume={perfume}
          selected={selection?.position === perfume.position} onPick={pick} />)}
      </ul>
    </div>
    {pageCount > 1 && <div className="wardrobe-pagination">
      <button className="step-action" type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>صفحهٔ قبل</button>
      <span role="status">{formatNumber.format(page + 1)} از {formatNumber.format(pageCount)}</span>
      <button className="step-action" type="button" disabled={page === pageCount - 1} onClick={() => setPage(page + 1)}>صفحهٔ بعد</button>
    </div>}
    <dialog ref={dialog} className="wardrobe-focus" aria-labelledby="wardrobe-selection-title"
      onCancel={event => { event.preventDefault(); void closeSelection(); }}
      onClick={event => { if (event.target === event.currentTarget) void closeSelection(); }}>
      {selection && <div className="wardrobe-focus-inner" ref={startSelection}>
        <button type="button" className="wardrobe-close" aria-label="بازگشت عطر به طبقه" autoFocus onClick={closeSelection}>
          <X size={22} aria-hidden="true" />
        </button>
        <Bottle perfume={selection} className="wardrobe-foreground" />
        <PerfumeDetails perfume={selection} />
      </div>}
    </dialog>
  </section>;
}
