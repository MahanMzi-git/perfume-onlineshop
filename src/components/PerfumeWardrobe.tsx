import { useState, type CSSProperties } from 'react';

const slotsPerShelf = 4;
const shelfHeights = [29.1, 48.7, 67.8, 86.9];
const slotsPerCabinet = slotsPerShelf * shelfHeights.length;
const formatNumber = new Intl.NumberFormat('fa-IR');

export interface WardrobePerfume {
  position: number;
  name: string;
  image: string;
  href?: string;
}

function PerfumeSlot({ perfume }: { perfume: WardrobePerfume }) {
  const slot = perfume.position % slotsPerCabinet;
  const position: CSSProperties = {
    left: `${21.5 + (slot % slotsPerShelf) * 19}%`,
    top: `${shelfHeights[Math.floor(slot / slotsPerShelf)]}%`,
  };

  const Artwork = perfume.href ? 'a' : 'div';
  return (
    <li className="wardrobe-slot" style={position}>
      <Artwork className="wardrobe-artwork" href={perfume.href}>
        <img className="wardrobe-bottle" src={perfume.image} alt="" decoding="async" />
        <bdi className="wardrobe-label">{perfume.name}</bdi>
      </Artwork>
    </li>
  );
}

export function PerfumeWardrobe({ perfumes }: { perfumes: readonly WardrobePerfume[] }) {
  const [requestedPage, setPage] = useState(0);
  const pageCount = perfumes.reduce(
    (count, perfume) => Math.max(count, Math.floor(perfume.position / slotsPerCabinet) + 1),
    1,
  );
  const page = Math.min(requestedPage, pageCount - 1);
  const start = page * slotsPerCabinet;
  const visible = perfumes.filter(perfume => perfume.position >= start && perfume.position < start + slotsPerCabinet);

  return (
    <section className="perfume-wardrobe" aria-label="طبقه‌های کمد عطر">
      <div className="wardrobe-scene">
        <img
          className="wardrobe-background"
          src={import.meta.env.BASE_URL + 'images/wardrobe/empty-cabinet.png'}
          alt=""
          width={1024}
          height={1536}
        />
        <ul className="wardrobe-perfumes" aria-label="عطرهای روی طبقه‌ها">
          {visible.map(perfume => <PerfumeSlot key={perfume.position} perfume={perfume} />)}
        </ul>
      </div>
      {pageCount > 1 && <div className="wardrobe-pagination">
        <button className="step-action" type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>صفحهٔ قبل</button>
        <span role="status">{formatNumber.format(page + 1)} از {formatNumber.format(pageCount)}</span>
        <button className="step-action" type="button" disabled={page === pageCount - 1} onClick={() => setPage(page + 1)}>صفحهٔ بعد</button>
      </div>}
    </section>
  );
}
