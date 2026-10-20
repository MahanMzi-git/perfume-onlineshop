import type { FragranceFamily } from '../types/fragrance';
const family = (slug: string, name: string, description: string, subfamilies: string[], representativeNoteIds: string[]): FragranceFamily => ({ id: 'f-' + slug, slug, name, description, subfamilies, representativeNoteIds });
// Educational navigation, not mutually exclusive or a chemical recipe.
export const fragranceFamilies: FragranceFamily[] = [
  family('floral', 'گلی', 'حال‌وهوای گل؛ از تک‌گل تا دسته‌گل.', ['گلی تازه', 'گلی پودری'], ['n-rose', 'n-jasmine', 'n-iris']),
  family('woody', 'چوبی', 'بافت چوب، گاهی خشک یا نرم.', ['چوبی خشک', 'چوبی نرم'], ['n-cedar', 'n-sandalwood', 'n-vetiver']),
  family('citrus', 'مرکباتی', 'برداشت روشن و پوست‌مانند از مرکبات.', ['مرکباتی سبز', 'مرکباتی آروماتیک'], ['n-bergamot', 'n-lemon']),
  family('aquatic', 'تازه / دریایی', 'تداعی آب و هوای تازه؛ اغلب آکوردی.', ['دریایی', 'آبی تازه'], ['n-seasalt', 'n-mint']),
  family('amber', 'عنبری', 'آکوردهای گرم، نرم و رزینی.', ['عنبری ادویه‌ای', 'عنبری چوبی'], ['n-amber', 'n-vanilla', 'n-incense']),
  family('fruity', 'میوه‌ای', 'تداعی میوه؛ از آبدار تا شیرین.', ['میوه‌ای گلی', 'میوه‌ای سبز'], ['n-pear']),
  family('spicy', 'ادویه‌ای', 'حضور ادویه با وجوه گرم یا تند.', ['ادویه‌ای گرم', 'ادویه‌ای تازه'], ['n-pepper']),
  family('gourmand', 'خوراکی', 'تداعی خوراکی‌ها و شیرینی، مانند وانیل.', ['وانیلی', 'خوراکی چوبی'], ['n-vanilla', 'n-sandalwood']),
  family('aromatic', 'آروماتیک', 'وجه گیاهان معطر و علفی.', ['گیاهی تازه', 'آروماتیک چوبی'], ['n-lavender', 'n-mint']),
  family('chypre', 'شیپر', 'تضاد روشن مرکبات با پایهٔ خزه‌ای یا خاکی.', ['شیپر گلی', 'شیپر میوه‌ای'], ['n-bergamot', 'n-patchouli']),
  family('fougere', 'فوژه', 'ساختاری آروماتیک با تداعی اسطوخودوس و جنگل.', ['فوژه آروماتیک', 'فوژه تازه'], ['n-lavender', 'n-bergamot', 'n-vetiver']),
  family('leather', 'چرمی', 'آکوردهایی با تداعی چرم، نرم یا دودی.', ['چرم نرم', 'چرم دودی'], ['n-leather', 'n-incense']),
  family('green', 'سبز', 'تداعی برگ، ساقه و سبزی تازه.', ['سبز مرکباتی', 'سبز آروماتیک'], ['n-mint', 'n-patchouli', 'n-vetiver']),
];
