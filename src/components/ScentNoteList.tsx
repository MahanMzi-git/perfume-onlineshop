import { noteById } from '../data/scentNotes';
import { ScentNoteIcon } from './ScentNoteIcon';
interface Props { noteIds: string[]; max?: number; onSelect?: (id: string) => void; selectedNoteIds?: string[] }
export function ScentNoteList({ noteIds, max = 4, onSelect, selectedNoteIds = [] }: Props) {
  const notes = noteIds.slice(0, max).map(noteById).filter((n) => !!n);
  return (
    <ul className="notes">
      {notes.map((n) => n && (
        <li key={n.id}>
          {onSelect ? (
            <button type="button" className="note" aria-pressed={selectedNoteIds.includes(n.id)} onClick={() => onSelect(n.id)} title={`انتخاب یا حذف نت ${n.name}`}>
              <ScentNoteIcon decorative note={n} /><span>{n.name}</span>
            </button>
          ) : <span className="note"><ScentNoteIcon decorative note={n} /><span>{n.name}</span></span>}
        </li>
      ))}
    </ul>
  );
}
