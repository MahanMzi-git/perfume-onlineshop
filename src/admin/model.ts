import {seasonLabels,occasionLabels} from '../data/catalogLabels';
import { products } from '../data/products';
import { brands } from '../data/brands';
import { fragranceFamilies } from '../data/fragranceFamilies';
import { scentNotes } from '../data/scentNotes';

export type AdminRole = 'visitor' | 'seller' | 'analyst';
export type AdminGroup = 'seller';
export const roles: Record<AdminRole,string> = { visitor:'بازدیدکنندهٔ نمایشی', seller:'فروشندهٔ نمایشی', analyst:'تحلیلگر فقط‌خواندنی' };
export function canAccess(role: AdminRole, group: AdminGroup) { return group === 'seller' && (role === 'seller' || role === 'analyst'); }
export function canEdit(role: AdminRole, group: AdminGroup) { return canAccess(role,group) && role !== 'analyst'; }
export const sellerPages = [
 ['overview','نمای کلی'],['products','محصولات'],['product-new','افزودن محصول'],['brands','برندها'],['families','خانواده‌های رایحه'],['notes','نت‌های بویایی'],['variants','حجم و قیمت'],['inventory','موجودی'],['orders','سفارش‌ها'],['customers','جستجوی مشتری'],['campaigns','تخفیف و کمپین'],['reviews','مدیریت دیدگاه‌ها'],['content','محتوای صفحهٔ اول'],['shipping','تنظیمات ارسال'],['support','پشتیبانی'],['reports','گزارش فروش'],['settings','فروشگاه و پروفایل'],
] as const;
export interface AdminRoute { group:AdminGroup; section:string; id?:string }
export function parseAdminPath(segments:string[]): AdminRoute | undefined {
 const group=segments[0]; if(group!=='seller')return;
 const section=segments[1]??'overview';
 const pages=sellerPages;
 if(segments.length<=2&&pages.some(([key])=>key===section))return {group,section};
 if(group==='seller'&&segments.length===3&&['products','orders'].includes(section))return {group,section:section==='products'?'product-edit':'order-detail',id:segments[2]};
}
export interface AdminVariant { id:string; volume:number; price:number; stock:number }
export interface AdminProduct { id:string; name:string; brand:string; family:string; notes:string; audience?:string; seasons?:string[]; occasions?:string[]; dayTimes?:string[]; image:string; status:string; variants:AdminVariant[] }
export interface AdminRecord { id:string; name:string; detail:string; status:string; value:string }
export const orderSteps=['در حال پردازش','در حال بسته‌بندی','آمادهٔ ارسال','ارسال شده','تحویل شده'];
export interface AdminOrder { id:string; customer:string; status:string; product:string; quantity:number; total:number; history:string[] }
export interface AdminState { products:AdminProduct[]; orders:AdminOrder[]; records:Record<string,AdminRecord[]>; settings:Record<string,Record<string,string>> }
export const money=(n:number)=>new Intl.NumberFormat('fa-IR').format(n)+' تومان';
export const number=(n:number)=>new Intl.NumberFormat('fa-IR').format(n);
export function validInteger(value:string,min:number,max:number) { return /^\d+$/.test(value)&&Number.isSafeInteger(Number(value))&&Number(value)>=min&&Number(value)<=max; }
export function validateAdminProduct(p:Pick<AdminProduct,'name'|'brand'|'family'|'notes'>) {
 const e:Record<string,string>={};if(p.name.trim().length<2)e.name='نام محصول باید دست‌کم دو نویسه باشد.';
 if(!p.brand.trim())e.brand='برند را انتخاب کنید.';if(!p.family.trim())e.family='خانوادهٔ رایحه را انتخاب کنید.';
 if(!p.notes.trim())e.notes='دست‌کم یک نت بویایی بنویسید.';return e;
}
export function updateVariant(state:AdminState,productId:string,variantId:string,patch:Partial<Pick<AdminVariant,'stock'|'price'|'volume'>>):AdminState {
 const product=state.products.find(p=>p.id===productId),variant=product?.variants.find(v=>v.id===variantId);if(!variant)return state;
 const next={...variant,...patch};
 if(!Number.isInteger(next.stock)||next.stock<0||next.stock>9999||!Number.isSafeInteger(next.price)||next.price<1||!Number.isInteger(next.volume)||next.volume<1||next.volume>1000)return state;
 if(product!.variants.some(v=>v.id!==variantId&&v.volume===next.volume))return state;
 return {...state,products:state.products.map(p=>p.id!==productId?p:{...p,variants:p.variants.map(v=>v.id===variantId?next:v)})};
}
export function advanceOrder(state:AdminState,id:string,next:string):AdminState {
 const order=state.orders.find(o=>o.id===id);if(!order||!orderSteps.includes(next)||orderSteps.indexOf(next)!==orderSteps.indexOf(order.status)+1)return state;
 return {...state,orders:state.orders.map(o=>o.id===id?{...o,status:next,history:[...o.history,next]}:o)};
}
const record=(id:string,name:string,detail:string,status='فعال',value=''):AdminRecord=>({id,name,detail,status,value});
export function createAdminState():AdminState {
 return {
  products:products.map(p=>({id:p.id,name:p.name,brand:brands.find(b=>b.id===p.brandId)?.name??p.brandId,audience:({women:'زنانه',men:'مردانه',unisex:'یونیسکس'}[p.targetAudience]),family:fragranceFamilies.find(f=>f.id===p.fragranceFamilyIds[0])?.name??'گلی',notes:p.scentNoteIds.map(id=>scentNotes.find(n=>n.id===id)?.name).filter(Boolean).join('، '),seasons:p.seasons.map(s=>seasonLabels[s]),occasions:p.occasions.map(o=>occasionLabels[o]).filter(o=>o!=='عصر و شب'),dayTimes:p.occasions.includes('evening')?['عصر','شب']:[],image:p.image,status:'فعال',variants:p.variants.map(v=>({id:v.id,volume:v.volumeMl,price:v.price,stock:v.stock}))})),
  orders:products.slice(0,6).map((p,i)=>({id:'DEMO-'+(1001+i),customer:'مشتری آزمایشی '+number(i+1),status:orderSteps[i%5],product:p.name,quantity:i%2+1,total:p.price*(i%2+1),history:orderSteps.slice(0,i%5+1)})),
  records:{
   brands:brands.map((b,i)=>record('brand-'+i,b.name,'برند مرجع؛ رکورد مدیریتی آزمایشی')),
   families:fragranceFamilies.map((f,i)=>record('family-'+i,f.name,'دسته‌بندی آزمایشی')),
   notes:scentNotes.map((n,i)=>record('note-'+i,n.name,'نت منتخب آزمایشی')),
   customers:Array.from({length:8},(_,i)=>record('CUSTOMER-DEMO-'+(i+1),'مشتری آزمایشی '+number(i+1),'همراه: 09•• ••• ••'+(10+i),'بدون اطلاعات واقعی',number(i%3+1)+' سفارش نمونه')),
   campaigns:[record('campaign-1','AROMA10','کد تخفیف آزمایشی؛ به سبد عمومی متصل نیست','فعال','10'),record('campaign-2','DISCOVERY','کمپین ست کشف رایحه','پیش‌نویس','15')],
   reviews:products.slice(0,6).map((p,i)=>record('review-'+i,p.name,'متن ساختگی: رایحهٔ نمونه را برای تست رابط بررسی کردم.',i%2?'تأیید شده':'در انتظار','4')),
   content:[record('banner-1','پیام بالای فروشگاه','آروما در حال شکل‌گیری است.','پیش‌نویس','هیرو'),record('banner-2','راهنمای کشف رایحه','محتوای نمونه برای ویرایش محلی','فعال','مجله')],
   support:[record('ticket-1','DEMO-TICKET-01','پرسش ساختگی دربارهٔ ارسال نمونه','باز',''),record('ticket-2','DEMO-TICKET-02','پرسش ساختگی دربارهٔ حجم عطر','در حال بررسی','')],
  },
  settings:{shipping:{standard:'80000',express:'150000',threshold:'5000000'},settings:{name:'فروشگاه نمایشی آروما',owner:'فروشندهٔ آزمایشی آروما',contact:'store@example.invalid',description:'فقط برای تست رابط؛ اطلاعات واقعی وارد نکنید.'}},
 };
}
