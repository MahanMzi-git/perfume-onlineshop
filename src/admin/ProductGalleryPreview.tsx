import { useId, useState, type ChangeEvent, type PointerEvent } from 'react';
import { GripHorizontal, ImagePlus, Star, Trash2 } from 'lucide-react';

const limit = 6;
const formats = ['image/png', 'image/jpeg', 'image/webp'];
const formatCount = new Intl.NumberFormat('fa-IR');

interface GalleryImage {
  id: string;
  src: string;
}

interface GalleryDrag {
  pointerId: number;
  from: number;
  target: number;
}

async function readPhoto(file: File): Promise<GalleryImage> {
  const src = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject();
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const image = new Image();
  image.src = src;
  await image.decode();
  return { id: crypto.randomUUID(), src };
}

export function ProductGalleryPreview({ image, editable }: { image?: string; editable: boolean }) {
  const id = useId();
  const [photos, setPhotos] = useState<GalleryImage[]>(() => image ? [{ id: 'cover', src: image }] : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [drag, setDrag] = useState<GalleryDrag>();
  const locked = !editable || loading;

  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    if (!files.length) return;
    setLoading(true);
    setError('');
    setStatus('');
    const added: GalleryImage[] = [];
    let invalid = 0;
    let excess = 0;
    for (const file of files) {
      if (!formats.includes(file.type) || file.size > 2 * 1024 * 1024) {
        invalid++;
      } else if (photos.length + added.length >= limit) {
        excess++;
      } else {
        try { added.push(await readPhoto(file)); }
        catch { invalid++; }
      }
    }
    setPhotos(current => [...current, ...added]);
    if (added.length) setStatus(formatCount.format(added.length) + ' تصویر اضافه شد.');
    setError([
      invalid ? formatCount.format(invalid) + ' فایل به‌دلیل فرمت، حجم یا خوانا نبودن تصویر اضافه نشد.' : '',
      excess ? 'گالری حداکثر ۶ تصویر می‌پذیرد.' : '',
    ].filter(Boolean).join(' '));
    setLoading(false);
  }

  function movePhoto(from: number, to: number) {
    if (from === to || to < 0 || to >= photos.length) return;
    setPhotos(current => {
      const ordered = [...current];
      const [photo] = ordered.splice(from, 1);
      ordered.splice(to, 0, photo);
      return ordered;
    });
    const position = 'تصویر به جایگاه ' + formatCount.format(to + 1) + ' منتقل شد.';
    setStatus(position + (to === 0 || from === 0 ? ' تصویر اصلی تغییر کرد.' : ''));
  }

  function dropPosition(event: PointerEvent<HTMLButtonElement>) {
    const card = document.elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-gallery-position]');
    return card && card.parentElement === event.currentTarget.closest('ol')
      ? Number(card.dataset.galleryPosition)
      : -1;
  }

  function removePhoto(index: number) {
    setPhotos(current => current.filter((_, position) => position !== index));
    setStatus(index === 0 && photos.length > 1 ? 'تصویر اصلی حذف شد و تصویر بعدی جای آن را گرفت.' : 'تصویر حذف شد.');
    setError('');
  }

  return <section className="admin-image-picker admin-gallery-preview" aria-labelledby={id + '-title'}>
    <div className="admin-image-preview">
      {photos[0] ? <img src={photos[0].src} alt="پیش‌نمایش تصویر اصلی محصول" width={96} height={96}/> : <ImagePlus size={26} aria-hidden="true"/>}
    </div>
    <div className="admin-image-details">
      <h3 id={id + '-title'}>گالری تصاویر محصول</h3>
      <p>پیش‌نمایش آزمایشی. تغییرات گالری ذخیره نمی‌شوند.</p>
      <label className="admin-image-action">
        <input type="file" multiple accept={formats.join(',')} disabled={locked || photos.length >= limit}
          aria-describedby={id + '-formats'} onChange={addPhotos}/>
        <span>{loading ? 'در حال خواندن تصاویر…' : 'افزودن تصاویر'}</span>
      </label>
      <p id={id + '-formats'}>{formatCount.format(photos.length)} از ۶ تصویر · <bdi dir="ltr">PNG · JPEG · WebP</bdi> · هر فایل تا ۲ مگابایت</p>
    </div>
    {photos.length > 1 && <p className="admin-gallery-sort-hint" id={id + '-sort'}>
      برای مرتب‌کردن، دستگیرهٔ عکس را بکشید یا روی آن از کلیدهای جهت‌دار استفاده کنید. عکس شمارهٔ ۱ تصویر اصلی است.
    </p>}
    {photos.length > 0 && <ol className="admin-gallery-photos" aria-label="ترتیب تصاویر محصول">
      {photos.map((photo, index) => {
        const label = 'تصویر ' + formatCount.format(index + 1);
        return <li key={photo.id} className="admin-gallery-photo" data-gallery-position={index}
          data-cover={index === 0 || undefined}
          data-dragging={drag?.from === index || undefined}
          data-drop-target={drag?.target === index && drag.from !== index || undefined}>
          <div className="admin-gallery-thumbnail">
            <img src={photo.src} alt="" width={112} height={112} draggable={false}/>
            <button type="button" className="admin-gallery-delete" disabled={locked}
              onClick={() => removePhoto(index)} aria-label={'حذف ' + (index === 0 ? 'تصویر اصلی' : label)} title="حذف تصویر">
              <Trash2 size={14} aria-hidden="true"/>
            </button>
            {index > 0 && <button type="button" className="admin-gallery-promote" disabled={locked}
              onClick={() => movePhoto(index, 0)} aria-label={'انتخاب ' + label + ' به عنوان تصویر اصلی'} title="انتخاب به عنوان تصویر اصلی">
              <Star size={14} aria-hidden="true"/>
            </button>}
            <div className="admin-gallery-caption">
              <span className="admin-gallery-position" aria-label={'جایگاه ' + formatCount.format(index + 1)}>{formatCount.format(index + 1)}</span>
              {index === 0 && <span className="admin-gallery-cover">اصلی</span>}
            </div>
          </div>
          {photos.length > 1 && <button type="button" className="admin-gallery-grip" disabled={locked}
            aria-label={'مرتب کردن ' + label} aria-describedby={id + '-sort'}
            onPointerDown={event => {
              if (!event.isPrimary || event.button !== 0) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              setDrag({ pointerId: event.pointerId, from: index, target: index });
            }}
            onPointerMove={event => {
              if (drag?.pointerId !== event.pointerId) return;
              const target = dropPosition(event);
              if (target !== drag.target) setDrag({ ...drag, target });
            }}
            onPointerUp={event => {
              if (drag?.pointerId !== event.pointerId) return;
              movePhoto(drag.from, dropPosition(event));
              setDrag(undefined);
            }}
            onLostPointerCapture={() => setDrag(undefined)}
            onKeyDown={event => {
              if (event.key === 'Escape' && drag) {
                setDrag(undefined);
                return;
              }
              const previous = event.key === 'ArrowUp' || event.key === 'ArrowRight';
              const next = event.key === 'ArrowDown' || event.key === 'ArrowLeft';
              if (!previous && !next) return;
              event.preventDefault();
              const target = index + (previous ? -1 : 1);
              if (target < 0 || target >= photos.length) return;
              const handle = event.currentTarget;
              movePhoto(index, target);
              requestAnimationFrame(() => {
                handle.focus({ preventScroll: true });
                handle.scrollIntoView({ block: 'nearest', inline: 'nearest' });
              });
            }}>
            <GripHorizontal size={16} aria-hidden="true"/>
          </button>}
        </li>;
      })}
    </ol>}
    <p className="sr" role="status">{status}</p>
    {error && <p role="alert" className="admin-error">{error}</p>}
  </section>;
}
