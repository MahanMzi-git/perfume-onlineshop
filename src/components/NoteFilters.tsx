import { scentNotes } from '../data/scentNotes';
import { ScentNoteIcon } from './ScentNoteIcon';
import { ChevronDown, Sprout } from 'lucide-react';

interface Props {
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function NoteFilters({ selectedIds, onToggle }: Props) {
  return <details className="note-filter-panel filter-disclosure">
    <summary><span className="filter-disclosure-icon"><Sprout size={20} aria-hidden="true" /></span><span className="filter-disclosure-copy"><span className="filter-disclosure-title">انتخاب نت‌های بویایی</span><span className="filter-disclosure-hint">رایحه را با نت‌های دلخواهت پیدا کن</span></span><span className="filter-disclosure-count">{new Intl.NumberFormat('fa-IR').format(selectedIds.length)} انتخاب</span><ChevronDown className="filter-disclosure-chevron" size={18} aria-hidden="true" /></summary>
    <p id="note-filter-help">چند نت انتخاب کنید؛ فقط عطرهایی نمایش داده می‌شوند که همهٔ نت‌های انتخاب‌شده را دارند. برای برداشتن هر نت، دوباره روی آن بزنید.</p>
    <div className="note-filter-options" role="group" aria-label="انتخاب نت‌های بویایی" aria-describedby="note-filter-help">
      {scentNotes.map(note => <button key={note.id} type="button" className="chip note-filter-option" aria-pressed={selectedIds.includes(note.id)} onClick={() => onToggle(note.id)}>
        <ScentNoteIcon note={note} decorative /><span>{note.name}</span>
      </button>)}
    </div>
  </details>;
}
