import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Search, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';
import { LuxurySelect } from '../components/LuxurySelect';
import { containDialogFocus } from '../lib/dialogFocus';
import { number } from './model';

export function AdminBadge({children}:{children:ReactNode}) { return <span className="admin-badge">{children}</span>; }
export function Panel({title,children}:{title:string;children:ReactNode}) { return <section className="admin-panel"><h2>{title}</h2>{children}</section>; }
export interface Column<T> { key:string; label:string; render:(row:T)=>ReactNode }
export function DataTable<T extends {id:string;name:string;status:string}>({rows,columns,label}:{rows:T[];columns:Column<T>[];label:string}) {
 const [query,setQuery]=useState(''),[status,setStatus]=useState('all'),[sort,setSort]=useState('asc'),[page,setPage]=useState(1);
 const normalized=(s:string)=>s.toLocaleLowerCase('fa').replace(/ي/g,'ی').replace(/ك/g,'ک');
 const filtered=rows.filter(r=>(status==='all'||r.status===status)&&normalized([r.name,r.id,r.status,...Object.values(r).filter(v=>typeof v==='string')].join(' ')).includes(normalized(query))).sort((a,b)=>a.name.localeCompare(b.name,'fa')*(sort==='asc'?1:-1));
 const pages=Math.max(1,Math.ceil(filtered.length/5)),current=Math.min(page,pages);
 return <section className="admin-panel admin-data" aria-label={label}>
  <div className="admin-table-tools"><label className="admin-search"><span><Search size={16} aria-hidden="true" /> جستجو در {label}</span><input type="search" value={query} placeholder="نام یا شناسهٔ آزمایشی…" maxLength={100} onChange={e=>{setQuery(e.target.value);setPage(1);}} /></label>
   <LuxurySelect label="وضعیت" value={status} options={[{value:'all',label:'همهٔ وضعیت‌ها'},...[...new Set(rows.map(r=>r.status))].map(s=>({value:s,label:s}))]} onChange={v=>{setStatus(v);setPage(1);}} />
   <LuxurySelect label="مرتب‌سازی نام" value={sort} options={[{value:'asc',label:'نام؛ صعودی'},{value:'desc',label:'نام؛ نزولی'}]} onChange={v=>{setSort(v);setPage(1);}} />
  </div>
  {!filtered.length?<div className="admin-empty"><Search aria-hidden="true" /><h3>موردی پیدا نشد</h3><p>عبارت یا فیلتر وضعیت را تغییر دهید.</p><button onClick={()=>{setQuery('');setStatus('all');}}>پاک کردن فیلترها</button></div>:<table><caption>{label} · داده‌های کاملاً نمایشی</caption><thead><tr>{columns.map(c=><th scope="col" key={c.key}>{c.label}</th>)}</tr></thead><tbody>{filtered.slice((current-1)*5,current*5).map(row=><tr key={row.id}>{columns.map(c=><td data-label={c.label} key={c.key}>{c.render(row)}</td>)}</tr>)}</tbody></table>}
  <div className="admin-pagination"><span>{number(filtered.length)} نتیجه · صفحهٔ {number(current)} از {number(pages)}</span><button aria-label="صفحهٔ قبل" disabled={current===1} onClick={()=>setPage(current-1)}><ChevronRight size={16} /></button><button aria-label="صفحهٔ بعد" disabled={current===pages} onClick={()=>setPage(current+1)}><ChevronLeft size={16} /></button></div>
 </section>;
}
export interface FormField { key:string; label:string; type?:'text'|'email'|'number'|'textarea'|'select'; options?:string[]; required?:boolean; placeholder?:string; min?:number; max?:number }
export function AdminForm({fields,initial,onSave,validate,disabled=false,submit='ذخیرهٔ آزمایشی'}:{fields:FormField[];initial:Record<string,string>;onSave:(values:Record<string,string>)=>void;validate?:(v:Record<string,string>)=>Record<string,string>;disabled?:boolean;submit?:string}) {
 const [values,setValues]=useState(initial),[errors,setErrors]=useState<Record<string,string>>({});const id=useId();const form=useRef<HTMLFormElement>(null);
 function save(e:FormEvent){e.preventDefault();if(disabled)return;const next:Record<string,string>={};
  for(const f of fields){const v=values[f.key]??'';if(f.required&&!v.trim())next[f.key]='این قسمت را تکمیل کنید.';
   else if(f.type==='number'&&(!/^\d+$/.test(v)||!Number.isSafeInteger(Number(v))||Number(v)<(f.min??0)||Number(v)>(f.max??Number.MAX_SAFE_INTEGER)))next[f.key]=`عدد صحیح بین ${number(f.min??0)} و ${number(f.max??999999999)} وارد کنید.`;
   else if(f.type==='email'&&v&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))next[f.key]='ایمیل معتبر آزمایشی وارد کنید.';
   else if(f.type==='select'&&!f.options?.includes(v))next[f.key]='یکی از گزینه‌های فهرست را انتخاب کنید.';
  }
  Object.assign(next,validate?.(values));setErrors(next);
  if(Object.keys(next).length){requestAnimationFrame(()=>form.current?.querySelector<HTMLElement>('[aria-invalid=true]')?.focus());return;}onSave(Object.fromEntries(Object.entries(values).map(([k,v])=>[k,v.trim()])));
 }
 return <form ref={form} className="admin-form" noValidate onSubmit={save}>
  {!!Object.keys(errors).length&&<p role="alert" className="admin-error">اطلاعات فرم را بررسی کنید؛ {number(Object.keys(errors).length)} خطا وجود دارد.</p>}
  {fields.map(f=><div className="customer-field" key={f.key}>
   {f.type==='select'?<LuxurySelect label={f.label} inputId={id+f.key} required={f.required} value={values[f.key]??''} options={[{value:'',label:'انتخاب کنید',disabled:true},...(f.options??[]).map(v=>({value:v,label:v}))]} onChange={v=>setValues(s=>({...s,[f.key]:v}))} disabled={disabled} invalid={!!errors[f.key]} describedBy={errors[f.key]?id+f.key+'error':undefined} />:<><label htmlFor={id+f.key}>{f.label}{f.required?' *':''}</label>{f.type==='textarea'?<textarea id={id+f.key} maxLength={1000} rows={3} value={values[f.key]??''} placeholder={f.placeholder} disabled={disabled} onChange={e=>setValues(s=>({...s,[f.key]:e.target.value}))} aria-invalid={!!errors[f.key]} aria-describedby={errors[f.key]?id+f.key+'error':undefined} />:<input id={id+f.key} type={f.type??'text'} inputMode={f.type==='number'?'numeric':undefined} maxLength={180} min={f.min} max={f.max} step={f.type==='number'?1:undefined} value={values[f.key]??''} placeholder={f.placeholder} disabled={disabled} onChange={e=>setValues(s=>({...s,[f.key]:e.target.value}))} aria-invalid={!!errors[f.key]} aria-describedby={errors[f.key]?id+f.key+'error':undefined} required={f.required} />}</>}
   {errors[f.key]&&<p id={id+f.key+'error'} className="admin-error">{errors[f.key]}</p>}
  </div>)}<div className="admin-form-submit"><button className="admin-primary" disabled={disabled} type="submit">{submit}</button><small>فقط حافظهٔ همین صفحه؛ بدون ارسال به سرور</small></div>
 </form>;
}
export function ConfirmDialog({title,detail,onConfirm,onClose}:{title:string;detail:string;onConfirm:()=>void;onClose:()=>void}) {
 const dialog=useRef<HTMLDialogElement>(null);const id=useId();useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const node=dialog.current;node?.showModal();return()=>{node?.close();previous?.focus({preventScroll:true});};},[]);
 return <dialog className="admin-confirm" ref={dialog} aria-labelledby={id} onKeyDown={containDialogFocus} onCancel={e=>{e.preventDefault();onClose();}}><button className="admin-close" onClick={onClose} aria-label="بستن تأیید"><X size={20}/></button><AlertCircle aria-hidden="true" /><h2 id={id}>{title}</h2><p>{detail}</p><p>این عمل فقط دادهٔ آزمایشی همین پنل را تغییر می‌دهد.</p><div className="admin-actions"><button autoFocus onClick={onClose}>انصراف</button><button className="admin-primary" onClick={()=>{onConfirm();onClose();}}>تأیید آزمایشی</button></div></dialog>;
}
