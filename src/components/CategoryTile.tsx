import type { ProductCategory } from '../types/product';
interface Props { category: ProductCategory; active: boolean; onSelect: (c: ProductCategory) => void }
export function CategoryTile({ category, active, onSelect }: Props) {
  return (
    <button type="button" className="tile" aria-pressed={active} onClick={() => onSelect(category)}>
      <img src={category.image} alt="" width={400} height={500} loading="lazy" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/p1.svg"; }} />
      <span>{category.label}</span>
    </button>
  );
}
