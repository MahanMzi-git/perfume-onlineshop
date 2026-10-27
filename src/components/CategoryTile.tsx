import type { CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { categoryScenes, categorySurfaceRatio } from '../data/categoryScenes';
import { DemoImage } from './DemoImage';
import type { ProductCategory } from '../types/product';
interface Props { category: ProductCategory; active: boolean; onSelect: (c: ProductCategory) => void }
export function CategoryTile({ category, active, onSelect }: Props) {
  const scene = categoryScenes[category.id];
  const imageHeightRatio = scene ? Math.max(categorySurfaceRatio / scene.surfaceY, (1 - categorySurfaceRatio) / (1 - scene.surfaceY)) : 1;
  const sceneStyle = scene ? { '--scene-aspect':scene.aspect, '--scene-x':scene.surfaceX, '--scene-y':scene.surfaceY, '--scene-zoom':scene.zoom, '--scene-cover-aspect':scene.aspect * imageHeightRatio, '--surface-ratio':`${categorySurfaceRatio * 100}%` } as CSSProperties : undefined;
  return (
    <button type="button" className="tile" aria-pressed={category.scrollTo ? undefined : active} onClick={() => onSelect(category)}>
      <div className="category-orbit-dock" data-orbit-dock={category.id} style={sceneStyle}>
        {scene && <img className="category-podium-scene" src={`/images/category-scenes/${scene.image}`} alt="" loading="lazy" decoding="async" />}
        <DemoImage className="category-dock-bottle" src={scene ? `/images/orbit-photos/${scene.bottle}` : category.image} alt="" width={400} height={500} loading="lazy" />
        {scene && <i className="category-landing-point" data-orbit-landing aria-hidden="true" />}
      </div>
      <span className="category-caption">{category.label}<ArrowUpRight size={13} aria-hidden="true" /></span>
    </button>
  );
}
