import type { ScentNote, NoteCategory } from '../types/fragrance';
// Central scent-note library. Products reference notes by id only; the icon comes from here.
const n = (id: string, name: string, category: NoteCategory, description?: string): ScentNote =>
  ({ id: `n-${id}`, name, slug: id, category, icon: category, description });
export const scentNotes: ScentNote[] = [
  n('rose', 'گل رز', 'floral'), n('jasmine', 'یاس', 'floral'), n('bergamot', 'برگاموت', 'citrus'), n('lemon', 'لیمو', 'citrus'),
  n('cedar', 'سدر', 'woody'), n('sandalwood', 'صندل', 'woody'), n('seasalt', 'نمک دریا', 'aquatic'), n('amber', 'عنبر', 'amber'),
  n('pear', 'گلابی', 'fruity'), n('pepper', 'فلفل', 'spicy'), n('vanilla', 'وانیل', 'gourmand'), n('musk', 'مشک', 'musk'),
  n('mint', 'نعنا', 'green'), n('iris', 'زنبق', 'powdery'), n('leather', 'چرم', 'leather'), n('incense', 'بخور', 'smoky'),
];
export const noteById = (id: string) => scentNotes.find((x) => x.id === id);
