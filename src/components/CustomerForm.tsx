import { useId, useRef, useState } from 'react';
import { validateFields, type CustomerField, type FieldValues } from '../lib/customerForms';
import { LuxurySelect } from './LuxurySelect';
import { iranProvinces } from '../data/iranLocations';
export function CustomerForm({ fields, initial = {}, onSave, submit = 'ذخیرهٔ نمایشی' }: { fields: CustomerField[]; initial?: FieldValues; onSave: (values: FieldValues) => void; submit?: string }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<FieldValues>({});
  const form = useRef<HTMLFormElement>(null);
  const id = useId();
  return <form ref={form} noValidate className="customer-form" onSubmit={event => {
    event.preventDefault(); const next = validateFields(fields, values); setErrors(next);
    if (Object.keys(next).length) { requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid=true]')?.focus()); return; }
    onSave(Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])));
  }}>
    {Object.values(errors).some(Boolean) && <p role="alert" className="field-error">لطفاً موارد مشخص‌شده را اصلاح کنید.</p>}
    {fields.map(field => {
      const location = field.kind === 'province' || field.kind === 'city';
      const choices = field.kind === 'province' ? iranProvinces.map(item => item.name) : iranProvinces.find(item => item.name === values.province)?.cities ?? [];
      return <div key={field.name} className="customer-field">{location ? <LuxurySelect label={field.label} ariaLabel={field.label} inputId={`${id}-${field.name}`} invalid={!!errors[field.name]} describedBy={errors[field.name] ? `${id}-${field.name}-error` : undefined} required={!field.optional} disabled={field.kind === 'city' && !iranProvinces.some(item => item.name === values.province)} value={values[field.name] ?? ''} options={[{ value:'', label:field.kind === 'city' && !values.province ? 'ابتدا استان را انتخاب کنید' : `انتخاب ${field.label}` },...choices.map(name => ({ value:name,label:name }))]} onChange={value => { setValues(current => ({ ...current,[field.name]:value,...(field.kind === 'province' ? { city:'' } : {}) })); setErrors(current => ({ ...current,[field.name]:'',...(field.kind === 'province' ? { city:'' } : {}) })); }} /> : <><label htmlFor={`${id}-${field.name}`}>{field.label}</label>{field.kind === 'textarea' ? <textarea id={`${id}-${field.name}`} maxLength={500} required={!field.optional} value={values[field.name] ?? ''} aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `${id}-${field.name}-error` : undefined} onChange={event => setValues({ ...values, [field.name]: event.target.value })} /> : <input id={`${id}-${field.name}`} dir={['email','phone','postal'].includes(field.kind ?? '') ? 'ltr' : undefined} autoComplete={field.kind === 'phone' ? 'tel' : field.kind === 'email' ? 'email' : field.kind === 'postal' ? 'postal-code' : field.name === 'name' ? 'name' : undefined} maxLength={field.kind === 'phone' ? 11 : field.kind === 'postal' ? 10 : 254} type={field.kind === 'email' ? 'email' : field.kind === 'phone' ? 'tel' : 'text'} inputMode={field.kind === 'postal' ? 'numeric' : undefined} required={!field.optional} value={values[field.name] ?? ''} aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `${id}-${field.name}-error` : undefined} onChange={event => setValues({ ...values, [field.name]: event.target.value })} />}</>}{errors[field.name] && <p className="field-error" id={`${id}-${field.name}-error`}>{errors[field.name]}</p>}</div>;
    })}
    <button className="step-action step-primary" type="submit">{submit}</button>
  </form>;
}
