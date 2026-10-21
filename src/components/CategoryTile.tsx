import { DemoImage } from './DemoImage';
import type { ProductCategory } from '../types/product';
interface Props { category: ProductCategory; active: boolean; onSelect: (c: ProductCategory) => void }
export function CategoryTile({ category, active, onSelect }: Props) {
  return (
    <button type="button" className="tile" aria-pressed={category.scrollTo ? undefined : active} onClick={() => onSelect(category)}>
      <div className="category-orbit-dock" data-orbit-dock={category.id}><DemoImage src={category.image} alt="" width={400} height={500} loading="lazy" /></div>
      <span>{category.label}</span>
    </button>
  );
}
