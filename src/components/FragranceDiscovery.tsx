import { fragranceFamilies } from '../data/fragranceFamilies';
import { SectionHeading } from './SharedUI';
import { ScentNoteIcon } from './ScentNoteIcon';
import { scentNotes } from '../data/scentNotes';
const icons = ['rose', 'cedar', 'lemon', 'seasalt', 'amber', 'pear', 'pepper', 'vanilla'];
interface Props { familyId?: string; onSelect: (id?: string) => void }
export function FragranceDiscovery({ familyId, onSelect }: Props) {
  return <section id="discovery" className="section scent-section"><div className="container"><SectionHeading eyebrow="FOLLOW YOUR SENSES" title="هر رایحه، یک دنیای تازه" /><p className="section-intro">از چیزی که دوست داری شروع کن؛ گلی، چوبی یا شاید کمی مرکباتی؟</p><ul className="family-grid">{fragranceFamilies.map((f, i) => <li key={f.id}><button aria-pressed={familyId === f.id} onClick={() => onSelect(familyId === f.id ? undefined : f.id)}><span className="family-icon"><ScentNoteIcon note={scentNotes.find(n => n.slug === icons[i])!} size={37} /></span><span>{f.name}</span></button></li>)}</ul></div></section>;
}
