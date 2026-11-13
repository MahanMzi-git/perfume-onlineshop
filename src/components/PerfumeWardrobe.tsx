import { useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { brands } from '../data/brands';
import { fragranceFamilies } from '../data/fragranceFamilies';
import { noteById } from '../data/scentNotes';
import type { WardrobePerfume } from '../data/wardrobePerfumes';
import { defaultCardVariant } from '../lib/catalog';
import { getBottleScale, getShelfPosition, getWardrobePage } from '../lib/wardrobeLayout';
import { useCustomer, type CabinetEntry } from './CustomerContext';

const formatNumber = new Intl.NumberFormat('fa-IR');
const experienceChoices = [
  { value: 'unsmelled', label: 'بو نکردم' },
  { value: 'smelled', label: 'نداشتم ولی بو کردم' },
  { value: 'used', label: 'داشتم و استفاده کردم' },
] as const;
const opinionChoices = [
  { value: 'liked', label: 'دوستش دارم' },
  { value: 'disliked', label: 'دوستش ندارم' },
] as const;

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

function WardrobeChoices<Value extends string>({ title, options, selected, onSelect }: {
  title: string;
  options: readonly { value: Value; label: string }[];
  selected?: Value;
  onSelect: (value: Value) => void;
}) {
  const group = useId();
  return <fieldset className="wardrobe-choices">
    <legend>{title}</legend>
    <div>
      {options.map(({ value, label }) => <label key={value}>
        <input type="radio" name={group} value={value} checked={selected === value} onChange={() => onSelect(value)} />
        <span>{label}</span>
      </label>)}
    </div>
  </fieldset>;
}

function WardrobeDetails({ perfume }: { perfume: WardrobePerfume }) {
  const { customer, setCustomer } = useCustomer();
  const { product } = perfume;
  const variant = defaultCardVariant(product);
  const brand = brands.find(brand => brand.id === product.brandId);
  const families = fragranceFamilies.filter(family => product.fragranceFamilyIds.includes(family.id))
    .map(family => family.name).join('، ');
  const notes = product.scentNoteIds.map(id => noteById(id)?.name).filter(Boolean).join('، ');
  const entry = customer.cabinet[perfume.id];
  const href = '#/product/' + product.slug + (variant && variant !== product.variants[0] ? '?variant=' + variant.id : '');

  function updateEntry(patch: Pick<CabinetEntry, 'experience' | 'opinion'>) {
    setCustomer(current => ({
      ...current,
      cabinet: {
        ...current.cabinet,
        [perfume.id]: { ...current.cabinet[perfume.id], ...patch },
      },
    }));
  }

  return <div className="wardrobe-details">
    <div className="wardrobe-details-heading">
      <h2 id="wardrobe-selection-title"><bdi>{perfume.name}</bdi></h2>
      {brand && <bdi className="wardrobe-brand">{brand.name}</bdi>}
    </div>
    <dl className="wardrobe-facts">
      <div><dt>خانواده‌های رایحه</dt><dd>{families || 'ثبت نشده'}</dd></div>
      <div><dt>نت‌های بویایی</dt><dd>{notes || 'ثبت نشده'}</dd></div>
    </dl>
    <WardrobeChoices title="تجربهٔ من" options={experienceChoices} selected={entry?.experience}
      onSelect={experience => updateEntry({ experience })} />
    <WardrobeChoices title="نظر من" options={opinionChoices} selected={entry?.opinion}
      onSelect={opinion => updateEntry({ opinion })} />
    <a className="wardrobe-product-link" href={href}>
      مشاهدهٔ محصول <ArrowUpLeft size={14} aria-hidden="true" />
    </a>
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
        <WardrobeDetails perfume={selection} />
      </div>}
    </dialog>
  </section>;
}
