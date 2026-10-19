import type { ReactNode } from 'react';
import type { NoteCategory, ScentNote } from '../types/fragrance';
// One glyph per note category; the same note always resolves to the same glyph.
const glyphs: Record<NoteCategory, ReactNode> = {
  floral: <>{[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx="12" cy="6.5" rx="2.4" ry="3.8" transform={`rotate(${r} 12 12)`} />)}<circle cx="12" cy="12" r="1.6" /></>,
  citrus: <><circle cx="12" cy="12" r="8" /><path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3L6.3 17.7" /></>,
  woody: <path d="M12 21v-5M12 3l6 8h-3l4 6H5l4-6H6z" />,
  aquatic: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  amber: <path d="M12 3l7 9-7 9-7-9zM5 12h14" />,
  fruity: <><circle cx="12" cy="14" r="6" /><path d="M12 8c0-3 1-4 3.5-5" /></>,
  spicy: <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z" />,
  gourmand: <><circle cx="12" cy="12" r="8" /><path d="M9 9h.01M14 8h.01M15 13h.01M10 15h.01" strokeWidth="2.4" /></>,
  musk: <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1A4.5 4.5 0 0 1 17 18z" />,
  green: <path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14zM5 19L15 9" />,
  powdery: <><circle cx="12" cy="12" r="7.5" strokeDasharray="2 3" /><path d="M12 12h.01" strokeWidth="3" /></>,
  leather: <><rect x="4" y="7" width="16" height="10" rx="2" /><path d="M7 12h10" strokeDasharray="2 2" /></>,
  smoky: <path d="M9 21c-2-3 2-4 0-7s2-4 0-7M15 21c-2-3 2-4 0-7s2-4 0-7" />,
};
export function ScentNoteIcon({ note, size = 22 }: { note: ScentNote; size?: number }) {
  return (
    <svg className="note-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={note.name}>
      <title>{note.name}</title>{glyphs[note.icon]}
    </svg>
  );
}
