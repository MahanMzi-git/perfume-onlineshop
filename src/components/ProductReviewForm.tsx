import { useId, useState } from 'react';
import { Star, LockKeyhole } from 'lucide-react';
import { useCustomer } from './CustomerContext';
import { CustomerForm } from './CustomerForm';
import { LuxurySelect } from './LuxurySelect';
import { products } from '../data/products';
import { canReviewDemoProduct } from '../lib/reviewEligibility';
import type { Product } from '../types/product';
export function ProductReviewForm({ product }: { product?: Product }) {
 const { customer } = useCustomer();
 const eligible = products.filter(item => canReviewDemoProduct(customer, item.id));
 const [selected, setSelected] = useState('');
 const current = product ?? eligible.find(item => item.id === selected) ?? eligible[0];
 if (!current || !canReviewDemoProduct(customer, current.id)) return <div className="review-gate"><LockKeyhole size={20} aria-hidden="true" /><div><strong>دیدگاه مخصوص خریداران</strong><p>ثبت امتیاز و نظر برای حسابی فعال می‌شود که این عطر را خریده باشد. اکنون ورود و خرید واقعی فعال نیست.</p><a className="text-link" href="#/account/orders">آزمایش با سفارش‌های نمونه</a><small>در این پیش‌نمایش، فقط عطرِ سفارش تحویل‌شدهٔ نمونه قابل بررسی است.</small></div></div>;
 return <div className="review-composer"><h3>نظر شما دربارهٔ <bdi>{current.name}</bdi></h3><p className="fine-print">خریدِ نمونهٔ تحویل‌شده · نظر فقط در حافظهٔ همین نشست ذخیره می‌شود و منتشر نمی‌شود.</p>{!product && <LuxurySelect label="عطر خریداری‌شدهٔ نمونه" value={current.id} options={eligible.map(item => ({value:item.id,label:item.name}))} onChange={setSelected} />}<ReviewEditor key={current.id} product={current} /></div>;
}
function ReviewEditor({ product }: { product: Product }) {
 const { customer, saveReview, setCustomer } = useCustomer();
 const saved = customer.reviews.find(item => item.productId === product.id);
 const [score,setScore] = useState(saved?.score ?? 5);
 const [message,setMessage] = useState(''); const id=useId();
 return <><fieldset className="review-stars"><legend>امتیاز شما</legend><div dir="ltr">{[1,2,3,4,5].map(value => <label key={value}><input type="radio" name={id} value={value} checked={score === value} onChange={() => setScore(value)} aria-label={`${value} از ۵`} /><Star size={24} fill={value <= score ? 'currentColor' : 'none'} aria-hidden="true" /></label>)}</div></fieldset><CustomerForm fields={[{name:'text',label:'دیدگاه آزمایشی',kind:'textarea',min:10}]} initial={{text:saved?.text ?? ''}} submit="ذخیرهٔ دیدگاه نمایشی" onSave={values => { if (!canReviewDemoProduct(customer,product.id)) return; saveReview({productId:product.id,score,text:values.text});setMessage('دیدگاه نمایشی ذخیره شد؛ منتشر نشده و در میانگین نمونه محاسبه نمی‌شود.'); }} /><p role="status">{message}</p>{saved && <article className="saved-review"><strong>دیدگاه ذخیره‌شدهٔ شما · {new Intl.NumberFormat('fa-IR').format(saved.score)} از ۵</strong><p>{saved.text}</p><button className="text-link" onClick={() => {setCustomer(value => ({...value,reviews:value.reviews.filter(item => item.productId !== product.id)}));setMessage('دیدگاه نمایشی حذف شد.');}}>حذف دیدگاه نمایشی</button></article>}</>;
}
