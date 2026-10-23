import type { ScentNote, NoteCategory, NoteIcon } from '../types/fragrance';
import { isCardStudy } from './cardStudyImages';
const descriptions: Record<NoteIcon, string> = {
  rose: 'برداشت گلی با حال‌وهوای رز؛ وجه تازه یا پودری آن به ترکیب بستگی دارد.',
  jasmine: 'برداشت گلی با تداعی گل‌های سفید؛ شدت آن در هر ترکیب متفاوت است.',
  bergamot: 'برداشت مرکباتی با تداعی پوست برگاموت؛ یکی از مسیرهای کشف عطرهای روشن.',
  lemon: 'برداشت روشن و مرکباتی با تداعی پوست لیمو.',
  cedar: 'در این مجموعه بافت چوبی و خشک را نمایندگی می‌کند.',
  sandalwood: 'برداشت چوبی نرم، با تداعی بافت خامه‌ای در این پروفایل‌ها.',
  seasalt: 'آکوردی با تداعی نمک و هوای دریایی؛ نام یک حس بویایی است.',
  amber: 'آکورد گرم و رزینی؛ در این مجموعه منظور عنبر دریایی نیست.',
  pear: 'برداشت میوه‌ای با تداعی گلابی و طراوت آبدار.',
  pepper: 'وجه ادویه‌ای و تند؛ در این مجموعه برای مقایسهٔ پروفایل‌ها به کار رفته است.',
  vanilla: 'برداشت شیرین و خوراکی با تداعی وانیل؛ الزاماً همهٔ عطرهای دارای آن شیرین نیستند.',
  musk: 'آکورد نرم و پوستی؛ این نام، منشأ ماده یا طبیعی‌بودن آن را مشخص نمی‌کند.',
  mint: 'برداشت سبز و خنک با تداعی نعنا.',
  iris: 'برداشت پودری و گلی در پروفایل‌های نمایشی این مجموعه.',
  leather: 'آکوردی با تداعی چرم؛ این برچسب به معنی وجود چرم در محصول نیست.',
  incense: 'تداعی بخور و وجه دودی یا رزینی در پروفایل نمایشی.',
  lavender: 'برداشت گیاهی و آروماتیک با تداعی اسطوخودوس.',
  oud: 'برداشت چوبی و عمیق، با وجه دودی در این پروفایل نمایشی.',
  patchouli: 'برداشت خاکی و سبز، برای شناخت وجه عمیق‌تر بعضی ترکیب‌ها.',
  vetiver: 'برداشت چوبی و علفی؛ در این مجموعه نمایندهٔ وجه خشک‌تر رایحه است.',
  apricot: 'برداشت میوه‌ای و نرم با تداعی زردآلو؛ در هر ترکیب متفاوت است.',
  tuberose: 'برداشت گلی سفید با تداعی گل مریم؛ شدت و بافت آن به ترکیب بستگی دارد.',
};
// Central scent-note library. Products reference notes by id only; the icon comes from here.
const n = (id: NoteIcon, name: string, category: NoteCategory, description?: string): ScentNote =>
  ({ id: `n-${id}`, name, slug: id, category, icon: id, description: description ?? descriptions[id] });
export const scentNotes: ScentNote[] = [
  n('rose', 'گل رز', 'floral'), n('jasmine', 'یاس', 'floral'), n('bergamot', 'برگاموت', 'citrus'), n('lemon', 'لیمو', 'citrus'),
  n('cedar', 'سدر', 'woody'), n('sandalwood', 'صندل', 'woody'), n('seasalt', 'نمک دریا', 'aquatic'), n('amber', 'عنبر', 'amber'),
  n('pear', 'گلابی', 'fruity'), n('pepper', 'فلفل', 'spicy'), n('vanilla', 'وانیل', 'gourmand'), n('musk', 'مشک', 'musk'),
  n('lavender', 'اسطوخودوس', 'green'), n('oud', 'عود', 'woody'), n('patchouli', 'پچولی', 'green'), n('vetiver', 'وتیور', 'woody'),
  n('mint', 'نعنا', 'green'), n('iris', 'زنبق', 'powdery'), n('leather', 'چرم', 'leather'), n('incense', 'بخور', 'smoky'),
  ...(isCardStudy ? [n('apricot','زردآلو','fruity'),n('tuberose','مریم','floral')] : []),
];
export const noteById = (id: string) => scentNotes.find((x) => x.id === id);
