import { ScentNoteIcon } from '../components/ScentNoteIcon';
import { scentNotes } from '../data/scentNotes';
import { loadSavedRecords, saveRecord } from './familyStorage';
import { brandLookupEndpoint, lookupBrandLogo, officialDomain, siteIcon } from './brandLogos';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BadgePercent, Boxes, ChartNoAxesColumn, ClipboardList, Droplets, Flower2, Layers, LifeBuoy, MessageSquare, PanelTop, PlusSquare, Settings, Tag, Users, LayoutDashboard, Package, ShieldCheck, Menu, ArrowUpLeft, Truck, Star, Activity, Store, Search, X, ImagePlus, Check, AlertCircle } from 'lucide-react';
import { LuxurySelect } from '../components/LuxurySelect';
import { ScrollRail } from '../components/ScrollRail';
import { AdminBadge, AdminForm, ConfirmDialog, DataTable, InlineEditor, Panel, type FormField } from './AdminUI';
import { type AdminProduct, sellerConcentrations, advanceOrder, canAccess, canEdit, createAdminState, codedVariants, money, number, orderSteps, roles, sellerPages, updateVariant, type AdminGroup, type AdminRecord, type AdminRole, type AdminRoute, type AdminState } from './model';
import {usageFields} from './UsageChoices';
import { familyEnglish } from './fragranceLabels';
import { NEW_BRAND_OPTION, NEW_FAMILY_OPTION, productVariantFields, saveProductDraft, validateProductDraft } from './productSave';
import { manualVariantCodeError } from '../lib/variantCodes';
import { VariantCode } from '../components/VariantCode';
import { ProductGalleryPreview } from './ProductGalleryPreview';
import { savedManualVariantCodes, type AdminVariant } from './model';
import { SellerSession } from './SellerSession';

interface Workspace { state:AdminState; codes:Map<string,string>; editable:boolean; mutate:(label:string,fn:(s:AdminState)=>AdminState)=>void; confirm:(title:string,detail:string,action:()=>void)=>void }
const link=(group:AdminGroup,section:string)=>`#/${group}/${section}`;
const lowStockStatus='موجودی کم';
const lowStockLink=link('seller','inventory')+'?stock=low';
const lowStockThreshold=3;
const isLowStock=(stock:number)=>stock>0&&stock<=lowStockThreshold;
const statusColumn={key:'status',label:'وضعیت',render:(r:{status:string})=><AdminBadge>{r.status}</AdminBadge>};
const textField=(key:string,label:string,placeholder=''):FormField=>({key,label,required:true,placeholder});
const codeField:FormField={key:'manualCode',label:'کد نسخه (اختیاری)',placeholder:'ساخت خودکار',hint:'برای کد دستی، حداقل ۶ نویسه شامل حرف و عدد وارد کنید.'};
const variantCodeErrors=(value:string,products:AdminProduct[],except?:AdminVariant):Record<string,string>=>{
 const error=manualVariantCodeError(value,savedManualVariantCodes(products,except));
 return error?{manualCode:error}:{};
};

const sellerPageIcons = {
 overview:LayoutDashboard, products:Package, 'product-new':PlusSquare,
 brands:Tag, families:Layers, notes:Flower2, variants:Droplets,
 inventory:Boxes, orders:ClipboardList, customers:Users, campaigns:BadgePercent,
 reviews:MessageSquare, content:PanelTop, shipping:Truck, support:LifeBuoy,
 reports:ChartNoAxesColumn, settings:Settings,
};

interface AdminAppProps {
 route: AdminRoute;
 session?: AdminState;
 onSessionChange: (state: AdminState) => void;
}

export function AdminApp(props: AdminAppProps) {
 return <SellerSession>{(role, logout) => <SellerWorkspace {...props} role={role} logout={logout} />}</SellerSession>;
}

function SellerWorkspace({route,session,onSessionChange,role,logout}:AdminAppProps & {role:AdminRole; logout:()=>Promise<void>}) {
 const [state,setState]=useState(()=>session??createAdminState()),[notice,setNotice]=useState('');
 useEffect(()=>onSessionChange(state),[state,onSessionChange]);
 const codes=useMemo(()=>new Map(codedVariants(state.products).map(({variant,code})=>[variant.id,code])),[state.products]);
 const [libraryReady,setLibraryReady]=useState(false);
 useEffect(()=>{
  let active=true;
  const sections=['families','notes'] as const;
  Promise.allSettled(sections.map(section=>loadSavedRecords(section))).then(results=>{
   if(!active)return;
   setState(current=>{
    const records={...current.records};
    for(const [index,result] of results.entries()){
     if(result.status!=='fulfilled')continue;
     const section=sections[index];
     const items=new Map(records[section].map(record=>[record.id,record]));
     for(const record of result.value){
      const initial=items.get(record.id);
      items.set(record.id,{...initial,...record,logo:record.logo??initial?.logo});
     }
     records[section]=[...items.values()];
    }
    return {...current,records};
   });
   if(results.some(result=>result.status==='rejected'))setNotice('خواندن بخشی از کتابخانهٔ ذخیره‌شده ممکن نبود.');
   setLibraryReady(true);
  });
  return ()=>{active=false;};
 },[]);
 const [menu,setMenu]=useState(false),[view,setView]=useState('normal');const menuList=useRef<HTMLElement>(null);
 const menuToggle=useRef<HTMLButtonElement>(null),menuClose=useRef<HTMLButtonElement>(null);
 function closeMenu(){setMenu(false);menuToggle.current?.focus();}
 useEffect(()=>{if(menu)menuClose.current?.focus();},[menu]);
 const [confirmation,setConfirmation]=useState<{title:string;detail:string;action:()=>void}>();
 const pages=sellerPages;
 const title=pages.find(([id])=>id===route.section)?.[1]??(route.section==='product-edit'?'ویرایش محصول':'جزئیات سفارش');
 const allowed=canAccess(role,route.group),editable=canEdit(role,route.group);
 useEffect(()=>{setView('normal');setMenu(false);setConfirmation(undefined);setNotice('');document.title=title+' | آروما · پنل فروشنده';},[route.group,route.section,route.id,title]);
 const mutate:Workspace['mutate']=(label,fn)=>{
  if(!canEdit(role,route.group)){setNotice('این نقش اجازهٔ ویرایش ندارد.');return;}
  setState(fn);setNotice(label+' ثبت شد.');
 };
 const workspace:Workspace={state,codes,editable,mutate,confirm:(title,detail,action)=>setConfirmation({title,detail,action})};
 let content:ReactNode;
 if(route.section==='overview')content=<Overview workspace={workspace}/>;
 else if((route.section==='families'||route.section==='notes')&&!libraryReady)content=<p role="status">در حال بارگذاری کتابخانهٔ رایحه…</p>;
 else content=<SellerPage key={route.section+route.id} route={route} workspace={workspace}/>;
 return <div className={'admin-app admin-'+route.group} data-field-style="capsule-sage" dir="rtl">
  <a className="skip" href="#admin-main" onClick={event=>{event.preventDefault();document.getElementById('admin-main')?.focus({preventScroll:true});}}>پرش به محتوای پنل</a>
  <header className="admin-topbar"><button ref={menuToggle} className="admin-nav-toggle" aria-label="فهرست صفحات پنل" aria-expanded={menu} aria-controls="admin-sidebar" onClick={()=>setMenu(v=>!v)}><Menu size={20}/></button><a className="admin-wordmark" href={link(route.group,'overview')} dir="ltr">AROMA <span>STORE OPERATIONS</span></a><a className="admin-store-link" href="#home">بازگشت به فروشگاه <ArrowUpLeft size={16}/></a></header>
  <div className="admin-shell">{menu&&<div className="admin-drawer-backdrop" aria-hidden="true" onClick={closeMenu}/>}<aside className="admin-sidebar" id="admin-sidebar" data-open={menu||undefined} onKeyDown={event=>{if(menu&&event.key==='Escape')closeMenu();}}>
   <div className="admin-sidebar-heading"><p className="admin-workspace-label"><Store size={18}/> پنل فروشنده</p><button ref={menuClose} className="admin-drawer-close" type="button" aria-label="بستن منو" onClick={closeMenu}><X size={16} aria-hidden="true"/></button></div>
   <a className="admin-nav-home" href={link(route.group,'overview')} aria-current={route.section==='overview'?'page':undefined} onClick={()=>{if(menu)closeMenu();}}><LayoutDashboard size={17} aria-hidden="true"/>نمای کلی</a>
   <div className="admin-nav-scroll"><nav ref={menuList} id="admin-page-links" aria-label="دیگر صفحات فروشنده">{pages.filter(([id])=>id!=='overview').map(([id,label])=>{const Icon=sellerPageIcons[id];return <a key={id} href={link(route.group,id)} onClick={()=>{if(menu)closeMenu();}} aria-current={route.section===id||(id==='products'&&route.section==='product-edit')||(id==='orders'&&route.section==='order-detail')?'page':undefined}><Icon size={17} aria-hidden="true"/>{label}</a>;})}</nav><ScrollRail viewportRef={menuList} controlsId="admin-page-links" label="پیمایش صفحات پنل"/></div>
  </aside><main id="admin-main" className="admin-main" tabIndex={-1}>
   <div className="admin-access-tools"><div className="admin-actions"><AdminBadge>{roles[role]}</AdminBadge><button type="button" onClick={() => void logout()}>خروج از حساب</button></div><LuxurySelect label="وضعیت نمایش" value={view} options={[{value:'normal',label:'نمایش عادی'},{value:'loading',label:'در حال بارگذاری'},{value:'empty',label:'دادهٔ خالی'},{value:'error',label:'خطای'}]} onChange={setView}/></div>
   <div className="admin-heading">
    <div>
     <p>فروشنده / {title}</p>
     <h1>{title}</h1>
     {allowed&&route.section==='inventory'&&<p>موجودی {number(1)} تا {number(lowStockThreshold)} عدد برای هر نسخه «موجودی کم» است. موجودی {number(0)} عدد «ناموجود» است.</p>}
    </div>
    <div className="admin-actions">{allowed&&route.section==='product-new'&&<a href={link('seller','products')}>فهرست محصولات</a>}<AdminBadge>{editable?'امکان ویرایش':allowed?'فقط خواندن':'بدون دسترسی'}</AdminBadge></div>
   </div>
   <p className="admin-notification" role="status" aria-live="polite">{notice}</p>
   {!allowed?<Panel title="دسترسی این نقش به این محیط تعریف نشده"><div className="admin-empty"><ShieldCheck size={32}/><p>دسترسی حساب را با مدیر فروشگاه بررسی کنید.</p></div></Panel>:view==='normal'?content:view==='loading'?<Panel title="دریافت اطلاعات"><p role="status" aria-busy="true">در حال بارگذاری…</p><div className="admin-skeleton" aria-hidden="true"/><button onClick={()=>setView('normal')}>بازگشت به صفحه</button></Panel>:<Panel title={view==='error'?'دریافت داده ناموفق بود':'هنوز داده‌ای برای نمایش نیست'}><div className="admin-empty"><AlertCircle/><p>{view==='error'?'در بارگذاری اطلاعات مشکلی پیش آمد.':'موردی برای نمایش وجود ندارد.'}</p><button onClick={()=>setView('normal')}>{view==='error'?'تلاش دوباره':'بازگشت به نمایش عادی'}</button></div></Panel>}
  </main></div>
  {confirmation&&<ConfirmDialog title={confirmation.title} detail={confirmation.detail} onConfirm={confirmation.action} onClose={()=>setConfirmation(undefined)}/>}
 </div>;
}

function Overview({workspace:{state}}:{workspace:Workspace}) {
 const stock=state.products.reduce((sum,p)=>sum+p.variants.reduce((n,v)=>n+v.stock,0),0),low=state.products.filter(p=>p.variants.some(v=>isLowStock(v.stock))).length;
 const total=state.orders.reduce((sum,o)=>sum+o.total,0);
 const metrics=[
  {label:'فروش',value:money(total),href:link('seller','reports'),Icon:LayoutDashboard},
  {label:'سفارش',value:number(state.orders.length),href:link('seller','orders'),Icon:Package},
  {label:'موجودی',value:number(stock),href:link('seller','inventory'),Icon:Activity},
  {label:'محصول کم‌موجود',value:number(low),href:lowStockLink,Icon:AlertCircle},
 ];
 return <><div className="admin-metrics">{metrics.map(({label,value,href,Icon})=><a className="admin-metric-link" key={label} href={href}><Icon aria-hidden="true"/><p>{label}</p><strong>{value}</strong></a>)}</div>
 <div className="admin-two-columns"><Panel title="کارهای امروز"><a className="admin-task" href={link('seller','orders')}><Truck size={20}/>بررسی {number(state.orders.filter(o=>o.status!==orderSteps[4]).length)} سفارش <ArrowUpLeft size={16}/></a><a className="admin-task" href={link('seller','inventory')}><Package size={20}/>بررسی موجودی کم <ArrowUpLeft size={16}/></a><a className="admin-task" href={link('seller','reviews')}><Star size={20}/>دیدگاه‌های در انتظار بررسی <ArrowUpLeft size={16}/></a></Panel>
 <Panel title="مسیر سریع"><p>محصول، حجم‌ها و قیمت‌های را مدیریت کنید.</p><div className="admin-actions"><a className="admin-primary" href={link('seller','product-new')}>افزودن محصول</a><a href={link('seller','reports')}>گزارش فروش</a></div></Panel></div></>;
}

function SellerPage({route,workspace:w}:{route:AdminRoute;workspace:Workspace}) {
 const {state}=w;
 switch(route.section){
  case 'products':return <><div className="admin-actions"><a className="admin-primary" href={link('seller','product-new')}>افزودن محصول</a><a href={link('seller','variants')}>حجم‌ها و قیمت</a></div><DataTable label="محصولات" rows={state.products.map(product=>({...product,searchCodes:product.variants.map(v=>w.codes.get(v.id)).join(' ')}))} renderCard={product=><SellerProductCard product={product} codes={w.codes}/> } /></>;
  case 'product-new':case 'product-edit':return <ProductEditor key={route.id??'new'} id={route.id} workspace={w} galleryPreview={route.galleryPreview}/>;
  case 'inventory':case 'variants':return <VariantEditor inventory={route.section==='inventory'} stockFilter={route.stockFilter} workspace={w}/>;
  case 'orders':return <DataTable label="سفارش‌ها" rows={state.orders.map(o=>({...o,name:o.id,code:w.codes.get(o.variantId??'')}))} columns={[{key:'id',label:'سفارش',render:o=><a href={link('seller','orders/'+o.id)}>{o.id}</a>},{key:'customer',label:'مشتری',render:o=>o.customer},{key:'total',label:'جمع',render:o=>money(o.total)},statusColumn,{key:'action',label:'عملیات',render:o=><a href={link('seller','orders/'+o.id)}>جزئیات و مراحل</a>}]} />;
  case 'order-detail':return <OrderDetail id={route.id} workspace={w}/>;
  case 'reports':return <Reports workspace={w}/>;
  case 'settings':case 'shipping':return <SettingsPage section={route.section} workspace={w}/>;
  default:return <RecordsPage section={route.section} workspace={w}/>;
 }
}

function ProductVariantChips({product,codes}:{product:AdminProduct;codes:Workspace['codes']}) {
 return <ul className="admin-product-variants" aria-label="نسخه‌های محصول">
  {product.variants.map(variant=><li key={variant.id}>{number(variant.volume)} میل{variant.concentration&&<> · <bdi>{variant.concentration}</bdi></>} · <VariantCode code={codes.get(variant.id)}/></li>)}
 </ul>;
}

function SellerProductCard({product,codes}:{product:AdminProduct;codes:Workspace['codes']}) {
 const href=link('seller','products/'+product.id);
 const stock=product.variants.reduce((total,variant)=>total+variant.stock,0);
 const prices=product.variants.map(variant=>variant.price);
 const minPrice=Math.min(...prices),maxPrice=Math.max(...prices);

 return <article className="admin-product-card">
  <div className="admin-product-card-header" data-draft={product.status==='پیش‌نویس'||undefined}>
   <img src={product.image} alt="" width={54} height={64} loading="lazy"/>
   <div className="admin-product-card-title">
    <h3><a href={href} dir="auto">{product.name}</a></h3>
    <p><bdi>{product.brand}</bdi> · {product.family}{product.audience&&' · '+product.audience}</p>
   </div>
   <AdminBadge>{product.status}</AdminBadge>
  </div>
  <ProductVariantChips product={product} codes={codes}/>
  <div className="admin-product-card-footer">
   <div><strong>{prices.length?(minPrice===maxPrice?money(minPrice):'از '+money(minPrice)):'—'}</strong><small>{stock>0?'موجودی '+number(stock)+' عدد':'ناموجود'}</small></div>
   <a href={href} aria-label={'ویرایش '+product.name}>ویرایش <ArrowUpLeft size={15} aria-hidden="true"/></a>
  </div>
 </article>;
}

function ProductEditor({id,workspace:w,galleryPreview}:{id?:string;workspace:Workspace;galleryPreview?:boolean}) {
 const existing=id?w.state.products.find(p=>p.id===id):undefined;
 const [saved,setSaved]=useState(false);
 const [image,setImage]=useState(existing?.image??''),[file,setFile]=useState<File>(),[error,setError]=useState(''),[formVersion,setFormVersion]=useState(0);
 useEffect(()=>{if(!file)return;const url=URL.createObjectURL(file);setImage(url);return()=>URL.revokeObjectURL(url);},[file]);
 if(id&&!existing)return <Missing href={link('seller','products')}/>;
 const [variantIds,setVariantIds]=useState(['first']);
 const draftVariantIds=existing?[]:variantIds;
 const options=(key:string)=>w.state.records[key].map(r=>r.name);
 const isNewBrand=(values:Record<string,string>)=>values.brand===NEW_BRAND_OPTION;
 const isNewFamily=(values:Record<string,string>)=>values.family===NEW_FAMILY_OPTION;
 const identityFields:FormField[]=[textField('name','نام محصول','نام عطر'),{key:'brand',label:'برند',type:'select',options:[NEW_BRAND_OPTION,...options('brands')],required:true,hint:'برند در فهرست نیست؟ «افزودن برند جدید…» را انتخاب کنید.'},
  {...textField('newBrand','نام برند جدید','نام برند را بنویسید'),when:isNewBrand,hint:'با ذخیرهٔ محصول، برند هم به کتابخانه اضافه می‌شود. اگر از قبل وجود داشته باشد، همان برند استفاده می‌شود.'},
  {key:'newBrandDetail',label:'توضیح برند (اختیاری)',placeholder:'توضیح کوتاه دربارهٔ برند',when:isNewBrand},
 ];
 const scentFields:FormField[]=[
  {key:'family',startsGroup:true,label:'خانوادهٔ رایحه',type:'select',options:[NEW_FAMILY_OPTION,...options('families')],optionEnglish:{...familyEnglish,...Object.fromEntries(w.state.records.families.filter(r=>r.value).map(r=>[r.name,r.value]))},required:true,hint:'رایحه در فهرست نیست؟ «افزودن خانوادهٔ رایحهٔ جدید…» را انتخاب کنید.'},
  {...textField('newFamily','نام خانوادهٔ رایحهٔ جدید','نام خانوادهٔ رایحه را بنویسید'),when:isNewFamily,hint:'با ذخیرهٔ محصول، خانوادهٔ رایحه هم به کتابخانه اضافه می‌شود. اگر از قبل وجود داشته باشد، همان مورد استفاده می‌شود.'},
  {key:'newFamilyEnglish',label:'نام انگلیسی رایحه',placeholder:'مثلاً Citrus',when:isNewFamily},
  {key:'newFamilyDetail',label:'توضیح رایحه (اختیاری)',placeholder:'توضیح کوتاه دربارهٔ این خانوادهٔ رایحه',when:isNewFamily},
  {key:'notes',label:'نت‌های منتخب',type:'notes',options:options('notes'),required:true,hint:'از کتابخانه تا ۴ نت انتخاب کنید.'},
 ];
 const publishingFields:FormField[]=[
  {key:'audience',label:'مخاطب عطر',type:'select',options:['زنانه','مردانه','یونیسکس'],required:true},
  {key:'status',label:'وضعیت انتشار',type:'select',options:['فعال','پیش‌نویس'],required:true},
 ];
 const fields:FormField[]=[
  ...identityFields,
  ...(!existing?publishingFields:[]),
  ...scentFields,
  ...usageFields.map((field,index)=>({...field,startsGroup:index===0})),
  ...(existing?publishingFields:[]),
  ...draftVariantIds.flatMap((variantId,index)=>[
   {
    ...concentrationField,
    key:variantId+concentrationField.key,
    fullWidth:true,
    sectionTitle:index===0?'حجم و قیمت · نسخهٔ '+number(index+1):'نسخهٔ '+number(index+1),
   },
   ...productVariantFields.map(field=>({
    ...field,
    key:variantId+field.key,
    type:'number' as const,
    required:true,
   })),
   {...codeField,key:variantId+codeField.key},
  ]),
 ];
 return <Panel title={existing?'ویرایش اطلاعات محصول':'ساخت محصول'}>{existing&&<><div className="admin-actions"><a href={link('seller','products')}>فهرست محصولات</a><a href={link('seller','variants')}>مدیریت حجم و قیمت</a></div><ProductVariantChips product={existing} codes={w.codes}/></>}
  {galleryPreview?<ProductGalleryPreview image={existing?.image} editable={w.editable}/>:<div className={existing?'admin-image-picker':'admin-image-picker admin-product-create-image'}>
   <div className="admin-image-preview">
    {image?<img src={image} alt="پیش‌نمایش تصویر محصول" width={96} height={96} onError={()=>{setImage('');setError('تصویر قابل خواندن نیست؛ فایل دیگری انتخاب کنید.');}}/>:<ImagePlus size={26} aria-hidden="true"/>}
   </div>
   <div className="admin-image-details">
    <h3>تصویر محصول</h3>

    <label className="admin-image-action">
     <input disabled={!w.editable} type="file" accept="image/png,image/jpeg,image/webp" aria-describedby="admin-image-formats" onChange={e=>{const next=e.target.files?.[0];setError('');if(!next)return;if(!['image/png','image/jpeg','image/webp'].includes(next.type)||next.size>2*1024*1024){setError('فرمت یا حجم تصویر مجاز نیست.');e.target.value='';return;}setFile(next);}}/>
     <span>{image?'تغییر تصویر':'انتخاب تصویر'}</span>
    </label>
    <p id="admin-image-formats"><bdi dir="ltr">PNG · JPEG · WebP</bdi>، تا ۲ مگابایت</p>
   </div>
   {error&&<p role="alert" className="admin-error">{error}</p>}
  </div>}
  <AdminForm mobileColumns groupFields={!existing} fullWidthSubmit={!existing} saved={saved} onFieldChange={()=>setSaved(false)} submit={existing?"ذخیره":"ذخیره محصول جدید"} key={formVersion} fields={fields} initial={existing?{name:existing.name,brand:existing.brand,family:existing.family,seasons:existing.seasons?.join('، ')??'',occasions:existing.occasions?.join('، ')??'',dayTimes:existing.dayTimes?.join('، ')??'',notes:existing.notes,audience:existing.audience??'یونیسکس',status:existing.status}:{name:'',brand:'',family:'',notes:'',audience:'',status:'پیش‌نویس'}} disabled={!w.editable} validate={v=>validateProductDraft(v,draftVariantIds,savedManualVariantCodes(w.state.products))} beforeSubmit={!existing&&<div className="admin-actions admin-form-section">
   <button type="button" disabled={!w.editable} onClick={()=>{const id=crypto.randomUUID();setVariantIds(current=>[...current,id]);}}>افزودن نسخه و قیمت دیگر</button>
   {variantIds.length>1&&<button type="button" disabled={!w.editable} onClick={()=>setVariantIds(current=>current.slice(0,-1))}>حذف آخرین نسخه</button>}
  </div>} onSave={v=>{
   const ids={product:existing?.id??'LOCAL-PRODUCT-'+crypto.randomUUID(),brand:'LOCAL-BRAND-'+crypto.randomUUID(),family:'LOCAL-FAMILY-'+crypto.randomUUID(),variant:'LOCAL-VARIANT-'+crypto.randomUUID()};
   const next=saveProductDraft(w.state,v,ids,existing?.id,draftVariantIds);
   if(next===w.state)return;
   w.mutate('تغییرات محصول',()=>next);
   setFormVersion(version=>version+1);
   if(existing)setSaved(true);
   else location.hash=link('seller','products/'+ids.product);
  }}/>
 </Panel>;
}

const concentrationField:FormField={key:'concentration',label:'غلظت عطر',type:'select',required:true,options:sellerConcentrations};

function VariantEditor({workspace:w,inventory,stockFilter}:{workspace:Workspace;inventory:boolean;stockFilter?:AdminRoute['stockFilter']}) {
 const [adding,setAdding]=useState(false);
 const [inlineId,setInlineId]=useState<string>();
 const [productId,setProductId]=useState(w.state.products[0]?.id??''),[variantId,setVariantId]=useState('');
 const product=w.state.products.find(p=>p.id===productId),variant=product?.variants.find(v=>v.id===variantId)??product?.variants[0];
 if(!product||!variant)return <Missing href={link('seller','products')}/>;
 const volumeErrors=(volume:string,concentration?:string,except?:string):Record<string,string>=>
  product.variants.some(item=>item.id!==except&&item.volume===Number(volume)&&item.concentration===concentration)?{volume:'این ترکیب حجم و غلظت قبلاً ثبت شده است.'}:{};
 const variantLabel=(item:AdminVariant)=>
  [number(item.volume)+' میل',item.concentration,w.codes.get(item.id)].filter(Boolean).join(' · ');
 const rows=codedVariants(w.state.products).map(({product,variant,code})=>({
  id:variant.id,
  name:product.name,
  code,
  createdAt:variant.createdAt,
  status:variant.stock===0?'ناموجود':isLowStock(variant.stock)?lowStockStatus:'موجود',
  volume:variant.volume,
  concentration:variant.concentration,
  price:variant.price,
  stock:variant.stock,
  productId:product.id,
 }));
 const stockField:FormField={key:'stock',label:'موجودی',type:'number',min:0,max:9999,required:true};
 const editForm=<AdminForm mobileColumns key={JSON.stringify(variant)} disabled={!w.editable}
  initial={{stock:String(variant.stock),price:String(variant.price),volume:String(variant.volume),manualCode:variant.manualCode??''}}
  fields={inventory?[stockField]:[
   {key:'volume',label:'حجم (میلی‌لیتر)',type:'number',min:1,max:1000,required:true},
   {key:'price',label:'قیمت (تومان)',type:'number',min:1,max:999999999,required:true},
   stockField,
   {...codeField,placeholder:w.codes.get(variant.id)??codeField.placeholder},
  ]}
  validate={v=>inventory?{}:{...variantCodeErrors(v.manualCode,w.state.products,variant),...volumeErrors(v.volume,variant.concentration,variant.id)}}
  onSave={v=>w.confirm('ثبت تغییر',product.name+' · '+variantLabel(variant),()=>w.mutate(
   inventory?'اصلاح موجودی':'اصلاح حجم و قیمت',
   state=>updateVariant(state,product.id,variant.id,inventory?{stock:Number(v.stock)}:{
    volume:Number(v.volume),price:Number(v.price),stock:Number(v.stock),manualCode:v.manualCode,
   }),
  ))}
 />;
 return <><Panel title={inventory?'اصلاح موجودی':'ویرایش حجم و قیمت'}><div className="admin-variant-editor-grid"><div className="admin-two-columns admin-variant-selectors"><LuxurySelect label="محصول" value={product.id} options={w.state.products.map(p=>({value:p.id,label:p.name}))} onChange={v=>{setProductId(v);setVariantId('');setInlineId(undefined);}}/><LuxurySelect label="نسخه" value={variant.id} options={product.variants.map(item=>({value:item.id,label:variantLabel(item)}))} onChange={id=>{setVariantId(id);setInlineId(undefined);}}/></div>
  {!inlineId&&editForm}</div>
 </Panel>{!inventory&&<Panel title="نسخهٔ تازه برای محصول انتخاب‌شده"><p>{product.name}</p><button className={adding?'admin-inline-editor-close':undefined} type="button" disabled={!adding&&!w.editable} aria-expanded={adding} aria-label={adding?'بستن فرم نسخهٔ تازه':undefined} onClick={()=>setAdding(value=>!value)}>{adding?<X size={16} aria-hidden="true"/>:'افزودن نسخه'}</button>{adding&&<AdminForm mobileColumns key={product.id} disabled={!w.editable} initial={{volume:'',price:'',stock:'0',concentration:''}} fields={[concentrationField,codeField,{key:'volume',label:'حجم جدید (میلی‌لیتر)',type:'number',min:1,max:1000,required:true},{key:'price',label:'قیمت نسخهٔ جدید (تومان)',type:'number',min:1,max:999999999,required:true},{key:'stock',label:'موجودی نسخهٔ جدید',type:'number',min:0,max:9999,required:true}]} validate={v=>({...variantCodeErrors(v.manualCode,w.state.products),...volumeErrors(v.volume,v.concentration)})} onSave={v=>w.confirm('افزودن نسخه',product.name+' · '+v.volume+' میل',()=>{const createdAt=Date.now();const newVariant={id:'LOCAL-VARIANT-'+createdAt,createdAt,concentration:v.concentration,volume:Number(v.volume),price:Number(v.price),stock:Number(v.stock),manualCode:v.manualCode?.trim()||undefined};w.mutate('افزودن نسخه',s=>({...s,products:s.products.map(p=>p.id===product.id?{...p,variants:[...p.variants,newVariant]}:p)}));setAdding(false);})}/>}</Panel>}<DataTable key={stockFilter??'all'} initialStatus={stockFilter==='low'?lowStockStatus:undefined} rows={rows} label="موجودی و حجم‌ها" renderEditor={row=>inlineId===row.id&&
  <InlineEditor onClose={()=>setInlineId(undefined)}><Panel title={inventory?'اصلاح موجودی':'ویرایش حجم و قیمت'}>
   <button className="admin-inline-editor-close" type="button" aria-label="بستن فرم" onClick={()=>setInlineId(undefined)}><X size={16} aria-hidden="true"/></button>
   <p>{variantLabel(variant)}</p>
   {editForm}
  </Panel></InlineEditor>} columns={[{key:'name',label:'محصول',render:r=>r.name},{key:'volume',label:'حجم',render:r=>number(r.volume)+' میل'},{key:'concentration',label:'غلظت',render:r=>r.concentration??'—'},{key:'price',label:'قیمت',render:r=>money(r.price)},{key:'stock',label:'موجودی',render:r=>number(r.stock)},statusColumn,{key:'edit',label:'عملیات',render:r=><button disabled={!w.editable} aria-expanded={inlineId===r.id} onClick={()=>{setProductId(r.productId);setVariantId(r.id);setInlineId(current=>current===r.id?undefined:r.id);}}>انتخاب برای ویرایش</button>}]} /></>;
}

function OrderDetail({id,workspace:w}:{id?:string;workspace:Workspace}) {
 const order=w.state.orders.find(o=>o.id===id);if(!order)return <Missing href={link('seller','orders')}/>;
 const index=orderSteps.indexOf(order.status),next=orderSteps[index+1];
 return <><Panel title={'سفارش '+order.id}><a href={link('seller','orders')}>بازگشت به سفارش‌ها</a><p>{order.customer}</p><dl className="admin-facts"><dt>محصول</dt><dd>{order.product} <VariantCode code={w.codes.get(order.variantId??'')}/></dd><dt>تعداد</dt><dd>{number(order.quantity)}</dd><dt>جمع</dt><dd>{money(order.total)}</dd></dl>
  <ol className="admin-timeline" aria-label="مراحل آماده‌سازی سفارش">{orderSteps.map((step,i)=><li key={step} aria-current={i===index?'step':undefined} data-complete={i<=index}><span>{i<=index?<Check size={16}/>:number(i+1)}</span>{step}</li>)}</ol>
  <button className="admin-primary" disabled={!w.editable||!next} onClick={()=>w.confirm('تغییر مرحلهٔ سفارش',`از «${order.status}» به «${next}»`,()=>w.mutate('تغییر مرحلهٔ سفارش',s=>advanceOrder(s,order.id,next)))}>{next?'انتقال به '+next:'مراحل تکمیل شده'}</button>
 </Panel><Panel title="تاریخچهٔ">{order.history.map((step,i)=><p key={i}>{number(i+1)}. {step}</p>)}</Panel></>;
}

const recordSchemas:Record<string,{title:string;fields:FormField[];statuses:string[];readOnly?:boolean}>={
 brands:{title:'برند',fields:[textField('name','نام برند','برند'),textField('detail','توضیح','شرح')],statuses:['فعال','پیش‌نویس']},
 families:{title:'خانوادهٔ رایحه',fields:[textField('name','نام خانواده','مثلاً چوبی'),textField('detail','توضیح','شرح خانوادهٔ رایحه')],statuses:['فعال','پیش‌نویس']},
 notes:{title:'نت بویایی',fields:[textField('name','نام نت','مثلاً یاس'),textField('detail','توضیح','شرح نت')],statuses:['فعال','پیش‌نویس']},
 campaigns:{title:'کمپین',fields:[textField('name','کد کمپین','DEMO20'),textField('detail','عنوان و شرح','تخفیف'),{key:'value',label:'درصد تخفیف',type:'number',min:1,max:90,required:true}],statuses:['فعال','پیش‌نویس','پایان‌یافته']},
 content:{title:'بنر و محتوا',fields:[textField('name','عنوان','عنوان بنر'),{key:'detail',label:'متن',type:'textarea',required:true},{key:'value',label:'جایگاه',type:'select',options:['هیرو','مجله','اعلان'],required:true}],statuses:['فعال','پیش‌نویس']},
 customers:{title:'مشتری',fields:[],statuses:[],readOnly:true},
 reviews:{title:'دیدگاه',fields:[],statuses:[],readOnly:true},support:{title:'درخواست پشتیبانی',fields:[],statuses:[],readOnly:true},
};
const centeredCrop={x:50,y:50};
function imageFraming(zoom=1,crop=centeredCrop){
 const position=crop.x+'% '+crop.y+'%';
 return {objectPosition:position,transformOrigin:position,transform:'scale('+zoom+')'};
}

function RecordsPage({section,workspace:w}:{section:string;workspace:Workspace}) {
 const isLibrary=section==='families'||section==='notes';
 const [editing,setEditing]=useState<AdminRecord|null>();
 const [detailsId,setDetailsId]=useState<string>();
 const detailsTrigger=useRef<HTMLButtonElement|null>(null);
 function closeDetails(){
  setDetailsId(undefined);
  detailsTrigger.current?.focus({preventScroll:true});
 }
 const [savingFamily,setSavingFamily]=useState(false);
 const [familySaveError,setFamilySaveError]=useState('');
 const editorStart=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  if(editing===undefined||editing)return;
  editorStart.current?.scrollIntoView({block:'start'});
  editorStart.current?.focus({preventScroll:true});
 },[editing]);
 const [imageZoom,setImageZoom]=useState(1);
 const [imageCrop,setImageCrop]=useState(centeredCrop);
 const [logo,setLogo]=useState<string>(),[logoError,setLogoError]=useState(''),[readingLogo,setReadingLogo]=useState(false);
 const logoReader=useRef<FileReader>();
 const [brandDomain,setBrandDomain]=useState('');
 const [brandName,setBrandName]=useState('');
 const [logoDomain,setLogoDomain]=useState<string>();
 const [lookingUp,setLookingUp]=useState(false);
 const lookupRequest=useRef<AbortController>();
 const [logoSuggestion,setLogoSuggestion]=useState<{url:string;domain:string;loaded:boolean}>();
 const [suggestionError,setSuggestionError]=useState('');
 useEffect(()=>()=>{logoReader.current?.abort();lookupRequest.current?.abort();},[]);
 function openRecord(record?:AdminRecord|null){
  if(savingFamily)return;
  setFamilySaveError('');
  if(record&&record.id===editing?.id)record=undefined;
  if(record===null&&editing===null){
   editorStart.current?.scrollIntoView({block:'start'});
   editorStart.current?.focus({preventScroll:true});
   return;
  }
  logoReader.current?.abort();
  setLogo(record?.logo);setImageZoom(record?.imageZoom??1);setImageCrop(record?.imageCrop??centeredCrop);setLogoError('');setReadingLogo(false);setEditing(record);
  lookupRequest.current?.abort();setLookingUp(false);
  setBrandName(record?.name??'');setBrandDomain(record?.domain??'');setLogoDomain(record?.domain);
  setLogoSuggestion(undefined);setSuggestionError('');
 }
 async function suggestLogo(){
  setLogoSuggestion(undefined);setSuggestionError('');
  if(brandDomain.trim()){
   try {
    const domain=officialDomain(brandDomain.trim());
    setLogoSuggestion({url:siteIcon(domain),domain,loaded:false});
   } catch {
    setSuggestionError('دامنهٔ رسمی برند را وارد کنید، مثل example.com.');
   }
   return;
  }
  if(!brandLookupEndpoint||!brandName.trim())return;
  const request=new AbortController();
  lookupRequest.current=request;
  setLookingUp(true);
  try {
   const result=await lookupBrandLogo(brandName.trim(),request.signal);
   if(!request.signal.aborted)setLogoSuggestion({url:result.logo,domain:result.domain,loaded:false});
  } catch {
   if(!request.signal.aborted)setSuggestionError('پیشنهادی پیدا نشد. دامنه یا فایل لوگو را وارد کنید.');
  } finally {
   if(!request.signal.aborted)setLookingUp(false);
  }
 }
 function readLogo(input:HTMLInputElement){
  const file=input.files?.[0];
  if(!file)return;
  logoReader.current?.abort();
  setReadingLogo(false);
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2*1024*1024){
   setLogoError('فایل PNG، JPEG یا WebP تا ۲ مگابایت انتخاب کنید.');
   input.value='';
   return;
  }
  const reader=new FileReader();
  logoReader.current=reader;
  setLogoError('');setReadingLogo(true);
  reader.onload=()=>{setLogo(String(reader.result));setImageZoom(1);setImageCrop(centeredCrop);setReadingLogo(false);};
  reader.onerror=()=>{setLogoError('خواندن تصویر ممکن نبود.');setReadingLogo(false);};
  reader.readAsDataURL(file);
 }
 const hasImage=section==='brands'||isLibrary;
 const schema=recordSchemas[section];if(!schema)return <Missing href={link('seller','overview')}/>;
 const statusField:FormField={key:'status',label:'وضعیت',type:'select',required:true,options:schema.statuses};
 const editorFields:FormField[]=isLibrary
  ? [schema.fields[0],statusField,{...schema.fields[1],fullWidth:true}]
  : [...schema.fields,statusField];
 const rows=w.state.records[section]??[];
 const update=(r:AdminRecord,status:string,value=r.value)=>w.confirm('تغییر '+schema.title,r.name+' ← '+status,()=>w.mutate('تغییر '+schema.title,s=>({...s,records:{...s.records,[section]:s.records[section].map(item=>item.id===r.id?{...item,status,value}:item)}})));
 function actions(r:AdminRecord){
  if(!schema.readOnly)return <button disabled={!w.editable||savingFamily} aria-expanded={editing?.id===r.id} onClick={()=>openRecord(r)}>ویرایش</button>;
  if(section==='reviews')return <div className="admin-actions"><button disabled={!w.editable||r.status==='تأیید شده'} onClick={()=>update(r,'تأیید شده')}>تأیید</button><button disabled={!w.editable||r.status==='رد شده'} onClick={()=>update(r,'رد شده')}>رد دیدگاه</button></div>;
  if(section==='support'||section==='customers')return <button type="button" aria-expanded={detailsId===r.id} onClick={event=>{
   detailsTrigger.current=event.currentTarget;
   setDetailsId(current=>current===r.id?undefined:r.id);
  }}>{section==='customers'?'نمایش اطلاعات':'جزئیات و پاسخ'}</button>;
  return <span>فقط مشاهده</span>;
 }
 const inlineEdit=!!editing;
 const editor=editing!==undefined?(<Panel title={(editing?'ویرایش ':'افزودن ')+schema.title}><button className="admin-inline-editor-close" ref={editorStart} type="button" aria-label="بستن فرم" onClick={()=>openRecord()}><X size={16} aria-hidden="true"/></button>
   {hasImage&&<div className="admin-image-picker admin-brand-picker">
    <div className={isLibrary?"admin-image-preview admin-family-image":"admin-image-preview"}>{logo?<img src={logo} style={imageFraming(imageZoom,imageCrop)} alt={section==='brands'?'پیش‌نمایش لوگو':'پیش‌نمایش تصویر'}/>:<Tag size={24} aria-hidden="true"/>}</div>
    <div className="admin-image-details">
     <div className="admin-brand-upload"><label className="admin-image-action"><input type="file" accept="image/png,image/jpeg,image/webp" disabled={!w.editable} onChange={event=>readLogo(event.currentTarget)}/><span>{isLibrary?(logo?'تغییر تصویر':'انتخاب تصویر'):(logo?'تغییر لوگو':'انتخاب لوگو')}</span></label>
     <p>PNG، JPEG یا WebP تا ۲ مگابایت</p></div>
     {isLibrary&&logo&&<><label className="admin-family-zoom">
      بزرگ‌نمایی تصویر
      <input type="range" min={1} max={3} step={0.05} value={imageZoom} disabled={!w.editable}
       onChange={event=>setImageZoom(Number(event.target.value))}/>
     </label>
     <details className="admin-family-zoom">
      <summary>برش تصویر</summary>
      <label>موقعیت افقی
       <input type="range" dir="ltr" min={0} max={100} value={imageCrop.x} disabled={!w.editable}
        onChange={event=>setImageCrop({...imageCrop,x:Number(event.target.value)})}/>
      </label>
      <label>موقعیت عمودی
       <input type="range" dir="ltr" min={0} max={100} value={imageCrop.y} disabled={!w.editable}
        onChange={event=>setImageCrop({...imageCrop,y:Number(event.target.value)})}/>
      </label>
     </details></>}
     {section==='brands'&&<>
     <label htmlFor="brand-logo-domain">دامنهٔ رسمی برند</label>
     <div className="admin-brand-domain"><input id="brand-logo-domain" type="text" dir="ltr" placeholder="example.com" disabled={!w.editable}
      value={brandDomain} onChange={event=>{lookupRequest.current?.abort();setLookingUp(false);setBrandDomain(event.target.value);setLogoSuggestion(undefined);setSuggestionError('');}}/>
     <button type="button" disabled={!w.editable||lookingUp||(!brandDomain.trim()&&!(brandLookupEndpoint&&brandName.trim()))} onClick={suggestLogo}>{lookingUp?'در حال جست‌وجو…':'پیشنهاد لوگو'}</button></div>
     {logoSuggestion&&<div className="admin-actions"><bdi>{logoSuggestion.domain}</bdi>
      <img key={logoSuggestion.url} src={logoSuggestion.url} alt="آیکون پیشنهادی سایت برند" width={40} height={40} referrerPolicy="no-referrer"
       onLoad={()=>setLogoSuggestion(current=>current?.url===logoSuggestion.url?{...current,loaded:true}:current)}
       onError={()=>{setLogoSuggestion(undefined);setSuggestionError('آیکون سایت پیدا نشد. می‌توانید فایل لوگو را انتخاب کنید.');}}/>
      <button type="button" disabled={!w.editable||!logoSuggestion.loaded||readingLogo} onClick={()=>{setLogo(logoSuggestion.url);setLogoDomain(logoSuggestion.domain);setBrandDomain(logoSuggestion.domain);setLogoError('');setLogoSuggestion(undefined);}}>استفاده از این لوگو</button>
     </div>}
     {suggestionError&&<p role="alert" className="admin-error">{suggestionError}</p>}
     </>}
    </div>
    {logoError&&<p role="alert" className="admin-error">{logoError}</p>}
   </div>}
   <AdminForm onFieldChange={(key,value)=>{
    if(section!=='brands'||key!=='name')return;
    lookupRequest.current?.abort();setLookingUp(false);setBrandName(value);setLogoSuggestion(undefined);setSuggestionError('');
   }} mobileColumns={hasImage} key={editing?.id??'new'} disabled={!w.editable||readingLogo||savingFamily} fields={editorFields} initial={editing?{name:editing.name,detail:editing.detail,value:editing.value,status:editing.status}:{name:'',detail:'',value:section==='content'?'هیرو':'',status:schema.statuses[0]}} validate={(v):Record<string,string>=>rows.some(r=>r.id!==editing?.id&&r.name.trim().toLocaleLowerCase()===v.name.trim().toLocaleLowerCase())?{name:'این نام یا کد قبلاً استفاده شده است.'}:{}} onSave={async v=>{
    const row:AdminRecord={
     ...editing,id:editing?.id??'LOCAL-'+crypto.randomUUID(),
     createdAt:editing?editing.createdAt:Date.now(),
     name:v.name,detail:v.detail,status:v.status,value:v.value??editing?.value??'',
     ...(hasImage&&logo?{logo,domain:logoDomain,imageZoom,imageCrop}:{}),
    };
    if(section==='families'||section==='notes'){
     setSavingFamily(true);setFamilySaveError('');
     try {
      await saveRecord(section,row);
     } catch {
      setFamilySaveError('ذخیره در مرورگر انجام نشد. دوباره تلاش کنید.');
      return;
     } finally {
      setSavingFamily(false);
     }
    }
    w.mutate('تغییرات '+schema.title,s=>{
     const records=s.records[section]??[];
     return {...s,records:{...s.records,[section]:editing?records.map(record=>record.id===row.id?row:record):[row,...records]}};
    });
    setEditing(undefined);
   }} />{familySaveError&&<p role="alert" className="admin-error">{familySaveError}</p>}</Panel>):null;
 return <>{!schema.readOnly&&<div className="admin-actions"><button className="admin-primary" disabled={!w.editable} onClick={()=>openRecord(null)}>افزودن {schema.title}</button></div>}
  {!inlineEdit&&editor}
  <DataTable label={schema.title} rows={rows} renderCard={record=>{
   const note=scentNotes.find(item=>item.id===record.noteId);
   return <article className="admin-product-card admin-brand-card">
   <div className="admin-product-card-header" data-draft={record.status==='پیش‌نویس'||undefined}>
    <span className={isLibrary?"admin-brand-logo admin-family-image":"admin-brand-logo"}>{record.logo&&<img key={record.logo} src={record.logo} style={imageFraming(record.imageZoom,record.imageCrop)} alt="" width={42} height={42} referrerPolicy="no-referrer" onError={event=>{event.currentTarget.hidden=true;}}/>}<bdi aria-hidden="true">{note?<ScentNoteIcon note={note} decorative/>:Array.from(record.name)[0]?.toLocaleUpperCase()}</bdi></span>
    <div className="admin-product-card-title"><h3><bdi>{record.name}</bdi></h3><small><bdi>{record.id}</bdi></small></div>
    <AdminBadge>{record.status}</AdminBadge>
   </div>
   {record.detail&&<p>{record.detail}</p>}
   <div className="admin-product-card-footer">
    {record.representativeNotes?<span>نت‌های شاخص: {record.representativeNotes}</span>:record.value&&<span dir="auto">{section==='notes'&&'خانواده‌ها: '}{record.value}</span>}
    {actions(record)}
   </div>
   {inlineEdit&&editing?.id===record.id&&<InlineEditor onClose={()=>openRecord()}>{editor}</InlineEditor>}
   {detailsId===record.id&&<InlineEditor label={record.name} onClose={closeDetails}>
    <Panel title={record.name}>
     <button className="admin-inline-editor-close" type="button" aria-label="بستن جزئیات" onClick={closeDetails}><X size={16} aria-hidden="true"/></button>
     <p>{record.detail}</p>
     {section==='customers'?<>
      <p>شناسه: {record.id} · {record.value}</p>
      <a href={link('seller','orders')}>سفارش‌های فروشگاه</a>
     </>:<>
      <AdminBadge>{record.status}</AdminBadge>
      <AdminForm disabled={!w.editable} fields={[
       {key:'value',label:'متن پاسخ',type:'textarea',required:true},
       {key:'status',label:'وضعیت درخواست',type:'select',required:true,options:['باز','در حال بررسی','بسته شده']},
      ]} initial={{value:record.value,status:record.status}} onSave={values=>{
       closeDetails();
       update(record,values.status,values.value);
      }}/>
     </>}
    </Panel>
   </InlineEditor>}
  </article>;}} />
 </>;
}

function SettingsPage({section,workspace:w}:{section:string;workspace:Workspace}) {
 const shipping=section==='shipping';
 const fields:FormField[]=shipping?[{key:'standard',label:'هزینهٔ ارسال عادی (تومان)',type:'number',min:0,max:9999999,required:true},{key:'express',label:'هزینهٔ ارسال سریع (تومان)',type:'number',min:0,max:9999999,required:true},{key:'threshold',label:'آستانهٔ ارسال رایگان (تومان)',type:'number',min:0,max:999999999,required:true}]:[textField('name','نام','نام فروشگاه'),...(section==='settings'?[textField('owner','نام فروشنده','نام مستعار')]:[]),{key:'contact',label:'ایمیل',type:'email',required:true,placeholder:'store@example.invalid'},{key:'description',label:'توضیحات',type:'textarea',required:true}];
 return <Panel title={shipping?'ارسال و برآورد':'تنظیمات و پروفایل'}><AdminForm fields={fields} initial={w.state.settings[section]} disabled={!w.editable} onSave={v=>{const save=()=>w.mutate('تنظیمات '+section,s=>({...s,settings:{...s.settings,[section]:v}}));save();}}/>{shipping&&<div className="admin-shipping-preview"><p><Truck size={20}/> ارسال عادی: {money(Number(w.state.settings.shipping.standard))}</p><p><Truck size={20}/> ارسال سریع: {money(Number(w.state.settings.shipping.express))}</p></div>}</Panel>;
}

function Reports({workspace:w}:{workspace:Workspace}) {
 const rows=w.state.products.map((p,i)=>({id:p.id,name:p.name,createdAt:p.createdAt,status:'گزارش فروش',units:i%4+1,amount:p.variants[0].price*(i%4+1)}));
 return <><Panel title="عملکرد محصولات"><div className="admin-bars">{rows.slice(0,5).map(r=><div key={r.id}><span>{r.name}</span><meter min={0} max={4} value={r.units}>{number(r.units)}</meter><b>{number(r.units)} فروش</b></div>)}</div></Panel><DataTable label="عملکرد محصولات" rows={rows} columns={[{key:'name',label:'عطر',render:r=>r.name},{key:'units',label:'فروش',render:r=>number(r.units)},{key:'amount',label:'مبلغ',render:r=>money(r.amount)},statusColumn]}/></>;
}

function Missing({href}:{href:string}) {return <Panel title="رکورد پیدا نشد"><p>رکورد در فهرست موجود نیست.</p><a className="admin-primary" href={href}><Search size={16}/>بازگشت به فهرست</a></Panel>;}
