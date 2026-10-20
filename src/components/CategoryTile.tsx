import { DemoImage } from './DemoImage';
import type { ProductCategory } from '../types/product';
interface Props { category: ProductCategory; active: boolean; onSelect: (c: ProductCategory) => void }
export function CategoryTile({ category, active, onSelect }: Props) {
  return (
    <button type="button" className="tile" aria-pressed={category.scrollTo ? undefined : active} onClick={() => onSelect(category)}>
      <DemoImage src={category.image} alt="" width={400} height={500} loading="lazy" />
      <span>{category.label}</span>
    </button>
  );
}
