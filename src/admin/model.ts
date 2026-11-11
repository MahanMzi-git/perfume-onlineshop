import { familyImageUrl, noteImageUrl } from '../data/fragranceImages';
import { officialBrandLogo } from './brandLogos';
import {seasonLabels,occasionLabels} from '../data/catalogLabels';
import { products } from '../data/products';
import { brands } from '../data/brands';
import { fragranceFamilies } from '../data/fragranceFamilies';
import { scentNotes } from '../data/scentNotes';
import { assignVariantCodes, manualVariantCodeError } from '../lib/variantCodes';

export type AdminRole = 'visitor' | 'seller' | 'analyst';
export type AdminGroup = 'seller';
export const roles: Record<AdminRole,string> = { visitor:'بازدیدکننده', seller:'فروشنده', analyst:'تحلیلگر فقط‌خواندنی' };
export function canAccess(role: AdminRole, group: AdminGroup) { return group === 'seller' && (role === 'seller' || role === 'analyst'); }
export function canEdit(role: AdminRole, group: AdminGroup) { return canAccess(role,group) && role !== 'analyst'; }
export const sellerPages = [
 ['overview','نمای کلی'],['products','محصولات'],['product-new','افزودن محصول'],['brands','برندها'],['families','خانواده‌های رایحه'],['notes','نت‌های بویایی'],['variants','حجم و قیمت'],['inventory','موجودی'],['orders','سفارش‌ها'],['customers','جستجوی مشتری'],['campaigns','تخفیف و کمپین'],['reviews','مدیریت دیدگاه‌ها'],['content','محتوای صفحهٔ اول'],['shipping','تنظیمات ارسال'],['support','پشتیبانی'],['reports','گزارش فروش'],['settings','فروشگاه و پروفایل'],
] as const;
export interface AdminRoute { group:AdminGroup; section:string; id?:string; stockFilter?:'low'; galleryPreview?:boolean; mockSaveError?:boolean }
export function parseAdminPath(segments:string[]): AdminRoute | undefined {
 const group=segments[0]; if(group!=='seller')return;
 const section=segments[1]??'overview';
 const pages=sellerPages;
 if(segments.length<=2&&pages.some(([key])=>key===section))return {group,section};
 if(group==='seller'&&segments.length===3&&['products','orders'].includes(section))return {group,section:section==='products'?'product-edit':'order-detail',id:segments[2]};
}
export const sellerConcentrations = ['EDP', 'EDT'];
export interface AdminVariant { concentration?:string; manualCode?:string; createdAt?:number; id:string; volume:number; price:number; stock:number }
export interface AdminProduct { id:string; createdAt?:number; name:string; brand:string; family:string; notes:string; audience?:string; seasons?:string[]; occasions?:string[]; dayTimes?:string[]; image:string; status:string; variants:AdminVariant[] }
export function codedVariants(products:AdminProduct[]) {
 return assignVariantCodes(products.flatMap(product=>product.variants.map(variant=>({product,variant}))),
  ({product,variant})=>({...variant,name:product.name})).map(({entry,code})=>({...entry,code}));
}
export function savedManualVariantCodes(products:AdminProduct[], excluding?:AdminVariant) {
 return products.flatMap(p=>p.variants.flatMap(v=>v!==excluding&&v.manualCode?[v.manualCode]:[]));
}
export interface AdminRecord { createdAt?:number; representativeNotes?:string; noteId?:string; logo?:string; imageZoom?:number; imageCrop?:{x:number;y:number}; domain?:string; id:string; name:string; detail:string; status:string; value:string }
export const orderSteps=['در حال پردازش','در حال بسته‌بندی','آمادهٔ ارسال','ارسال شده','تحویل شده'];
export interface AdminOrder { id:string; createdAt?:number; customer:string; status:string; product:string; productId?:string; variantId?:string; quantity:number; total:number; history:string[] }
export interface AdminState { products:AdminProduct[]; orders:AdminOrder[]; records:Record<string,AdminRecord[]>; settings:Record<string,Record<string,string>> }
export const money=(n:number)=>new Intl.NumberFormat('fa-IR').format(n)+' تومان';
export const number=(n:number)=>new Intl.NumberFormat('fa-IR').format(n);
export function validInteger(value:string,min:number,max:number) { return /^\d+$/.test(value)&&Number.isSafeInteger(Number(value))&&Number(value)>=min&&Number(value)<=max; }
export function validateAdminProduct(p:Pick<AdminProduct,'name'|'brand'|'family'|'notes'>) {
 const e:Record<string,string>={};if(p.name.trim().length<2)e.name='نام محصول باید دست‌کم دو نویسه باشد.';
 if(!p.brand.trim())e.brand='برند را انتخاب کنید.';if(!p.family.trim())e.family='خانوادهٔ رایحه را انتخاب کنید.';
 if(!p.notes.trim())e.notes='دست‌کم یک نت بویایی بنویسید.';return e;
}
export function updateVariant(state:AdminState,productId:string,variantId:string,patch:Partial<Pick<AdminVariant,'stock'|'price'|'volume'|'manualCode'>>):AdminState {
 const product=state.products.find(p=>p.id===productId),variant=product?.variants.find(v=>v.id===variantId);if(!variant)return state;
 if('concentration' in patch && patch.concentration!==variant.concentration)return state;
 const next={...variant,...patch};
 next.manualCode=next.manualCode?.trim()||undefined;
 if(manualVariantCodeError(next.manualCode,savedManualVariantCodes(state.products,variant)))return state;
 if(!Number.isInteger(next.stock)||next.stock<0||next.stock>9999||!Number.isSafeInteger(next.price)||next.price<1||!Number.isInteger(next.volume)||next.volume<1||next.volume>1000)return state;
 if(next.volume!==variant.volume&&product!.variants.some(v=>v.id!==variantId&&v.volume===next.volume&&v.concentration===variant.concentration))return state;
 return {...state,products:state.products.map(p=>p.id!==productId?p:{...p,variants:p.variants.map(v=>v.id===variantId?next:v)})};
}
export function advanceOrder(state:AdminState,id:string,next:string):AdminState {
 const order=state.orders.find(o=>o.id===id);if(!order||!orderSteps.includes(next)||orderSteps.indexOf(next)!==orderSteps.indexOf(order.status)+1)return state;
 return {...state,orders:state.orders.map(o=>o.id===id?{...o,status:next,history:[...o.history,next]}:o)};
}
const record=(id:string,name:string,detail:string,status='فعال',value=''):AdminRecord=>({id,name,detail,status,value});
const demoCreatedAt=(index:number)=>Date.UTC(2026,9,1-index);
const datedDemoRecords=(records:AdminRecord[])=>records.map((item,index)=>({...item,createdAt:demoCreatedAt(index)}));
export function createAdminState():AdminState {
 return {
  products:products.map(p=>({id:p.id,createdAt:Date.parse(p.addedAt)||undefined,name:p.name,brand:brands.find(b=>b.id===p.brandId)?.name??p.brandId,audience:({women:'زنانه',men:'مردانه',unisex:'یونیسکس'}[p.targetAudience]),family:fragranceFamilies.find(f=>f.id===p.fragranceFamilyIds[0])?.name??'گلی',notes:p.scentNoteIds.map(id=>scentNotes.find(n=>n.id===id)?.name).filter(Boolean).join('، '),seasons:p.seasons.map(s=>seasonLabels[s]),occasions:p.occasions.map(o=>occasionLabels[o]).filter(o=>o!=='عصر و شب'),dayTimes:p.occasions.includes('evening')?['عصر','شب']:[],image:p.image,status:'فعال',variants:p.variants.map(v=>({id:v.id,createdAt:Date.parse(p.addedAt)||0,volume:v.volumeMl,concentration:v.concentration,price:v.price,stock:v.stock}))})),
  orders:products.slice(0,6).map((p,i)=>({id:'DEMO-'+(1001+i),createdAt:demoCreatedAt(i),customer:'مشتری '+number(i+1),status:orderSteps[i%5],product:p.name,productId:p.id,variantId:p.variants.find(v=>v.price===p.price&&v.concentration===p.concentration)?.id,quantity:i%2+1,total:p.price*(i%2+1),history:orderSteps.slice(0,i%5+1)})),
  records:{
   brands:brands.map((b,i)=>({...record('brand-'+i,b.name,'برند مرجع؛ رکورد مدیریتی'),...officialBrandLogo(b.id)})),
   families:fragranceFamilies.map((family,i)=>({
    ...record('family-'+i,family.name,family.description),
    logo:familyImageUrl(family.slug),
    representativeNotes:family.representativeNoteIds.map(id=>scentNotes.find(note=>note.id===id)?.name).filter(Boolean).join('، '),
   })),
   notes:scentNotes.map((note,i)=>({
    ...record('note-'+i,note.name,note.description??note.name),
    noteId:note.id,
    logo:noteImageUrl(note.slug),
    value:fragranceFamilies.filter(family=>family.representativeNoteIds.includes(note.id)).map(family=>family.name).join('، '),
   })),
   customers:datedDemoRecords(Array.from({length:8},(_,i)=>record('CUSTOMER-DEMO-'+(i+1),'مشتری '+number(i+1),'همراه: 09•• ••• ••'+(10+i),'اطلاعات تماس',number(i%3+1)+' سفارش'))),
   campaigns:datedDemoRecords([record('campaign-1','AROMA10','کد تخفیف','فعال','10'),record('campaign-2','DISCOVERY','کمپین ست کشف رایحه','پیش‌نویس','15')]),
   reviews:datedDemoRecords(products.slice(0,6).map((p,i)=>record('review-'+i,p.name,'رایحهٔ خوشایند و متعادل.',i%2?'تأیید شده':'در انتظار','4'))),
   content:datedDemoRecords([record('banner-1','پیام بالای فروشگاه','آروما در حال شکل‌گیری است.','پیش‌نویس','هیرو'),record('banner-2','راهنمای کشف رایحه','محتوای برای امکان ویرایش','فعال','مجله')]),
   support:datedDemoRecords([record('ticket-1','DEMO-TICKET-01','پرسش دربارهٔ ارسال','باز',''),record('ticket-2','DEMO-TICKET-02','پرسش دربارهٔ حجم عطر','در حال بررسی','')]),
  },
  settings:{shipping:{standard:'80000',express:'150000',threshold:'5000000'},settings:{name:'فروشگاه آروما',owner:'فروشندهٔ آروما',contact:'store@example.invalid',description:'فروشگاه عطر آروما'}},
 };
}
