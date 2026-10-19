import { fragranceFamilies } from '../data/fragranceFamilies';
interface Props { familyId?: string; onSelect: (id?: string) => void }
export function FragranceDiscovery({ familyId, onSelect }: Props) {
  return (
    <section id="discovery" className="section tinted">
      <div className="container">
        <h2 className="serif" dir="ltr" lang="en">Find Your Scent</h2>
        <p className="lead">عطری را پیدا کن که با شخصیت و حال‌وهوایت هماهنگ است.</p>
        <ul className="chips">{fragranceFamilies.map((f) => (
          <li key={f.id}><a href="#products" className="chip" aria-pressed={familyId === f.id}
            onClick={() => onSelect(familyId === f.id ? undefined : f.id)}>{f.name}</a></li>
        ))}</ul>
      </div>
    </section>
  );
}
