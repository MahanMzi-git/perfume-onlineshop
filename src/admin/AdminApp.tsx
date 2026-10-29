import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LayoutDashboard, Package, ShieldCheck, Menu, ArrowUpLeft, Truck, Star, Activity, Store, Search, ImagePlus, Check, AlertCircle } from 'lucide-react';
import { LuxurySelect } from '../components/LuxurySelect';
import { ScrollRail } from '../components/ScrollRail';
import { AdminBadge, AdminForm, ConfirmDialog, DataTable, Panel, type FormField } from './AdminUI';
import { advanceOrder, canAccess, canEdit, createAdminState, money, number, orderSteps, roles, sellerPages, updateVariant, validateAdminProduct, type AdminGroup, type AdminProduct, type AdminRecord, type AdminRole, type AdminRoute, type AdminState } from './model';

interface Workspace { state:AdminState; editable:boolean; mutate:(label:string,fn:(s:AdminState)=>AdminState)=>void; confirm:(title:string,detail:string,action:()=>void)=>void }
const link=(group:AdminGroup,section:string)=>`#/${group}/${section}`;
const statusColumn={key:'status',label:'وضعیت',render:(r:{status:string})=><AdminBadge>{r.status}</AdminBadge>};
const textField=(key:string,label:string,placeholder=''):FormField=>({key,label,required:true,placeholder});

export function AdminApp({route}:{route:AdminRoute}) {
 const [state,setState]=useState(createAdminState),[role,setRole]=useState<AdminRole>('visitor'),[notice,setNotice]=useState('');
 const [menu,setMenu]=useState(false),[view,setView]=useState('normal');const menuList=useRef<HTMLElement>(null);
 const [confirmation,setConfirmation]=useState<{title:string;detail:string;action:()=>void}>();
 const pages=sellerPages;
 const title=pages.find(([id])=>id===route.section)?.[1]??(route.section==='product-edit'?'ویرایش محصول':'جزئیات سفارش');
 const allowed=canAccess(role,route.group),editable=canEdit(role,route.group);
 useEffect(()=>{setView('normal');setMenu(false);setConfirmation(undefined);setNotice('');document.title=title+' | آروما · پنل نمایشی';},[route.group,route.section,route.id,title]);
 const mutate:Workspace['mutate']=(label,fn)=>{
  if(!canEdit(role,route.group)){setNotice('این نقش اجازهٔ ویرایش آزمایشی ندارد.');return;}
  setState(fn);setNotice(label+'؛ فقط در حافظهٔ آزمایشی به‌روزرسانی شد.');
 };
 const workspace:Workspace={state,editable,mutate,confirm:(title,detail,action)=>setConfirmation({title,detail,action})};
 let content:ReactNode;
 if(route.section==='overview')content=<Overview workspace={workspace}/>;
 else content=<SellerPage key={route.section+route.id} route={route} workspace={workspace}/>;
 return <div className={'admin-app admin-'+route.group} data-field-style="capsule-sage" dir="rtl">
  <a className="skip" href="#admin-main" onClick={event=>{event.preventDefault();document.getElementById('admin-main')?.focus({preventScroll:true});}}>پرش به محتوای پنل</a>
  <header className="admin-topbar"><button className="admin-nav-toggle" aria-label="فهرست صفحات پنل" aria-expanded={menu} aria-controls="admin-sidebar" onClick={()=>setMenu(v=>!v)}><Menu size={20}/></button><a className="admin-wordmark" href={link(route.group,'overview')} dir="ltr">AROMA <span>STORE OPERATIONS</span></a><a className="admin-store-link" href="#home">بازگشت به فروشگاه <ArrowUpLeft size={16}/></a></header>
  <div className="admin-shell"><aside className="admin-sidebar" id="admin-sidebar" data-open={menu||undefined}>
   <p className="admin-workspace-label"><Store size={18}/> پنل فروشنده</p>
   <div className="admin-nav-scroll"><nav ref={menuList} id="admin-page-links" aria-label="صفحات فروشنده">{pages.map(([id,label])=><a key={id} href={link(route.group,id)} aria-current={route.section===id||(id==='products'&&route.section==='product-edit')||(id==='orders'&&route.section==='order-detail')?'page':undefined}>{label}</a>)}</nav><ScrollRail viewportRef={menuList} controlsId="admin-page-links" label="پیمایش صفحات پنل"/></div>
  </aside><main id="admin-main" className="admin-main" tabIndex={-1}>
   <div className="admin-demo-banner"><ShieldCheck size={20} aria-hidden="true"/><p><strong>محیط نمایشی · بدون ورود و مجوز واقعی</strong><br/>همهٔ مشتریان، سفارش‌ها و آمار ساختگی‌اند. تغییرات فقط تا خروج از پنل یا بارگذاری مجدد باقی می‌مانند؛ هیچ پرداخت، پیام یا عملیات واقعی انجام نمی‌شود.</p></div>
   <div className="admin-access-tools"><LuxurySelect label="نقش آزمایشی؛ احراز هویت نیست" value={role} options={Object.entries(roles).map(([value,label])=>({value,label}))} onChange={v=>{setRole(v as AdminRole);setConfirmation(undefined);}}/><LuxurySelect label="تست وضعیت نمایش صفحه" value={view} options={[{value:'normal',label:'نمایش عادی'},{value:'loading',label:'در حال بارگذاری'},{value:'empty',label:'دادهٔ خالی'},{value:'error',label:'خطای آزمایشی'}]} onChange={setView}/></div>
   <div className="admin-heading"><div><p>فروشنده / {title}</p><h1>{title}</h1></div><AdminBadge>{editable?'ویرایش محلی':allowed?'فقط خواندن':'بدون دسترسی نمایشی'}</AdminBadge></div>
   <p className="admin-notification" role="status" aria-live="polite">{notice}</p>
   {!allowed?<Panel title="دسترسی این نقش به این محیط تعریف نشده"><div className="admin-empty"><ShieldCheck size={32}/><p>برای پیش‌نمایش، از فهرست بالا نقش «فروشندهٔ نمایشی» را انتخاب کنید.</p><p>این فقط نمایش مرز دسترسی در رابط است؛ حفاظت واقعی باید در بک‌اند اجرا شود.</p></div></Panel>:view==='normal'?content:view==='loading'?<Panel title="دریافت داده‌های نمونه"><p role="status" aria-busy="true">در حال بارگذاری نمایشی…</p><div className="admin-skeleton" aria-hidden="true"/><button onClick={()=>setView('normal')}>پایان تست بارگذاری</button></Panel>:<Panel title={view==='error'?'دریافت داده ناموفق بود':'هنوز داده‌ای برای نمایش نیست'}><div className="admin-empty"><AlertCircle/><p>{view==='error'?'خطای ساختگی برای بررسی رابط؛ هیچ سرویس واقعی فراخوانی نشده است.':'این حالت خالی برای تست چیدمان است و داده‌های شما را پاک نمی‌کند.'}</p><button onClick={()=>setView('normal')}>{view==='error'?'تلاش دوباره':'نمایش نمونه‌ها'}</button></div></Panel>}
  </main></div>
  {confirmation&&<ConfirmDialog title={confirmation.title} detail={confirmation.detail} onConfirm={confirmation.action} onClose={()=>setConfirmation(undefined)}/>}
 </div>;
}

function Overview({workspace:{state}}:{workspace:Workspace}) {
 const stock=state.products.reduce((sum,p)=>sum+p.variants.reduce((n,v)=>n+v.stock,0),0),low=state.products.filter(p=>p.variants.some(v=>v.stock<=3)).length;
 const total=state.orders.reduce((sum,o)=>sum+o.total,0);
 const metrics=[['فروش نمونه',money(total)],['سفارش نمونه',number(state.orders.length)],['موجودی نمونه',number(stock)],['محصول کم‌موجود',number(low)]];
 return <><p className="admin-caption">تمام شاخص‌ها مربوط به داده‌های ساختگی این جلسه‌اند؛ آمار کسب‌وکار واقعی نیستند.</p><div className="admin-metrics">{metrics.map(([label,value],i)=><article key={label}>{i===0?<LayoutDashboard/>:i===1?<Package/>:i===2?<Activity/>:<AlertCircle/>}<p>{label}</p><strong>{value}</strong></article>)}</div>
 <div className="admin-two-columns"><Panel title="کارهای امروز · نمایشی"><a className="admin-task" href={link('seller','orders')}><Truck size={20}/>بررسی {number(state.orders.filter(o=>o.status!==orderSteps[4]).length)} سفارش ساختگی <ArrowUpLeft size={16}/></a><a className="admin-task" href={link('seller','inventory')}><Package size={20}/>بررسی موجودی کم <ArrowUpLeft size={16}/></a><a className="admin-task" href={link('seller','reviews')}><Star size={20}/>دیدگاه‌های در انتظار بررسی <ArrowUpLeft size={16}/></a></Panel>
 <Panel title="مسیر سریع"><p>محصول، حجم‌ها و قیمت‌های آزمایشی را بدون تغییر فروشگاه عمومی مدیریت کنید.</p><div className="admin-actions"><a className="admin-primary" href={link('seller','product-new')}>افزودن محصول نمونه</a><a href={link('seller','reports')}>گزارش فروش نمونه</a></div></Panel></div></>;
}

function SellerPage({route,workspace:w}:{route:AdminRoute;workspace:Workspace}) {
 const {state}=w;
 switch(route.section){
  case 'products':return <><div className="admin-actions"><a className="admin-primary" href={link('seller','product-new')}>افزودن محصول</a><a href={link('seller','variants')}>حجم‌ها و قیمت</a></div><DataTable label="محصولات" rows={state.products} columns={[{key:'name',label:'محصول',render:p=><a className="admin-product-name" href={link('seller','products/'+p.id)}><img src={p.image} alt="" width={40} height={48}/><span dir="auto">{p.name}</span></a>},{key:'brand',label:'برند',render:p=>p.brand},{key:'variants',label:'حجم‌ها',render:p=>number(p.variants.length)},statusColumn,{key:'action',label:'عملیات',render:p=><a href={link('seller','products/'+p.id)}>ویرایش</a>}]} /></>;
  case 'product-new':case 'product-edit':return <ProductEditor key={route.id??'new'} id={route.id} workspace={w}/>;
  case 'inventory':case 'variants':return <VariantEditor inventory={route.section==='inventory'} workspace={w}/>;
  case 'orders':return <DataTable label="سفارش‌ها" rows={state.orders.map(o=>({...o,name:o.id}))} columns={[{key:'id',label:'سفارش',render:o=><a href={link('seller','orders/'+o.id)}>{o.id}</a>},{key:'customer',label:'مشتری ساختگی',render:o=>o.customer},{key:'total',label:'جمع نمونه',render:o=>money(o.total)},statusColumn,{key:'action',label:'عملیات',render:o=><a href={link('seller','orders/'+o.id)}>جزئیات و مراحل</a>}]} />;
  case 'order-detail':return <OrderDetail id={route.id} workspace={w}/>;
  case 'reports':return <Reports workspace={w}/>;
  case 'settings':case 'shipping':return <SettingsPage section={route.section} workspace={w}/>;
  default:return <RecordsPage section={route.section} workspace={w}/>;
 }
}

function ProductEditor({id,workspace:w}:{id?:string;workspace:Workspace}) {
 const existing=id?w.state.products.find(p=>p.id===id):undefined;
 const [image,setImage]=useState(existing?.image??''),[file,setFile]=useState<File>(),[error,setError]=useState('');
 useEffect(()=>{if(!file)return;const url=URL.createObjectURL(file);setImage(url);return()=>URL.revokeObjectURL(url);},[file]);
 if(id&&!existing)return <Missing href={link('seller','products')}/>;
 const options=(key:string)=>w.state.records[key].map(r=>r.name);
 const fields:FormField[]=[textField('name','نام محصول','نام عطر آزمایشی'),{key:'brand',label:'برند',type:'select',options:options('brands'),required:true},{key:'family',label:'خانوادهٔ رایحه',type:'select',options:options('families'),required:true},textField('notes','نت‌های منتخب','مثلاً گل رز، یاس، مشک'),{key:'status',label:'وضعیت انتشار نمونه',type:'select',options:['فعال','پیش‌نویس'],required:true}];
 return <Panel title={existing?'ویرایش اطلاعات محصول':'ساخت محصول آزمایشی'}><div className="admin-actions"><a href={link('seller','products')}>فهرست محصولات</a>{existing&&<a href={link('seller','variants')}>مدیریت حجم و قیمت</a>}</div>
  <div className="admin-image-picker"><ImagePlus aria-hidden="true"/><label>تصویر محلی (PNG، JPEG یا WebP؛ حداکثر ۲ مگابایت)<input disabled={!w.editable} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const next=e.target.files?.[0];setError('');if(!next)return;if(!['image/png','image/jpeg','image/webp'].includes(next.type)||next.size>2*1024*1024){setError('فرمت یا حجم تصویر مجاز نیست.');e.target.value='';return;}setFile(next);}}/></label>{image&&<img src={image} alt="پیش‌نمایش تصویر انتخاب‌شده" width={100} height={100} onError={()=>setError('تصویر قابل خواندن نیست؛ فایل دیگری انتخاب کنید.')}/>}<p>تصویر فقط پیش‌نمایش همین فرم است؛ آپلود نمی‌شود و به محصول ذخیره‌شده منتقل نمی‌شود.</p>{error&&<p role="alert" className="admin-error">{error}</p>}</div>
  <AdminForm fields={fields} initial={existing?{name:existing.name,brand:existing.brand,family:existing.family,notes:existing.notes,status:existing.status}:{name:'',brand:'',family:'',notes:'',status:'پیش‌نویس'}} disabled={!w.editable} validate={(v):Record<string,string>=>validateAdminProduct({name:v.name,brand:v.brand,family:v.family,notes:v.notes})} onSave={v=>{
   const product:AdminProduct={id:existing?.id??'LOCAL-PRODUCT-'+Date.now(),name:v.name,brand:v.brand,family:v.family,notes:v.notes,status:v.status,image:existing?.image??'/images/hero-editorial.svg',variants:existing?.variants??[{id:'LOCAL-VARIANT-'+Date.now(),volume:50,price:5000000,stock:0}]};
   w.mutate('ذخیرهٔ محصول آزمایشی',s=>({...s,products:existing?s.products.map(p=>p.id===existing.id?product:p):[product,...s.products]}));location.hash=link('seller','products/'+product.id);
  }}/>
 </Panel>;
}

function VariantEditor({workspace:w,inventory}:{workspace:Workspace;inventory:boolean}) {
 const [adding,setAdding]=useState(false);
 const [productId,setProductId]=useState(w.state.products[0]?.id??''),[variantId,setVariantId]=useState('');
 const product=w.state.products.find(p=>p.id===productId),variant=product?.variants.find(v=>v.id===variantId)??product?.variants[0];
 if(!product||!variant)return <Missing href={link('seller','products')}/>;
 const rows=w.state.products.flatMap(p=>p.variants.map(v=>({id:v.id,name:p.name,status:v.stock===0?'ناموجود':v.stock<=3?'موجودی کم':'موجود',volume:v.volume,price:v.price,stock:v.stock,productId:p.id})));
 return <><Panel title={inventory?'اصلاح موجودی آزمایشی':'ویرایش حجم و قیمت نمونه'}><div className="admin-two-columns"><LuxurySelect label="محصول" value={product.id} options={w.state.products.map(p=>({value:p.id,label:p.name}))} onChange={v=>{setProductId(v);setVariantId('');}}/><LuxurySelect label="حجم نمونه" value={variant.id} options={product.variants.map(v=>({value:v.id,label:number(v.volume)+' میل'}))} onChange={setVariantId}/></div>
  <AdminForm key={variant.id+variant.price+variant.stock+variant.volume} disabled={!w.editable} initial={{stock:String(variant.stock),price:String(variant.price),volume:String(variant.volume)}} fields={inventory?[{key:'stock',label:'موجودی نمونه',type:'number',min:0,max:9999,required:true}]:[{key:'volume',label:'حجم (میلی‌لیتر)',type:'number',min:1,max:1000,required:true},{key:'price',label:'قیمت نمونه (تومان)',type:'number',min:1,max:999999999,required:true},{key:'stock',label:'موجودی نمونه',type:'number',min:0,max:9999,required:true}]} validate={(v):Record<string,string>=>!inventory&&product.variants.some(item=>item.id!==variant.id&&item.volume===Number(v.volume))?{volume:'این حجم قبلاً برای محصول ثبت شده است.'}:{}} onSave={v=>w.confirm('ثبت تغییر محلی',product.name+' · '+number(variant.volume)+' میل',()=>w.mutate(inventory?'اصلاح موجودی نمونه':'اصلاح حجم و قیمت نمونه',s=>updateVariant(s,product.id,variant.id,inventory?{stock:Number(v.stock)}:{volume:Number(v.volume),price:Number(v.price),stock:Number(v.stock)})))}/>
 </Panel>{!inventory&&<Panel title="حجم تازه برای محصول انتخاب‌شده"><p>{product.name}</p><button disabled={!w.editable} onClick={()=>setAdding(v=>!v)}>{adding?'بستن فرم حجم تازه':'افزودن حجم نمونه'}</button>{adding&&<AdminForm key={product.id} disabled={!w.editable} initial={{volume:'',price:'',stock:'0'}} fields={[{key:'volume',label:'حجم جدید (میلی‌لیتر)',type:'number',min:1,max:1000,required:true},{key:'price',label:'قیمت حجم جدید (تومان)',type:'number',min:1,max:999999999,required:true},{key:'stock',label:'موجودی حجم جدید',type:'number',min:0,max:9999,required:true}]} validate={(v):Record<string,string>=>product.variants.some(item=>item.volume===Number(v.volume))?{volume:'این حجم برای محصول وجود دارد.'}:{}} onSave={v=>w.confirm('افزودن حجم آزمایشی',product.name+' · '+v.volume+' میل',()=>{const newVariant={id:'LOCAL-VARIANT-'+Date.now(),volume:Number(v.volume),price:Number(v.price),stock:Number(v.stock)};w.mutate('افزودن حجم نمونه',s=>({...s,products:s.products.map(p=>p.id===product.id?{...p,variants:[...p.variants,newVariant]}:p)}));setAdding(false);})}/>}</Panel>}<DataTable rows={rows} label="موجودی و حجم‌ها" columns={[{key:'name',label:'محصول',render:r=>r.name},{key:'volume',label:'حجم',render:r=>number(r.volume)+' میل'},{key:'price',label:'قیمت',render:r=>money(r.price)},{key:'stock',label:'موجودی نمونه',render:r=>number(r.stock)},statusColumn,{key:'edit',label:'عملیات',render:r=><button onClick={()=>{setProductId(r.productId);setVariantId(r.id);window.scrollTo({top:0,behavior:'smooth'});}}>انتخاب برای ویرایش</button>}]} /></>;
}

function OrderDetail({id,workspace:w}:{id?:string;workspace:Workspace}) {
 const order=w.state.orders.find(o=>o.id===id);if(!order)return <Missing href={link('seller','orders')}/>;
 const index=orderSteps.indexOf(order.status),next=orderSteps[index+1];
 return <><Panel title={'سفارش ساختگی '+order.id}><a href={link('seller','orders')}>بازگشت به سفارش‌ها</a><p>{order.customer} · شناسه و هویت کاملاً ساختگی؛ نشانی یا تلفن واقعی وجود ندارد.</p><dl className="admin-facts"><dt>محصول</dt><dd>{order.product}</dd><dt>تعداد</dt><dd>{number(order.quantity)}</dd><dt>جمع نمونه</dt><dd>{money(order.total)}</dd></dl>
  <ol className="admin-timeline" aria-label="مراحل آماده‌سازی سفارش نمونه">{orderSteps.map((step,i)=><li key={step} aria-current={i===index?'step':undefined} data-complete={i<=index}><span>{i<=index?<Check size={16}/>:number(i+1)}</span>{step}</li>)}</ol>
  <button className="admin-primary" disabled={!w.editable||!next} onClick={()=>w.confirm('تغییر مرحلهٔ سفارش نمونه',`از «${order.status}» به «${next}»؛ هیچ ارسال واقعی انجام نمی‌شود.`,()=>w.mutate('تغییر مرحلهٔ سفارش',s=>advanceOrder(s,order.id,next)))}>{next?'انتقال به '+next:'مراحل نمونه تکمیل شده'}</button>
 </Panel><Panel title="تاریخچهٔ نمونه">{order.history.map((step,i)=><p key={i}>{number(i+1)}. {step} · رویداد آزمایشی</p>)}</Panel></>;
}

const recordSchemas:Record<string,{title:string;fields:FormField[];statuses:string[];readOnly?:boolean}>={
 brands:{title:'برند',fields:[textField('name','نام برند','برند آزمایشی'),textField('detail','توضیح','شرح نمونه')],statuses:['فعال','پیش‌نویس']},
 families:{title:'خانوادهٔ رایحه',fields:[textField('name','نام خانواده','مثلاً چوبی'),textField('detail','توضیح','شرح خانوادهٔ رایحه')],statuses:['فعال','پیش‌نویس']},
 notes:{title:'نت بویایی',fields:[textField('name','نام نت','مثلاً یاس'),textField('detail','توضیح','شرح نت نمونه')],statuses:['فعال','پیش‌نویس']},
 campaigns:{title:'کمپین',fields:[textField('name','کد کمپین','DEMO20'),textField('detail','عنوان و شرح','تخفیف آزمایشی'),{key:'value',label:'درصد تخفیف',type:'number',min:1,max:90,required:true}],statuses:['فعال','پیش‌نویس','پایان‌یافته']},
 content:{title:'بنر و محتوا',fields:[textField('name','عنوان','عنوان بنر نمونه'),{key:'detail',label:'متن',type:'textarea',required:true},{key:'value',label:'جایگاه',type:'select',options:['هیرو','مجله','اعلان'],required:true}],statuses:['فعال','پیش‌نویس']},
 customers:{title:'مشتری ساختگی',fields:[],statuses:[],readOnly:true},
 reviews:{title:'دیدگاه نمونه',fields:[],statuses:[],readOnly:true},support:{title:'درخواست پشتیبانی',fields:[],statuses:[],readOnly:true},
};
function RecordsPage({section,workspace:w}:{section:string;workspace:Workspace}) {
 const [editing,setEditing]=useState<AdminRecord|null>(),[selected,setSelected]=useState<AdminRecord>();
 const schema=recordSchemas[section];if(!schema)return <Missing href={link('seller','overview')}/>;
 const rows=w.state.records[section]??[];
 const update=(r:AdminRecord,status:string,value=r.value)=>w.confirm('تغییر آزمایشی '+schema.title,r.name+' ← '+status,()=>w.mutate('تغییر '+schema.title,s=>({...s,records:{...s.records,[section]:s.records[section].map(item=>item.id===r.id?{...item,status,value}:item)}})));
 function actions(r:AdminRecord){
  if(!schema.readOnly)return <button disabled={!w.editable} onClick={()=>setEditing(r)}>ویرایش</button>;
  if(section==='reviews')return <div className="admin-actions"><button disabled={!w.editable||r.status==='تأیید شده'} onClick={()=>update(r,'تأیید شده')}>تأیید</button><button disabled={!w.editable||r.status==='رد شده'} onClick={()=>update(r,'رد شده')}>رد دیدگاه</button></div>;
  if(section==='support')return <button onClick={()=>setSelected(r)}>جزئیات و پاسخ محلی</button>;
  if(section==='customers')return <button onClick={()=>setSelected(r)}>نمایش اطلاعات ساختگی</button>;
  return <span>فقط مشاهده</span>;
 }
 return <>{!schema.readOnly&&<div className="admin-actions"><button className="admin-primary" disabled={!w.editable} onClick={()=>setEditing(null)}>افزودن {schema.title}</button></div>}
  {editing!==undefined&&<Panel title={(editing?'ویرایش ':'افزودن ')+schema.title}><button onClick={()=>setEditing(undefined)}>بستن فرم</button><AdminForm key={editing?.id??'new'} disabled={!w.editable} fields={[...schema.fields,{key:'status',label:'وضعیت',type:'select',required:true,options:schema.statuses}]} initial={editing?{...editing}:{name:'',detail:'',value:section==='content'?'هیرو':'',status:schema.statuses[0]}} validate={(v):Record<string,string>=>rows.some(r=>r.id!==editing?.id&&r.name.trim().toLocaleLowerCase()===v.name.trim().toLocaleLowerCase())?{name:'این نام یا کد قبلاً استفاده شده است.'}:{}} onSave={v=>{const row:AdminRecord={id:editing?.id??'LOCAL-'+Date.now(),name:v.name,detail:v.detail,status:v.status,value:v.value??''};const save=()=>{w.mutate('ذخیرهٔ '+schema.title,s=>({...s,records:{...s.records,[section]:editing?s.records[section].map(r=>r.id===row.id?row:r):[row,...(s.records[section]??[])]}}));setEditing(undefined);};save();}}/></Panel>}
  {selected&&<Panel title={selected.name}><button onClick={()=>setSelected(undefined)}>بستن جزئیات</button><p>{selected.detail}</p>{section==='customers'?<><p>شناسه: {selected.id} · {selected.value}</p><p>این شخص وجود خارجی ندارد؛ دسترسی به اطلاعات خصوصی یا حساب واقعی فراهم نیست.</p><a href={link('seller','orders')}>سفارش‌های ساختگی فروشگاه</a></>:<><AdminBadge>{rows.find(r=>r.id===selected.id)?.status}</AdminBadge><AdminForm key={selected.id} disabled={!w.editable} fields={[{key:'value',label:'پاسخ محلی؛ ارسال نمی‌شود',type:'textarea',required:true},{key:'status',label:'وضعیت درخواست',type:'select',required:true,options:['باز','در حال بررسی','بسته شده']}]} initial={{value:selected.value,status:selected.status}} onSave={v=>{update(selected,v.status,v.value);setSelected(undefined);}}/></>}</Panel>}
  <DataTable label={schema.title} rows={rows} columns={[{key:'name',label:'عنوان / شناسه',render:r=><><strong dir="auto">{r.name}</strong><small className="admin-id">{r.id}</small></>},{key:'detail',label:'توضیح نمونه',render:r=>r.detail},statusColumn,{key:'value',label:'اطلاعات',render:r=>r.value||'—'},{key:'action',label:'عملیات',render:actions}]}/>
 </>;
}

function SettingsPage({section,workspace:w}:{section:string;workspace:Workspace}) {
 const shipping=section==='shipping';
 const fields:FormField[]=shipping?[{key:'standard',label:'هزینهٔ ارسال عادی (تومان)',type:'number',min:0,max:9999999,required:true},{key:'express',label:'هزینهٔ ارسال سریع (تومان)',type:'number',min:0,max:9999999,required:true},{key:'threshold',label:'آستانهٔ ارسال رایگان (تومان)',type:'number',min:0,max:999999999,required:true}]:[textField('name','نام نمایشی','نام فروشگاه'),...(section==='settings'?[textField('owner','نام نمایشی فروشنده','نام مستعار آزمایشی')]:[]),{key:'contact',label:'ایمیل آزمایشی',type:'email',required:true,placeholder:'store@example.invalid'},{key:'description',label:'توضیحات',type:'textarea',required:true}];
 return <Panel title={shipping?'ارسال و برآورد محلی':'تنظیمات و پروفایل نمایشی'}><p>ذخیرهٔ این فرم فقط پیش‌نمایش پنل را تغییر می‌دهد؛ در فروشگاه مشتری یا زیرساخت اعمال نمی‌شود.</p><AdminForm fields={fields} initial={w.state.settings[section]} disabled={!w.editable} onSave={v=>{const save=()=>w.mutate('تنظیمات '+section,s=>({...s,settings:{...s.settings,[section]:v}}));save();}}/>{shipping&&<div className="admin-shipping-preview"><p><Truck size={20}/> ارسال عادی: {money(Number(w.state.settings.shipping.standard))}</p><p><Truck size={20}/> ارسال سریع: {money(Number(w.state.settings.shipping.express))}</p></div>}</Panel>;
}

function Reports({workspace:w}:{workspace:Workspace}) {
 const rows=w.state.products.map((p,i)=>({id:p.id,name:p.name,status:'آمار ساختگی',units:i%4+1,amount:p.variants[0].price*(i%4+1)}));
 return <><Panel title="عملکرد محصولات · دادهٔ ساختگی برای مقایسهٔ بصری"><p>بازهٔ نمونه: یک هفتهٔ فرضی؛ این اعداد از فروش واقعی استخراج نشده‌اند.</p><div className="admin-bars">{rows.slice(0,5).map(r=><div key={r.id}><span>{r.name}</span><meter min={0} max={4} value={r.units}>{number(r.units)}</meter><b>{number(r.units)} فروش نمونه</b></div>)}</div></Panel><DataTable label="عملکرد ساختگی محصولات" rows={rows} columns={[{key:'name',label:'عطر',render:r=>r.name},{key:'units',label:'فروش نمونه',render:r=>number(r.units)},{key:'amount',label:'مبلغ نمونه',render:r=>money(r.amount)},statusColumn]}/></>;
}

function Missing({href}:{href:string}) {return <Panel title="رکورد آزمایشی پیدا نشد"><p>شناسه نامعتبر است یا دادهٔ محلی با بارگذاری مجدد از بین رفته است.</p><a className="admin-primary" href={href}><Search size={16}/>بازگشت به فهرست</a></Panel>;}
