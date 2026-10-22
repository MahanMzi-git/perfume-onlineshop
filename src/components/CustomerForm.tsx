import { useId, useRef, useState } from 'react';
import { validateFields, type CustomerField, type FieldValues } from '../lib/customerForms';
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
    {Object.keys(errors).length > 0 && <p role="alert" className="field-error">لطفاً موارد مشخص‌شده را اصلاح کنید.</p>}
    {fields.map(field => <div key={field.name} className="customer-field"><label htmlFor={`${id}-${field.name}`}>{field.label}</label>{field.kind === 'textarea' ? <textarea id={`${id}-${field.name}`} maxLength={500} required={!field.optional} value={values[field.name] ?? ''} aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `${id}-${field.name}-error` : undefined} onChange={event => setValues({ ...values, [field.name]: event.target.value })} /> : <input id={`${id}-${field.name}`} maxLength={field.kind === 'phone' ? 11 : field.kind === 'postal' ? 10 : 254} type={field.kind === 'email' ? 'email' : field.kind === 'phone' ? 'tel' : 'text'} inputMode={field.kind === 'postal' ? 'numeric' : undefined} required={!field.optional} value={values[field.name] ?? ''} aria-invalid={!!errors[field.name]} aria-describedby={errors[field.name] ? `${id}-${field.name}-error` : undefined} onChange={event => setValues({ ...values, [field.name]: event.target.value })} />}{errors[field.name] && <p className="field-error" id={`${id}-${field.name}-error`}>{errors[field.name]}</p>}</div>)}
    <button className="step-action step-primary" type="submit">{submit}</button>
  </form>;
}
