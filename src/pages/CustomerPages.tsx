import { useCallback, useEffect, useRef, useState } from 'react';
import { Heart, UserRound, MapPin, Package, FlaskConical, Clock, SlidersHorizontal, MessageSquare, Bell, LifeBuoy } from 'lucide-react';
import { useCustomer } from '../components/CustomerContext';
import { useStore } from '../components/StoreContext';
import { CustomerForm } from '../components/CustomerForm';
import { Dialog } from '../components/SharedUI';
import { ProductGrid } from '../components/ProductGrid';
import { LuxurySelect } from '../components/LuxurySelect';
import { products } from '../data/products';
import { fragranceFamilies } from '../data/fragranceFamilies';
import { demoOrders } from '../data/demoOrders';
import { contactFields, addressFields } from '../lib/customerForms';
import { loadProductIds } from '../lib/storage';
import { priceText } from '../lib/catalog';
import { DemoNotice, EmptyShopping } from './ShoppingPages';

export const accountTabs = [
  { id: 'overview', label: 'حساب من', icon: UserRound }, { id: 'profile', label: 'پروفایل', icon: UserRound }, { id: 'addresses', label: 'نشانی‌ها', icon: MapPin }, { id: 'orders', label: 'سفارش‌ها', icon: Package }, { id: 'wishlist', label: 'علاقه‌مندی‌ها', icon: Heart }, { id: 'cabinet', label: 'کمد عطر', icon: FlaskConical }, { id: 'recent', label: 'بازدیدهای اخیر', icon: Clock }, { id: 'preferences', label: 'سلیقهٔ بویایی', icon: SlidersHorizontal }, { id: 'reviews', label: 'دیدگاه‌ها', icon: MessageSquare }, { id: 'support', label: 'پشتیبانی', icon: LifeBuoy }, { id: 'notifications', label: 'اعلان‌ها', icon: Bell },
];
export function CustomerPage({ section = 'overview', orderId }: { section?: string; orderId?: string }) {
  const navigation = useRef<HTMLElement>(null);
  const navigationScroll = useRef<HTMLInputElement>(null);
  const syncNavigationScroll = useCallback(() => {
    const nav = navigation.current;
    const control = navigationScroll.current;
    if (!nav || !control) return;
    const maximum = Math.max(0, nav.scrollWidth - nav.clientWidth);
    const progress = maximum ? Math.min(100, Math.abs(nav.scrollLeft) / maximum * 100) : 0;
    control.hidden = maximum <= 1;
    control.value = String(progress);
    control.setAttribute('aria-valuetext', new Intl.NumberFormat('fa-IR').format(Math.round(progress)) + ' درصد');
  }, []);
  const { customer, setCustomer } = useCustomer(); const store = useStore(); const [message, setMessage] = useState(''); const [editingAddress, setEditingAddress] = useState<string>(); const [confirm, setConfirm] = useState<{ type: 'address' | 'order'; id: string }>(); const [reviewProduct, setReviewProduct] = useState(products[0].id); const [score, setScore] = useState(() => String(customer.reviews.find(item => item.productId === products[0].id)?.score ?? 5)); const [addressFormVersion, setAddressFormVersion] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(min-width: 901px)').matches) return;
    const frame = requestAnimationFrame(() => {
      const nav = navigation.current;
      const activeTab = nav?.querySelector<HTMLElement>('[aria-current="page"]');
      if (nav && activeTab) {
        const viewport = nav.getBoundingClientRect();
        const active = activeTab.getBoundingClientRect();
        nav.scrollLeft += active.left - viewport.left - (viewport.width - active.width) / 2;
      }
      syncNavigationScroll();
    });
    return () => cancelAnimationFrame(frame);
  }, [section, orderId, syncNavigationScroll]);
  useEffect(() => {
    const nav = navigation.current;
    if (!nav) return;
    const observer = new ResizeObserver(syncNavigationScroll);
    observer.observe(nav);
    Array.from(nav.children).forEach(child => observer.observe(child));
    syncNavigationScroll();
    return () => observer.disconnect();
  }, [syncNavigationScroll]);
  const title = orderId ? 'جزئیات سفارش نمایشی' : accountTabs.find(tab => tab.id === section)?.label ?? 'صفحه پیدا نشد';
  const order = demoOrders.find(item => item.id === orderId);
  const selectedAddress = customer.addresses.find(item => item.id === editingAddress);
  const selectedReview = customer.reviews.find(item => item.productId === reviewProduct);
  const favourites = products.filter(product => store.favourites.includes(product.id));
  const recentIds = loadProductIds('aroma-recently-viewed', new Set(products.map(product => product.id)));
  const recent = recentIds.map(id => products.find(product => product.id === id)!).filter(Boolean);
  function togglePreference(id: string) { setCustomer(value => ({ ...value, preferences: value.preferences.includes(id) ? value.preferences.filter(item => item !== id) : [...value.preferences, id] })); }
  return <section className="section container step2-page shopping-page"><h1>{title}</h1><DemoNotice /><div className="account-layout"><div className="account-navigation-wrap"><nav ref={navigation} id="account-navigation" className="account-navigation" aria-label="حساب نمایشی" onScroll={syncNavigationScroll}>{accountTabs.map(({ id, label, icon: Icon }) => <a key={id} href={'#/account/' + id} aria-current={section === id ? 'page' : undefined}><Icon size={17} aria-hidden="true" />{label}</a>)}</nav><input ref={navigationScroll} className="account-navigation-scroll" type="range" min="0" max="100" step="1" defaultValue="0" aria-label="جابه‌جایی تب‌های حساب" aria-controls="account-navigation" onChange={event => { const nav = navigation.current; if (!nav) return; const next = (nav.scrollWidth - nav.clientWidth) * event.currentTarget.valueAsNumber / 100; nav.scrollLeft = getComputedStyle(nav).direction === 'rtl' ? -next : next; syncNavigationScroll(); }} /></div><div className="account-content"><p role="status" className="customer-status">{message}</p>
    {section === 'overview' && <><div className="customer-panel"><h2>فضای شخصی رایحه‌های شما</h2><p>{customer.profile.name ? `${customer.profile.name}، به فضای آزمایشی خوش آمدید.` : 'بدون ساخت حساب واقعی، امکانات را امتحان کنید.'}</p><div className="account-shortcuts"><a href="#/account/wishlist"><Heart aria-hidden="true" size={22} />{favourites.length} عطر مورد علاقه</a><a href="#/account/cabinet"><FlaskConical aria-hidden="true" size={22} />کمد شخصی عطر</a><a href="#/account/orders"><Package aria-hidden="true" size={22} />سفارش‌های نمایشی</a></div></div><a className="step-action" href="#/account/profile">ویرایش پروفایل نمایشی</a></>}
    {section === 'profile' && <div className="customer-panel"><CustomerForm fields={contactFields} initial={customer.profile} onSave={profile => { setCustomer(value => ({ ...value, profile })); setMessage('پروفایل فقط در حافظهٔ همین نشست ذخیره شد.'); }} /></div>}
    {section === 'addresses' && <><div className="address-list">{customer.addresses.length === 0 && <p className="empty">هنوز نشانی نمایشی اضافه نکرده‌اید.</p>}{customer.addresses.map(item => <article className="customer-panel" key={item.id}><h2>{item.values.city}</h2><p>{item.values.province} · {item.values.address}</p><p>کد پستی: <bdi>{item.values.postal}</bdi></p><div className="customer-actions"><button className="step-action" onClick={() => setEditingAddress(item.id)}>ویرایش</button><button className="step-action" onClick={() => setConfirm({ type: 'address', id: item.id })}>حذف</button></div></article>)}</div><div className="customer-panel"><h2>{selectedAddress ? 'ویرایش نشانی' : 'افزودن نشانی آزمایشی'}</h2><CustomerForm key={editingAddress ?? 'new-' + addressFormVersion} fields={addressFields} initial={selectedAddress?.values} onSave={values => { setCustomer(customer => ({ ...customer, addresses: selectedAddress ? customer.addresses.map(item => item.id === selectedAddress.id ? { ...item, values } : item) : [...customer.addresses, { id: crypto.randomUUID(), values }] })); setEditingAddress(undefined); setAddressFormVersion(value => value + 1); setMessage('نشانی فقط در این نشست ذخیره شد.'); }} />{selectedAddress && <button className="text-link" onClick={() => setEditingAddress(undefined)}>انصراف از ویرایش</button>}</div></>}
    {section === 'orders' && !orderId && <>{!customer.showDemoOrders ? <div className="empty"><Package aria-hidden="true" size={28} /><h2>سفارش واقعی ندارید</h2><p>برای بررسی طراحی، دو سفارش کاملاً ساختگی را نمایش دهید.</p><button className="step-action" onClick={() => setCustomer(value => ({ ...value, showDemoOrders: true }))}>نمایش داده‌های نمونه</button></div> : <><button className="text-link" onClick={() => setCustomer(value => ({ ...value, showDemoOrders: false }))}>پنهان کردن سفارش‌های نمونه</button>{demoOrders.map(item => <article className="customer-panel" key={item.id}><h2><a href={'#/account/orders/' + item.id}>{item.id}</a></h2><p>{item.date} · {customer.cancelled.includes(item.id) ? 'درخواست لغو · نمایشی' : item.status}</p><strong>{priceText(item.total)}</strong><a className="text-link" href={'#/account/orders/' + item.id}>مشاهدهٔ جزئیات</a></article>)}</> }</>}
    {orderId && (order ? <article className="customer-panel"><p className="badge">دادهٔ کاملاً ساختگی؛ به تسویه‌حساب متصل نیست</p><h2>{order.id}</h2><p>{order.date} · {customer.cancelled.includes(order.id) ? 'درخواست لغو · نمایشی' : order.status}</p><p>{products.find(product => product.id === order.productId)?.name} · {order.volume} × {order.quantity}</p><p>مبلغ نمونه: {priceText(order.total)}</p><p>نشانی نمونه: شهر آزمایشی، خیابان نمونه. اطلاعات مشتری واقعی وجود ندارد.</p>{order.cancellable && !customer.cancelled.includes(order.id) && <button className="step-action" onClick={() => setConfirm({ type: 'order', id: order.id })}>درخواست لغو نمایشی</button>}<a className="text-link" href="#/account/orders">فهرست سفارش‌ها</a></article> : <EmptyShopping title="سفارش نمایشی پیدا نشد" />)}
    {section === 'wishlist' && <><p>این فهرست در همین مرورگر نگه‌داری می‌شود.</p>{favourites.length ? <ProductGrid list={favourites} /> : <EmptyShopping title="هنوز عطری به علاقه‌مندی‌ها اضافه نکرده‌اید" />}</>}
    {section === 'recent' && (recent.length ? <ProductGrid list={recent} /> : <EmptyShopping title="هنوز صفحهٔ عطری را ندیده‌اید" />)}
    {section === 'cabinet' && <><p>وضعیت‌های این کمد فقط در نشست آزمایشی شما می‌مانند.</p><div className="cabinet-grid">{products.map(product => { const entry = customer.cabinet[product.id] ?? {}; const update = (patch: typeof entry) => setCustomer(value => ({ ...value, cabinet: { ...value.cabinet, [product.id]: { ...value.cabinet[product.id], ...patch } } })); return <article className="customer-panel" key={product.id}><a href={'#/product/' + product.slug}><img className="cabinet-image" src={product.image} alt={product.name} width={80} height={100} loading="lazy" /><h2>{product.name}</h2></a><div className="choice-list"><label><input type="checkbox" checked={!!entry.owned} onChange={event => update({ owned: event.target.checked })} />دارم</label><label><input type="checkbox" checked={!!entry.tested} onChange={event => update({ tested: event.target.checked })} />امتحان کرده‌ام</label></div><LuxurySelect label="نظر شخصی" value={entry.opinion ?? ''} options={[{ value: '', label: 'بدون نظر' }, { value: 'liked', label: 'دوست دارم' }, { value: 'disliked', label: 'نمی‌پسندم' }]} onChange={value => update({ opinion: (value || undefined) as typeof entry.opinion })} /></article>; })}</div></>}
    {section === 'preferences' && <div className="customer-panel"><h2>خانواده‌های مورد علاقه</h2><fieldset className="choice-list"><legend>چند رایحه انتخاب کنید</legend>{fragranceFamilies.map(family => <label key={family.id}><input type="checkbox" checked={customer.preferences.includes(family.id)} onChange={() => togglePreference(family.id)} />{family.name}</label>)}</fieldset><p role="status">{customer.preferences.length} انتخاب در حافظهٔ این نشست نگه‌داری می‌شود.</p></div>}
    {section === 'reviews' && <div className="customer-panel"><p>دیدگاه آزمایشی فقط در این صفحه دیده می‌شود؛ منتشر یا در امتیاز محصولات محاسبه نمی‌شود.</p><LuxurySelect label="عطر" value={reviewProduct} options={products.map(product => ({ value: product.id, label: product.name }))} onChange={value => { setReviewProduct(value); setScore(String(customer.reviews.find(item => item.productId === value)?.score ?? 5)); }} /><LuxurySelect label="امتیاز نمایشی" value={score} options={[1, 2, 3, 4, 5].map(n => ({ value: String(n), label: `${n} از ۵` }))} onChange={setScore} /><CustomerForm key={reviewProduct} fields={[{ name: 'text', label: 'دیدگاه آزمایشی', kind: 'textarea', min: 10 }]} initial={{ text: selectedReview?.text ?? '' }} onSave={values => { setCustomer(value => ({ ...value, reviews: [...value.reviews.filter(item => item.productId !== reviewProduct), { productId: reviewProduct, score: Number(score), text: values.text }] })); setMessage('دیدگاه آزمایشی در حافظه ذخیره شد؛ منتشر نشده است.'); }} />{customer.reviews.length === 0 ? <p>دیدگاهی ننوشته‌اید.</p> : customer.reviews.map(review => <article key={review.productId}><h3>{products.find(product => product.id === review.productId)?.name} · {review.score}/۵</h3><p>{review.text}</p><button className="text-link" onClick={() => setCustomer(value => ({ ...value, reviews: value.reviews.filter(item => item.productId !== review.productId) }))}>حذف دیدگاه نمایشی</button></article>)}</div>}
    {section === 'support' && <div className="customer-panel"><p>این فرم پیام را به پشتیبانی ارسال نمی‌کند.</p><CustomerForm fields={[{ name: 'subject', label: 'موضوع', min: 3 }, { name: 'message', label: 'متن درخواست آزمایشی', kind: 'textarea', min: 10 }]} submit="نگه‌داری پیش‌نویس نمایشی" onSave={values => { setCustomer(value => ({ ...value, requests: [...value.requests, { subject: values.subject, message: values.message }] })); setMessage('پیش‌نویس در این نشست نگه‌داری شد؛ هیچ پیامی ارسال نشد.'); }} />{customer.requests.map((request, index) => <article key={index}><h3>{request.subject}</h3><p>{request.message}</p><small>پیش‌نویس محلی · ارسال نشده</small></article>)}</div>}
    {section === 'notifications' && <div className="customer-panel"><h2>ترجیحات اعلان نمایشی</h2><p>این انتخاب‌ها فقط نمایشی‌اند و هیچ ایمیل یا پیامکی ارسال نمی‌شود.</p><fieldset className="choice-list"><legend>موضوع‌های دلخواه</legend>{['خبرهای رایحه', 'موجودشدن عطرها', 'وضعیت سفارش'].map(label => <label key={label}><input type="checkbox" checked={customer.notifications.includes(label)} onChange={() => setCustomer(value => ({ ...value, notifications: value.notifications.includes(label) ? value.notifications.filter(item => item !== label) : [...value.notifications, label] }))} />{label}</label>)}</fieldset></div>}
  </div></div>{confirm && <Dialog title={confirm.type === 'order' ? 'درخواست لغو نمایشی؟' : 'حذف نشانی آزمایشی؟'} onClose={() => setConfirm(undefined)}><p>{confirm.type === 'order' ? 'فقط وضعیت نمونه در همین نشست تغییر می‌کند؛ درخواستی به فروشنده ارسال نمی‌شود.' : 'این نشانی از حافظهٔ این نشست حذف می‌شود.'}</p><div className="customer-actions"><button className="step-action" onClick={() => setConfirm(undefined)}>انصراف</button><button className="step-action" onClick={() => { if (confirm.type === 'order') setCustomer(value => ({ ...value, cancelled: [...value.cancelled, confirm.id] })); else { setCustomer(value => ({ ...value, addresses: value.addresses.filter(item => item.id !== confirm.id) })); if (editingAddress === confirm.id) setEditingAddress(undefined); } setMessage(confirm.type === 'order' ? 'وضعیت درخواست لغو نمایشی تغییر کرد.' : 'نشانی حذف شد.'); setConfirm(undefined); }}>تأیید</button></div></Dialog>}</section>;
}
