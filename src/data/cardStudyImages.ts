import type { Audience, Product } from '../types/product';

// Approved default. Keep an explicit legacy switch for reversible comparisons.
export const isCardStudy = typeof window === 'undefined' || new URLSearchParams(window.location.search).get('cardPreview') !== 'legacy';
interface CardStudyImage {
  src: string; alt: string; name: string; brandId: string;
  noteIds: string[]; families: string[]; audience: Audience; source: string;
}
// Verified identities and selected notes; commercial data remains explicitly demo.
export const cardStudyImages: Record<string, CardStudyImage> = {
  'study-p1': { src:`${import.meta.env.BASE_URL}images/card-study/batch-4.webp`, alt:'کوکو مادمازل شنل در کنار گل صورتی', name:'Coco Mademoiselle', brandId:'study-chanel', noteIds:['n-jasmine','n-rose','n-patchouli','n-vetiver'], families:['f-floral','f-chypre'], audience:'women', source:'https://www.chanel.com/us/fragrance/p/116520/coco-mademoiselle-eau-de-parfum-spray/' },
  'study-p2': { src:`${import.meta.env.BASE_URL}images/card-study/batch-2.jpg`, alt:'بطری ساواژ دیور میان چوب و مرکبات', name:'Sauvage', brandId:'study-dior', noteIds:['n-bergamot','n-vanilla'], families:['f-citrus','f-amber'], audience:'men', source:'https://www.dior.com/en_us/beauty/products/sauvage-eau-de-parfum-E000000376.html' },
  'study-p3': { src:`${import.meta.env.BASE_URL}images/card-study/reference-12.jpg`, alt:'بلو دو شنل با پس‌زمینهٔ گرم', name:'Bleu de Chanel', brandId:'study-chanel', noteIds:['n-cedar','n-sandalwood','n-musk'], families:['f-woody','f-aromatic'], audience:'men', source:'https://www.chanel.com/us/fragrance/p/107350/bleu-de-chanel-eau-de-parfum-spray/' },
  'study-p4': { src:`${import.meta.env.BASE_URL}images/card-study/batch-3.jpg`, alt:'بطری اونتوس کرید در کنار آناناس', name:'Aventus', brandId:'study-creed', noteIds:['n-bergamot','n-patchouli'], families:['f-woody','f-fruity'], audience:'men', source:'https://www.creedfragrance.com/c/journal/aventus-your-questions-answered/' },
  'study-p5': { src:`${import.meta.env.BASE_URL}images/card-study/batch-6.jpg`, alt:'بطری لیبر ایو سن لوران با نشان طلایی', name:'Libre', brandId:'study-ysl', noteIds:['n-lavender','n-vanilla','n-musk'], families:['f-floral','f-aromatic'], audience:'women', source:'https://www.yslbeautyus.com/fragrance/womens-fragrances/libre/libre-eau-de-parfum/3614272648401.html' },
  'study-p6': { src:`${import.meta.env.BASE_URL}images/card-study/batch-5.jpg`, alt:'بطری میس دیور با پاپیون در دست و کنار گل‌ها', name:'Miss Dior', brandId:'study-dior', noteIds:['n-rose','n-iris'], families:['f-floral'], audience:'women', source:'https://www.dior.com/en_us/beauty/products/Y0996484-product' },
  'study-p7': { src:`${import.meta.env.BASE_URL}images/card-study/batch-7.jpg`, alt:'بطری گوچی بلوم میان گل‌های سفید و چوب', name:'Bloom', brandId:'study-gucci', noteIds:['n-jasmine','n-tuberose'], families:['f-floral'], audience:'women', source:'https://www.gucci.com/us/en/pr/beauty/fragrances/fragrances-for-women/gucci-bloom-100ml-eau-de-parfum-p-488830999990099' },
  'study-p8': { src:`${import.meta.env.BASE_URL}images/card-study/batch-1.jpg`, alt:'بطری ژسمن دز آنژ دیور میان گل‌های یاس', name:'Jasmin des Anges', brandId:'study-dior', noteIds:['n-jasmine','n-apricot'], families:['f-floral','f-fruity'], audience:'unisex', source:'https://www.dior.com/en_us/beauty/products/jasmin-des-anges-Y0742427.html' },
  'study-p9': { src:`${import.meta.env.BASE_URL}images/card-study/batch-8.jpg`, alt:'بطری کلوئه با روبان کرمی روی سنگ', name:'Chloé', brandId:'study-chloe', noteIds:['n-rose','n-cedar'], families:['f-floral'], audience:'women', source:'https://www.chloe.com/en-us/p/fragrances/eau-de-parfum/CHCA64980408.html' },
};
export const cardStudyBrands = [
  {id:'study-chanel',name:'Chanel'}, {id:'study-dior',name:'Dior'}, {id:'study-creed',name:'Creed'},
  {id:'study-ysl',name:'Yves Saint Laurent'}, {id:'study-gucci',name:'Gucci'}, {id:'study-chloe',name:'Chloé'},
];

// Scent descriptions follow the linked house references. Some houses describe
// a single accord instead of publishing distinct top, heart and base notes.
const scentDescriptions: Record<string, string> = {
  'study-p1': 'پرتقال شروعی روشن و آبدار دارد. در میانه، یاس و رزِ مه رایحه را گلی و لطیف می‌کنند. پچولی و وتیور در پایان، حال‌وهوایی چوبی و خاکی به آن می‌دهند.',
  'study-p2': 'برگاموت کالابریا رایحه را با تازگی مرکباتی باز می‌کند. فلفل سیچوان، اسطوخودوس و بادیان ستاره‌ای در میانه گرما و تندی می‌آورند. وانیل و آمبروکسان در پایان ردّی گرم و کمی دودی به جا می‌گذارند.',
  'study-p3': 'شروع رایحه تازه و گیاهی است. در ادامه سدر، لحن چوبی را پررنگ‌تر می‌کند و صندل کالدونیای جدید با گرمای نرمش به پایان عمق می‌دهد. ته‌مایه‌های عنبری و مُشکی هم در این ترکیب چوبی حس می‌شوند.',
  'study-p4': 'برگاموت و لیمو شروعی ترد و مرکباتی می‌سازند. در میانه، آکورد آناناس با فلفل صورتی و یاس جان می‌گیرد. در پایان، توسِ دودی و پچولی به رایحه عمق می‌دهند و مُشک آن را نرم‌تر می‌کند.',
  'study-p5': 'اسطوخودوس و برگاموت شروعی خنک و معطر می‌سازند. در میانه، شکوفهٔ پرتقال و یاس وجه گلی لیبر را نشان می‌دهند. پایان رایحه با وانیل و مُشک، گرم و نرم است.',
  'study-p6': 'در نسخهٔ گلی میس دیور، حس تازهٔ زنبقِ دره و لطافت گل صدتومانی کنار رز سنتیفولیا و زنبق پودری قرار می‌گیرند. دیور این گل‌ها را در دل رایحه توصیف می‌کند و پایان آن را به چوب‌های نرم می‌سپارد.',
  'study-p7': 'گوچی بلوم از همان شروع، یاس و گل مریم را کنار هم نشان می‌دهد. گل پیچ رانگون هم بافتی گلی و کمی پودری به ترکیب می‌دهد. گوچی این رایحه را یک دسته‌گل یکپارچه توصیف می‌کند که از ابتدا باز می‌شود و میانه و پایهٔ جداگانه‌ای برای آن معرفی نمی‌کند.',
  'study-p8': 'در ژسمن دز آنژ، یاسِ شیرین محور رایحه است. زردآلو به آن حال‌وهوای میوهٔ رسیده می‌دهد و ته‌مایهٔ عسل گرمایش را بیشتر می‌کند. دیور این سه وجه را در کنار هم معرفی می‌کند و ترتیب جداگانه‌ای برای شروع، میانه و پایان آن‌ها مشخص نکرده است.',
  'study-p9': 'گل صدتومانی شروعی گلی و تازه می‌سازد. در میانه، گلبرگ رز و مگنولیا رایحه را نرم و کمی پودری می‌کنند. سدر و عنبر سائل در پایان، ردّی چوبی و گرم به جا می‌گذارند.',
};

export function createCardStudyProducts(demos: Product[]): Product[] {
  return Object.entries(cardStudyImages).map(([id, reference], index) => {
    const base = demos[index % demos.length];
    const name = reference.name;
    const variants = base.variants.filter(v => v.concentration === base.concentration).map((v, i) => ({ ...v, id:`${id}-${i}-EDP`, concentration:'EDP' as const }));
    return { ...base, id, name, slug:name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-'), brandId:reference.brandId, image:reference.src,
      concentration:'EDP', targetAudience:reference.audience, fragranceFamilyIds:reference.families, scentNoteIds:reference.noteIds,
      variants, isGiftSet:false, productType:'perfume', reviews:[
        { id:`${id}-sample-1`, score:5, text:'نمونهٔ دیدگاه برای بررسی طراحی؛ این متن تجربهٔ خریدار واقعی نیست.' },
        { id:`${id}-sample-2`, score:index % 3 === 0 ? 3 : 4, text:'متن آزمایشی دوم برای نمایش بخش امتیاز و نظر؛ بدون خرید واقعی.' },
        ...(index % 2 ? [{ id:`${id}-sample-3`, score:4, text:'نمونهٔ سومِ رابط دیدگاه‌ها، صرفاً برای تست.' }] : []),
      ],
      gallery:[{src:reference.src,alt:reference.alt,view:'bottle'}],
      notePyramid:{top:[],middle:reference.noteIds,base:[]},
      description: scentDescriptions[id],
    };
  });
}
