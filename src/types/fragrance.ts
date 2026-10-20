export type NoteIcon = 'rose'|'jasmine'|'bergamot'|'lemon'|'cedar'|'sandalwood'|'seasalt'|'amber'|'pear'|'pepper'|'vanilla'|'musk'|'mint'|'iris'|'leather'|'incense'|'lavender'|'oud'|'patchouli'|'vetiver';
export type NoteCategory = 'floral'|'citrus'|'woody'|'aquatic'|'amber'|'fruity'|'spicy'|'gourmand'|'musk'|'green'|'powdery'|'leather'|'smoky';
export interface ScentNote { id: string; name: string; slug: string; category: NoteCategory; icon: NoteIcon; description?: string }
export interface FragranceFamily { id: string; name: string; slug: string; description: string; subfamilies: string[]; representativeNoteIds: string[] }
export interface Brand { id: string; name: string }
