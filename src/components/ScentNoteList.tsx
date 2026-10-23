import { useEffect, useRef, useState } from 'react';
import { noteById } from '../data/scentNotes';
import { ScentNoteIcon } from './ScentNoteIcon';
interface Props { noteIds: string[]; max?: number; onSelect?: (id: string) => void; selectedNoteIds?: string[] }
export function ScentNoteList({ noteIds, max = 4, onSelect, selectedNoteIds = [] }: Props) {
  const notes = noteIds.slice(0, max).map(noteById).filter((note) => note !== undefined);
  const list = useRef<HTMLUListElement>(null);
  const [compactOrder, setCompactOrder] = useState<string[]>([]);
  const noteKey = notes.map(note => note.id).join('|');

  useEffect(() => {
    const element = list.current;
    if (!element) return;
    const mobile = matchMedia('(max-width:600px)');
    const sourceOrder = noteKey.split('|');
    let frame = 0;
    const arrange = () => {
      let next: string[] = [];
      if (mobile.matches) {
        const items = Array.from(element.children).map(item => {
          const id = (item as HTMLElement).dataset.noteId!;
          return { id, width: item.firstElementChild!.getBoundingClientRect().width, index: sourceOrder.indexOf(id) };
        });
        const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
        const available = element.getBoundingClientRect().width;
        const total = items.reduce((sum, item) => sum + item.width, 0) + gap * (items.length - 1);
        if (total > available) {
          const remaining = items.sort((a, b) => b.width - a.width || a.index - b.index);
          // Start each row with its widest chip, then fill it with short chips.
          // Real rendered widths account for Persian glyphs, icons and loaded fonts.
          while (remaining.length) {
            const longest = remaining.shift()!;
            next.push(longest.id);
            let used = longest.width;
            while (remaining.length && used + gap + remaining[remaining.length - 1].width <= available) {
              const shortest = remaining.pop()!;
              next.push(shortest.id);
              used += gap + shortest.width;
            }
          }
        }
      }
      setCompactOrder(previous => previous.length === next.length && previous.every((id, index) => id === next[index]) ? previous : next);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(arrange); };
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    Array.from(element.children).forEach(item => observer.observe(item));
    mobile.addEventListener('change', schedule);
    schedule();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); mobile.removeEventListener('change', schedule); };
  }, [noteKey]);

  const displayed = compactOrder.length === notes.length && notes.every(note => compactOrder.includes(note.id))
    ? compactOrder.map(id => notes.find(note => note.id === id)!) : notes;
  return (
    <ul className="notes" ref={list}>
      {displayed.map((n) => (
        <li key={n.id} data-note-id={n.id}>
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
