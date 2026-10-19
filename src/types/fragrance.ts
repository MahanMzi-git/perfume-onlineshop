export type NoteCategory = 'floral'|'citrus'|'woody'|'aquatic'|'amber'|'fruity'|'spicy'|'gourmand'|'musk'|'green'|'powdery'|'leather'|'smoky';
export interface ScentNote { id: string; name: string; slug: string; category: NoteCategory; icon: NoteCategory; description?: string }
export interface FragranceFamily { id: string; name: string; slug: string }
export interface Brand { id: string; name: string }
