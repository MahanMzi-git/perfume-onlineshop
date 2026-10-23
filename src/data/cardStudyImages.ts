import type { Audience, Product } from '../types/product';

// Approved default. Keep an explicit legacy switch for reversible comparisons.
export const isCardStudy = typeof window === 'undefined' || new URLSearchParams(window.location.search).get('cardPreview') !== 'legacy';
interface CardStudyImage {
  src: string; alt: string; name: string; brandId: string;
  noteIds: string[]; families: string[]; audience: Audience; source: string;
}
// Verified identities and selected notes; commercial data remains explicitly demo.
export const cardStudyImages: Record<string, CardStudyImage> = {
  'study-p1': { src:'/images/card-study/batch-4.webp', alt:'کوکو مادمازل شنل در کنار گل صورتی', name:'Coco Mademoiselle', brandId:'study-chanel', noteIds:['n-jasmine','n-rose','n-patchouli','n-vetiver'], families:['f-floral','f-chypre'], audience:'women', source:'https://www.chanel.com/us/fragrance/p/116520/coco-mademoiselle-eau-de-parfum-spray/' },
  'study-p2': { src:'/images/card-study/batch-2.jpg', alt:'بطری ساواژ دیور میان چوب و مرکبات', name:'Sauvage', brandId:'study-dior', noteIds:['n-bergamot','n-vanilla'], families:['f-citrus','f-amber'], audience:'men', source:'https://www.dior.com/en_us/beauty/products/sauvage-eau-de-parfum-E000000376.html' },
  'study-p3': { src:'/images/card-study/reference-12.jpg', alt:'بلو دو شنل با پس‌زمینهٔ گرم', name:'Bleu de Chanel', brandId:'study-chanel', noteIds:['n-cedar','n-sandalwood','n-musk'], families:['f-woody','f-aromatic'], audience:'men', source:'https://www.chanel.com/us/fragrance/p/107350/bleu-de-chanel-eau-de-parfum-spray/' },
  'study-p4': { src:'/images/card-study/batch-3.jpg', alt:'بطری اونتوس کرید در کنار آناناس', name:'Aventus', brandId:'study-creed', noteIds:['n-bergamot','n-patchouli'], families:['f-woody','f-fruity'], audience:'men', source:'https://www.creedfragrance.com/c/journal/aventus-your-questions-answered/' },
  'study-p5': { src:'/images/card-study/batch-6.jpg', alt:'بطری لیبر ایو سن لوران با نشان طلایی', name:'Libre', brandId:'study-ysl', noteIds:['n-lavender','n-vanilla','n-musk'], families:['f-floral','f-aromatic'], audience:'women', source:'https://www.yslbeautyus.com/fragrance/womens-fragrances/libre/libre-eau-de-parfum/3614272648401.html' },
  'study-p6': { src:'/images/card-study/batch-5.jpg', alt:'بطری میس دیور با پاپیون در دست و کنار گل‌ها', name:'Miss Dior', brandId:'study-dior', noteIds:['n-rose','n-iris'], families:['f-floral'], audience:'women', source:'https://www.dior.com/en_us/beauty/products/Y0996484-product' },
  'study-p7': { src:'/images/card-study/batch-7.jpg', alt:'بطری گوچی بلوم میان گل‌های سفید و چوب', name:'Bloom', brandId:'study-gucci', noteIds:['n-jasmine','n-tuberose'], families:['f-floral'], audience:'women', source:'https://www.gucci.com/us/en/pr/beauty/fragrances/fragrances-for-women/gucci-bloom-100ml-eau-de-parfum-p-488830999990099' },
  'study-p8': { src:'/images/card-study/batch-1.jpg', alt:'بطری ژسمن دز آنژ دیور میان گل‌های یاس', name:'Jasmin des Anges', brandId:'study-dior', noteIds:['n-jasmine','n-apricot'], families:['f-floral','f-fruity'], audience:'unisex', source:'https://www.dior.com/en_us/beauty/products/jasmin-des-anges-Y0742427.html' },
  'study-p9': { src:'/images/card-study/batch-8.jpg', alt:'بطری کلوئه با روبان کرمی روی سنگ', name:'Chloé', brandId:'study-chloe', noteIds:['n-rose','n-cedar'], families:['f-floral'], audience:'women', source:'https://www.chloe.com/en-us/p/fragrances/eau-de-parfum/CHCA64980408.html' },
};
export const cardStudyBrands = [
  {id:'study-chanel',name:'Chanel'}, {id:'study-dior',name:'Dior'}, {id:'study-creed',name:'Creed'},
  {id:'study-ysl',name:'Yves Saint Laurent'}, {id:'study-gucci',name:'Gucci'}, {id:'study-chloe',name:'Chloé'},
];
export function createCardStudyProducts(demos: Product[]): Product[] {
  return Object.entries(cardStudyImages).map(([id, reference], index) => {
    const base = demos[index % demos.length];
    const name = reference.name;
    const variants = base.variants.filter(v => v.concentration === base.concentration).map((v, i) => ({ ...v, id:`${id}-${i}-EDP`, concentration:'EDP' as const }));
    return { ...base, id, name, slug:name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-'), brandId:reference.brandId, image:reference.src,
      concentration:'EDP', targetAudience:reference.audience, fragranceFamilyIds:reference.families, scentNoteIds:reference.noteIds,
      variants, isGiftSet:false, productType:'perfume', reviews:[],
      gallery:[{src:reference.src,alt:reference.alt,view:'bottle'}],
      notePyramid:{top:[],middle:reference.noteIds,base:[]},
      description:'عکس و نام این عطر واقعی است؛ نت‌های منتخب از معرفی برند استخراج شده‌اند و ترتیب تبخیر را نشان نمی‌دهند. قیمت، حجم‌ها، موجودی و سایر ویژگی‌های خرید صرفاً برای آزمون رابط نمایشی هستند.' + (id === 'study-p6' ? ' نت‌های این نمونه مربوط به نسخهٔ گلی میس دیور پیش از بازفرمولاسیون جدید است.' : ''),
    };
  });
}
