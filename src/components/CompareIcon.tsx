import { Check, Scale } from 'lucide-react';
export function CompareIcon({ selected = false }: { selected?: boolean }) {
 return <span className="compare-symbol" data-selected={selected}><Scale size={19} aria-hidden="true" />{selected && <Check className="compare-symbol-check" size={10} aria-hidden="true" />}</span>;
}
