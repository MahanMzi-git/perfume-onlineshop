import { noteById } from '../data/scentNotes';
import { ScentNoteIcon } from './ScentNoteIcon';
interface Props { noteIds: string[]; max?: number; onSelect?: (id: string) => void }
export function ScentNoteList({ noteIds, max = 4, onSelect }: Props) {
  const notes = noteIds.slice(0, max).map(noteById).filter((n) => !!n);
  return (
    <ul className="notes">
      {notes.map((n) => n && (
        <li key={n.id}>
          {onSelect ? (
            <button type="button" className="note" onClick={() => onSelect(n.id)} title={`نمایش عطرهای دارای نت ${n.name}`}>
              <ScentNoteIcon note={n} /><span>{n.name}</span>
            </button>
          ) : <span className="note"><ScentNoteIcon note={n} /><span>{n.name}</span></span>}
        </li>
      ))}
    </ul>
  );
}
