import { fragranceFamilies } from '../data/fragranceFamilies';
import { familyImageUrl } from '../data/fragranceImages';
import { SectionHeading } from './SharedUI';
interface Props { familyId?: string; onSelect: (id?: string) => void }
export function FragranceDiscovery({ familyId, onSelect }: Props) {
  return <section id="discovery" className="section scent-section">
    <div className="container">
      <SectionHeading eyebrow="FOLLOW YOUR SENSES" title="هر رایحه، یک دنیای تازه" />
      <p className="section-intro">از چیزی که دوست داری شروع کن؛ گلی، چوبی یا شاید کمی مرکباتی؟</p>
      <ul className="family-grid">
        {fragranceFamilies.slice(0, 8).map(family => <li key={family.id}>
          <button aria-pressed={familyId === family.id} onClick={() => onSelect(familyId === family.id ? undefined : family.id)}>
            <img className="family-icon" src={familyImageUrl(family.slug)} alt="" loading="lazy" decoding="async" />
            <span>{family.name}</span>
          </button>
        </li>)}
      </ul>
    </div>
  </section>;
}
