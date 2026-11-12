import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, Heart, X } from 'lucide-react';
import { brands } from '../data/brands';
import { fragranceFamilies } from '../data/fragranceFamilies';
import { noteById } from '../data/scentNotes';
import { useCustomer, type CabinetEntry } from './CustomerContext';
import { useStore } from './StoreContext';
import type { WardrobePerfume } from '../data/wardrobePerfumes';
import { getBottleScale, getShelfPosition, getWardrobePage } from '../lib/wardrobeLayout';

const formatNumber = new Intl.NumberFormat('fa-IR');

function Bottle({ perfume, className }: { perfume: WardrobePerfume; className: string }) {
  const [failedImage, setFailedImage] = useState<string>();
  const [intrinsic, setIntrinsic] = useState<{ image: string; ratio: number }>();
  const failed = failedImage === perfume.image;
  const crop = failed ? undefined : perfume.crop;
  const image = (failed ? perfume.fallback : perfume.image) ?? perfume.image;
  let ratio = intrinsic?.image === image ? intrinsic.ratio : 0.7;
  let imageStyle: CSSProperties | undefined;
  if (crop) {
    const [left, top, right, bottom] = crop.bounds;
    const [width, height] = crop.canvas;
    const cropWidth = right - left;
    const cropHeight = bottom - top;
    ratio = cropWidth / cropHeight;
    imageStyle = {
      width: `${width / cropWidth * 100}%`,
      height: `${height / cropHeight * 100}%`,
      left: `${-left / cropWidth * 100}%`,
      top: `${-top / cropHeight * 100}%`,
    };
  }
  return <span className={className} data-cropped={!!crop} style={{ '--bottle-ratio': ratio } as CSSProperties}>
    <img src={image} alt="" style={imageStyle} onLoad={event => {
      const { naturalWidth, naturalHeight } = event.currentTarget;
      if (!crop && naturalHeight) setIntrinsic({ image, ratio: naturalWidth / naturalHeight });
    }}
      onError={() => { if (!failed && perfume.fallback && perfume.fallback !== perfume.image) setFailedImage(perfume.image); }} />
  </span>;
}

function PerfumeSlot({ perfume, index, pageSize, selected, onPick }: {
  perfume: WardrobePerfume;
  index: number;
  pageSize: number;
  selected: boolean;
  onPick: (perfume: WardrobePerfume, trigger: HTMLButtonElement) => void;
}) {
  const { left, top } = getShelfPosition(index, pageSize);
  const position = {
    left: `${left}%`,
    top: `${top}%`,
    '--bottle-scale': getBottleScale(perfume.volumeMl),
  } as CSSProperties;
  return <li className="wardrobe-slot" style={position}>
    <button type="button" className="wardrobe-artwork" aria-haspopup="dialog" data-lifted={selected}
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
  const favourite = store.favourites.includes(perfume.id);
  function update(patch: CabinetEntry) {
    setCustomer(current => ({
      ...current,
      cabinet: { ...current.cabinet, [perfume.id]: { ...current.cabinet[perfume.id], ...patch } },
    }));
  }

  return <div className="wardrobe-details">
    <h2 id="wardrobe-selection-title"><bdi>{perfume.name}</bdi></h2>
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
      onClick={() => store.toggleFavourite(product.id)}>
      <Heart size={18} fill={favourite ? 'currentColor' : 'none'} aria-hidden="true" /> علاقه‌مندی
    </button>
    <p className="wardrobe-session-note">تجربه و نظر تا پایان این نشست نگه‌داری می‌شوند.</p>
  </div>;
}

function bottleMotion(image: HTMLElement, shelf: DOMRect, returning: boolean) {
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
  const [direction, setDirection] = useState<'next' | 'previous'>();
  const [picked, setPicked] = useState<{ id: string; page: number }>();
  const dialog = useRef<HTMLDialogElement>(null);
  const source = useRef<HTMLButtonElement>();
  const motion = useRef<Animation>();
  const busy = useRef(false);
  const { page, pageCount, perfumes: visible } = getWardrobePage(perfumes, requestedPage);
  const selection = picked?.page === page ? visible.find(perfume => perfume.id === picked.id) : undefined;

  useLayoutEffect(() => {
    if (requestedPage !== page) setPage(page);
    if (picked && !selection) {
      motion.current?.cancel();
      dialog.current?.close();
      setPicked(undefined);
    }
  }, [page, picked, requestedPage, selection]);

  function turnPage(next: number) {
    if (next < 0 || next >= pageCount || busy.current || dialog.current?.open) return;
    setPicked(undefined);
    setDirection(next > page ? 'next' : 'previous');
    setPage(next);
  }

  function pick(perfume: WardrobePerfume, trigger: HTMLButtonElement) {
    if (busy.current || dialog.current?.open) return;
    source.current = trigger;
    setPicked({ id: perfume.id, page });
  }

  function startSelection(panel: HTMLDivElement | null) {
    const modal = dialog.current;
    const origin = source.current?.querySelector<HTMLElement>('.wardrobe-bottle');
    const image = panel?.querySelector<HTMLElement>('.wardrobe-foreground');
    if (!modal || modal.open || !origin || !image) return;
    const shelf = origin.getBoundingClientRect();
    modal.showModal();
    motion.current = bottleMotion(image, shelf, false);
  }

  async function closeSelection() {
    const modal = dialog.current;
    if (!modal?.open || busy.current) return;
    busy.current = true;
    const image = modal.querySelector<HTMLElement>('.wardrobe-foreground');
    const origin = source.current?.querySelector<HTMLElement>('.wardrobe-bottle');
    if (motion.current?.playState === 'running') motion.current.finish();
    motion.current?.cancel();
    modal.scrollTop = 0;
    modal.dataset.closing = 'true';
    try {
      if (image && origin?.isConnected) {
        motion.current = bottleMotion(image, origin.getBoundingClientRect(), true);
        await motion.current?.finished.catch(() => undefined);
      }
    } finally {
      modal.close();
      delete modal.dataset.closing;
      setPicked(undefined);
      source.current?.focus({ preventScroll: true });
      busy.current = false;
    }
  }

  return <section className="perfume-wardrobe" aria-label="طبقه‌های کمد عطر">
    <div className="wardrobe-scene">
      <img className="wardrobe-background" src={import.meta.env.BASE_URL + 'images/wardrobe/empty-cabinet.png'}
        alt="" width={1024} height={1536} />
      <ul key={page} className="wardrobe-perfumes" data-turn={direction} aria-label="عطرهای روی طبقه‌ها">
        {visible.map((perfume, index) => <PerfumeSlot key={perfume.id} perfume={perfume}
          index={index} pageSize={visible.length} selected={selection?.id === perfume.id} onPick={pick} />)}
      </ul>
    </div>
    {pageCount === 0 && <p className="wardrobe-empty">هنوز عطری در کمد نیست.</p>}
    {pageCount > 1 && <nav className="wardrobe-pagination" aria-label="صفحه‌بندی کمد عطر">
      <button type="button" disabled={page === 0} onClick={() => turnPage(page - 1)}>
        <ChevronRight size={18} aria-hidden="true" /> قبلی
      </button>
      <span role="status" aria-atomic="true">صفحهٔ {formatNumber.format(page + 1)} از {formatNumber.format(pageCount)}</span>
      <button type="button" disabled={page === pageCount - 1} onClick={() => turnPage(page + 1)}>
        بعدی <ChevronLeft size={18} aria-hidden="true" />
      </button>
    </nav>}
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
