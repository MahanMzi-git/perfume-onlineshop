import { Check, ShoppingBag, UserRound, MapPin, Truck, ClipboardCheck, CreditCard, Flag, Package, PackageCheck, CircleCheck, Clock3, type LucideIcon } from 'lucide-react';
export interface ProgressStep { id: string; label: string; icon: LucideIcon }
export const purchaseSteps: ProgressStep[] = [
  { id: 'cart', label: 'سبد', icon: ShoppingBag }, { id: 'contact', label: 'اطلاعات', icon: UserRound },
  { id: 'address', label: 'نشانی', icon: MapPin }, { id: 'shipping', label: 'ارسال', icon: Truck },
  { id: 'review', label: 'مرور', icon: ClipboardCheck }, { id: 'payment', label: 'پرداخت', icon: CreditCard },
  { id: 'finish', label: 'پایان', icon: Flag },
];
export const fulfillmentSteps: ProgressStep[] = [
  { id: 'processing', label: 'بررسی سفارش', icon: ClipboardCheck },
  { id: 'packing', label: 'بسته‌بندی', icon: Package },
  { id: 'ready', label: 'آمادهٔ ارسال', icon: PackageCheck },
  { id: 'shipped', label: 'ارسال‌شده', icon: Truck },
  { id: 'delivered', label: 'تحویل‌شده', icon: CircleCheck },
];
export type FulfillmentStage = 'processing' | 'packing' | 'ready' | 'shipped' | 'delivered';
export function OrderProgress({ steps, current, label, complete = false, tracking = false }: { steps: ProgressStep[]; current: number; label: string; complete?: boolean; tracking?: boolean }) {
  return <ol className={'order-progress' + (tracking ? ' order-progress-tracking' : '')} aria-label={label}>{steps.map((step, index) => {
    const finished = index < current || complete; const active = index === current && !complete; const Icon = step.icon;
    return <li key={step.id} data-state={finished ? 'complete' : active ? 'current' : 'upcoming'} aria-current={active ? 'step' : undefined}>
      <span className="order-progress-symbol"><Icon size={19} aria-hidden="true" />{finished && <Check className="order-progress-check" size={11} aria-hidden="true" />}</span>
      <span className="order-progress-label">{step.label}<span className="sr">؛ {finished ? 'تکمیل‌شده' : active ? 'مرحلهٔ فعلی' : 'در انتظار'}</span></span>
    </li>;
  })}</ol>;
}
const stageDescriptions: Record<FulfillmentStage, string> = {
  processing: 'در نمونهٔ نمایشی، سفارش برای بررسی اولیه در نظر گرفته شده است.',
  packing: 'در این نمونه، عطرها در مرحلهٔ بسته‌بندی قرار دارند.',
  ready: 'در این نمونه، بسته آمادهٔ تحویل به سرویس ارسال است.',
  shipped: 'در این نمونه، بسته به سرویس ارسال تحویل شده است.',
  delivered: 'این نمونه، نمای تحویل کامل بسته را نشان می‌دهد.',
};
export function OrderTracking({ stage, cancellationRequested = false }: { stage: FulfillmentStage; cancellationRequested?: boolean }) {
  return <section className="order-tracking" aria-label="پیگیری سفارش نمایشی"><div className="order-tracking-heading"><Clock3 size={18} aria-hidden="true" /><h3>مسیر رسیدن رایحه به شما</h3><span className="badge">نمونهٔ نمایشی</span></div>
    {cancellationRequested ? <p role="status" className="customer-notice">درخواست لغو نمایشی ثبت شده؛ آخرین مرحلهٔ نمونه در زیر نمایش داده می‌شود و به‌روزرسانی واقعی ندارد.</p> : null}
    <OrderProgress steps={fulfillmentSteps} current={fulfillmentSteps.findIndex(step => step.id === stage)} label="مراحل آماده‌سازی و ارسال نمونه" tracking complete={stage === 'delivered'} />
    <p className="tracking-description">{stageDescriptions[stage]}</p>
  </section>;
}
