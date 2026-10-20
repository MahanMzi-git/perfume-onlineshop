import type { ReactNode } from 'react';
import type { NoteIcon, ScentNote } from '../types/fragrance';

// Original, consistent 24px line illustrations; one glyph per library note.
const glyphs: Record<NoteIcon, ReactNode> = {
  lavender: <><path d="M12 22V4M12 7 8 5m4 6-5-3m5 7-5-3m5 7-4-2M12 9l4-3m-4 7 5-3m-5 7 5-3" /><ellipse cx="12" cy="3" rx="2" ry="1.5" /></>,
  oud: <><path d="m4 18 2-9 9-6 5 5-4 12-8 2zM7 17l9-10M10 19l7-8M7 12l5-5" /></>,
  patchouli: <><path d="M12 22V8M12 15C3 14 2 8 4 4c7 1 9 6 8 11zM12 18c8-1 10-5 8-10-6 0-8 5-8 10zM5 6l7 9m6-5-6 8" /></>,
  vetiver: <path d="M12 2v11M7 3l3 10m7-10-3 10M5 7l4 7m10-7-4 7M12 13c-6 3-3 6-7 9m7-9c6 3 3 6 7 9m-7-9v10M10 15l-1 7m5-7 1 7" />,

  rose: <><path d="M12 14c-7 0-9-9-4-10 2-3 7-2 8 0 6 2 3 10-4 10zM9 7c0-4 7-3 6 1-1 4-7 3-6-1zM12 14v8M12 19c-5 0-6-4-6-4 4 0 6 4 6 4z" /></>,
  jasmine: <><path d="M12 10C4 2 8 0 12 7c4-7 8-5 3 3 9-1 10 3 1 4 5 6 2 9-3 2-3 8-7 6-4-1-8 0-8-4 0-4z" /><circle cx="12" cy="12" r="1.5" /></>,
  bergamot: <><path d="M10 7c-8-1-9 12-1 13 3 2 10 0 10-6 0-5-5-8-9-7zM12 7c-1-4 1-5 5-5-1 4-3 5-5 5zM7 11l-1 3m9-4 2 3" /></>,
  lemon: <><path d="M5 7 3 6 2 9c-2 7 7 14 14 10l3-1-1-3C21 7 12 1 5 7zM6 10c1-2 4-3 6-2M8 14h.01" /></>,
  cedar: <path d="M12 2 7 8h3L5 14h4l-6 5h18l-6-5h4l-5-6h3zM12 19v3" />,
  sandalwood: <><path d="m4 15 11-9c5-3 9 4 4 7L8 21c-4 2-7-3-4-6zM5 15c4-2 7 3 3 6M10 13l6-5M12 15l5-4" /><ellipse cx="6" cy="18" rx="1" ry="1.5" /></>,
  seasalt: <><path d="m4 11 4-3 4 3-4 4zM13 7l4-3 4 3-4 4zM14 16l3-2 3 2-3 3zM2 20q5-2 10 0t10 0" /></>,
  amber: <path d="m8 3 9 1 4 9-6 8-10-3-3-8zM8 3l1 7-4 8M9 10l8-6M9 10l6 11M9 10l12 3" />,
  pear: <><path d="M12 6c-4 0-3 4-6 7-5 6 0 9 6 9s11-3 6-9c-3-3-2-7-6-7zM12 6V2M12 4c2-3 5-3 7-2-2 3-5 4-7 2z" /></>,
  pepper: <><path d="M12 5c4 0 6 3 5 6-2 6-7 9-13 10 5-5 3-8 4-11 1-3 2-5 4-5zM12 5c1-3 3-3 5-3" /><circle cx="19" cy="16" r="1.5" /><circle cx="16" cy="21" r="1" /></>,
  vanilla: <><path d="M7 22C7 12 13 4 18 2c-1 9-5 17-11 20zM7 22 17 4M4 16C2 8 5 5 9 8M5 10c3-4 8-3 8 1" /><circle cx="6" cy="10" r="2" /></>,
  musk: <><path d="M7 18a5 5 0 0 1-3-9c0-7 12-8 14-2 6 2 4 12-2 13-4 1-6 0-9-2zM7 12c-2-5 7-7 9-2M8 15c2 3 6 2 7-1" /></>,
  mint: <><path d="M12 22V10M12 15C3 16 2 10 3 5c7 1 9 5 9 10zM12 19c9 1 10-6 9-11-7 1-9 5-9 11zM5 8l7 7m7-4-7 8" /></>,
  iris: <><path d="M12 12C4 8 8 2 12 2c4 0 8 6 0 10zM12 12C4 5 0 12 4 16c3 2 6 0 8-4zM12 12c8-7 12 0 8 4-3 2-6 0-8-4zM12 12v10M12 21c-5-6-7-4-7-4" /></>,
  leather: <><path d="M6 2c2 3 10 3 12 0l4 5c-5 3-5 7 0 10l-4 5c-2-3-10-3-12 0l-4-5c5-3 5-7 0-10z" /><path d="M9 8h6M8 12h8M9 16h6" strokeDasharray="1 3" /></>,
  incense: <><path d="M3 21h18M7 21 16 11M10 10c-4-4 4-4 1-8M16 8c-3-3 3-3 2-6" /><path d="M5 18h7" /></>,
};

export function ScentNoteIcon({ note, size = 22, decorative = false }: { note: ScentNote; size?: number; decorative?: boolean }) {
  return <svg className="note-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    role={decorative ? undefined : 'img'} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : note.name} focusable="false">
    {!decorative && <title>{note.name}</title>}{glyphs[note.icon]}
  </svg>;
}
