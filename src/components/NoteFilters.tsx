import { scentNotes } from '../data/scentNotes';
import { ScentNoteIcon } from './ScentNoteIcon';

interface Props {
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function NoteFilters({ selectedIds, onToggle }: Props) {
  return <details className="note-filter-panel">
    <summary>انتخاب نت‌های بویایی <span>({new Intl.NumberFormat('fa-IR').format(selectedIds.length)} انتخاب)</span></summary>
    <p id="note-filter-help">چند نت انتخاب کنید؛ فقط عطرهایی نمایش داده می‌شوند که همهٔ نت‌های انتخاب‌شده را دارند. برای برداشتن هر نت، دوباره روی آن بزنید.</p>
    <div className="note-filter-options" role="group" aria-label="انتخاب نت‌های بویایی" aria-describedby="note-filter-help">
      {scentNotes.map(note => <button key={note.id} type="button" className="chip note-filter-option" aria-pressed={selectedIds.includes(note.id)} onClick={() => onToggle(note.id)}>
        <ScentNoteIcon note={note} decorative /><span>{note.name}</span>
      </button>)}
    </div>
  </details>;
}
