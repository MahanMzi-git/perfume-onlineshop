import { useVariantCodes, VariantCode } from '../components/VariantCode';
import { useRef, useState } from 'react';
import { Heart, UserRound, MapPin, Package, FlaskConical, Clock, SlidersHorizontal, MessageSquare, Bell, LifeBuoy, ChevronDown } from 'lucide-react';
import { ProductReviewForm } from '../components/ProductReviewForm';
import { OrderTracking } from '../components/OrderProgress';
import { useCustomer } from '../components/CustomerContext';
import { useStore } from '../components/StoreContext';
import { AdaptiveDisclosure } from '../components/AdaptiveDisclosure';
import { CustomerForm } from '../components/CustomerForm';
import { Dialog } from '../components/SharedUI';
import { ProductGrid } from '../components/ProductGrid';
import { LuxurySelect } from '../components/LuxurySelect';
import { products } from '../data/products';
import { familyImageUrl } from '../data/fragranceImages';
import { fragranceFamilies } from '../data/fragranceFamilies';
import { demoOrders } from '../data/demoOrders';
import { contactFields, addressFields } from '../lib/customerForms';
import { loadProductIds } from '../lib/storage';
import { priceText } from '../lib/catalog';
import { EmptyShopping } from './ShoppingPages';

export const accountTabs = [
  { id: 'overview', label: 'حساب من', icon: UserRound }, { id: 'profile', label: 'پروفایل', icon: UserRound }, { id: 'addresses', label: 'نشانی‌ها', icon: MapPin }, { id: 'orders', label: 'سفارش‌ها', icon: Package }, { id: 'wishlist', label: 'علاقه‌مندی‌ها', icon: Heart }, { id: 'cabinet', label: 'کمد عطر', icon: FlaskConical }, { id: 'recent', label: 'بازدیدهای اخیر', icon: Clock }, { id: 'preferences', label: 'سلیقهٔ بویایی', icon: SlidersHorizontal }, { id: 'reviews', label: 'دیدگاه‌ها', icon: MessageSquare }, { id: 'support', label: 'پشتیبانی', icon: LifeBuoy }, { id: 'notifications', label: 'اعلان‌ها', icon: Bell },
];
export function CustomerPage({ section = 'overview', orderId }: { section?: string; orderId?: string }) {
  const { customer, setCustomer } = useCustomer(); const store = useStore(); const [message, setMessage] = useState(''); const [editingAddress, setEditingAddress] = useState<string>(); const [confirm, setConfirm] = useState<{ type: 'address' | 'order'; id: string }>(); const [addressFormVersion, setAddressFormVersion] = useState(0);
  const title = orderId ? 'جزئیات سفارش نمایشی' : accountTabs.find(tab => tab.id === section)?.label ?? 'صفحه پیدا نشد';
  const codes = useVariantCodes();
  const order = demoOrders.find(item => item.id === orderId);
  const selectedAddress = customer.addresses.find(item => item.id === editingAddress);
  const favourites = products.filter(product => store.favourites.includes(product.id));
  const recentIds = loadProductIds('aroma-recently-viewed', new Set(products.map(product => product.id)));
  const recent = recentIds.map(id => products.find(product => product.id === id)!).filter(Boolean);
  function togglePreference(id: string) { setCustomer(value => ({ ...value, preferences: value.preferences.includes(id) ? value.preferences.filter(item => item !== id) : [...value.preferences, id] })); }
  const focusedLayout = ['profile', 'addresses', 'orders', 'wishlist', 'recent', 'preferences', 'reviews', 'support', 'notifications'].includes(section);
  const addressHeading = useRef<HTMLHeadingElement>(null);

  function editAddress(id: string) {
    setEditingAddress(id);
    addressHeading.current?.focus();
  }

  const accountNavigation = (
      <nav className="account-navigation" aria-label="بخش‌های حساب">
        {accountTabs.map(({ id, label, icon: Icon }) => (
          <a key={id} href={'#/account/' + id} aria-current={section === id ? 'page' : undefined}>
            <Icon size={17} aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </nav>
  );
  return <section className="section container step2-page shopping-page account-page">
    <header className="account-heading">
      <h1>{title}</h1>
      <p>حساب آزمایشی است. از اطلاعات نمونه استفاده کنید؛ خرید و ارسال واقعی انجام نمی‌شود.</p>
    </header>

    <div className={focusedLayout ? 'account-layout account-profile-layout' : 'account-layout'}>
      {focusedLayout ? (
        <AdaptiveDisclosure className="account-profile-menu" summary={<>
          <span>بخش‌های حساب</span>
          <ChevronDown size={18} aria-hidden="true" />
        </>}>
          {accountNavigation}
        </AdaptiveDisclosure>
      ) : accountNavigation}

      <div className="account-content">
        <p role="status" className="customer-status">{message}</p>
        {section === 'overview' && <>
          <div className="account-overview">
            <div className="account-overview-copy">
              <h2>{customer.profile.name ? `${customer.profile.name}، خوش آمدید` : 'فضای شخصی رایحه‌های شما'}</h2>
              <p>عطرهای دلخواه و سفارش‌های نمونه را از اینجا مرور کنید.</p>
              <a className="step-action step-primary" href="#/account/profile">ویرایش پروفایل</a>
            </div>
            <img
              src={import.meta.env.BASE_URL + 'images/account/profile.webp'}
              alt=""
              width={2172}
              height={724}
              decoding="async"
            />
          </div>
          <div className="account-shortcuts">
            <a href="#/account/wishlist"><Heart aria-hidden="true" size={19} />{new Intl.NumberFormat('fa-IR').format(favourites.length)} عطر مورد علاقه</a>
            <a href="#/account/cabinet"><FlaskConical aria-hidden="true" size={19} />کمد شخصی عطر</a>
            <a href="#/account/orders"><Package aria-hidden="true" size={19} />سفارش‌های نمایشی</a>
          </div>
        </>}
        {section === 'profile' && <div className="customer-panel account-profile-panel">
          <h2>اطلاعات تماس</h2>
          <p>نام و راه‌های تماس خود را وارد کنید. تغییرات فقط در این نشست ذخیره می‌شوند.</p>
          <CustomerForm fields={contactFields} initial={customer.profile} submit="ذخیرهٔ پروفایل" onSave={profile => {
            setCustomer(value => ({ ...value, profile }));
            setMessage('پروفایل در همین نشست ذخیره شد.');
          }} />
        </div>}
        {section === 'addresses' && <div className="account-addresses">
          <section className="customer-panel account-profile-panel account-address-editor">
            <h2 ref={addressHeading} tabIndex={-1}>{selectedAddress ? 'ویرایش نشانی' : 'افزودن نشانی آزمایشی'}</h2>
            <p>استان و شهر را انتخاب کنید، سپس نشانی و کد پستی نمونه را وارد کنید.</p>
            <CustomerForm
              key={editingAddress ?? 'new-' + addressFormVersion}
              fields={addressFields}
              initial={selectedAddress?.values}
              submit="ذخیرهٔ نشانی"
              onSave={values => {
                const entry = { id: selectedAddress?.id ?? crypto.randomUUID(), values };
                setCustomer(current => ({
                  ...current,
                  addresses: selectedAddress
                    ? current.addresses.map(item => item.id === entry.id ? entry : item)
                    : [...current.addresses, entry],
                }));
                setEditingAddress(undefined);
                setAddressFormVersion(value => value + 1);
                setMessage('نشانی فقط در این نشست ذخیره شد.');
              }}
            />
            {selectedAddress && <button type="button" className="text-link" onClick={() => setEditingAddress(undefined)}>انصراف از ویرایش</button>}
          </section>
          {customer.addresses.length > 0 && <section className="account-saved-addresses">
            <h2>نشانی‌های ذخیره‌شده</h2>
            <div className="address-list">
              {customer.addresses.map(item => <article className="customer-panel" key={item.id}>
                <h3>{item.values.city}، {item.values.province}</h3>
                <p>{item.values.address}</p>
                <p>کد پستی: <bdi>{item.values.postal}</bdi></p>
                <div className="customer-actions">
                  <button type="button" className="step-action" onClick={() => editAddress(item.id)}>ویرایش</button>
                  <button type="button" className="step-action" onClick={() => setConfirm({ type: 'address', id: item.id })}>حذف</button>
                </div>
              </article>)}
            </div>
          </section>}
        </div>}

        {section === 'orders' && !orderId && (
          customer.showDemoOrders ? <section className="account-order-list">
            <div className="account-list-heading">
              <h2>سفارش‌های نمونه</h2>
              <button type="button" className="step-action" onClick={() => setCustomer(value => ({ ...value, showDemoOrders: false }))}>پنهان کردن نمونه‌ها</button>
            </div>
            {demoOrders.map(item => {
              const product = products.find(entry => entry.id === item.productId);
              const cancelled = customer.cancelled.includes(item.id);
              return <article className="customer-panel account-order-card account-order-ticket" key={item.id}>
                <header>
                  <bdi>{item.id}</bdi>
                  <span className="account-order-status" data-stage={cancelled ? 'cancelled' : item.stage}>
                    {cancelled ? 'درخواست لغو · نمایشی' : item.status}
                  </span>
                </header>
                <div className="account-order-product">
                  {product && <img src={product.image} alt="" width={56} height={68} loading="lazy" />}
                  <div><h3><bdi>{product?.name ?? item.id}</bdi></h3><p>{item.volume} · {item.date}</p></div>
                </div>
                <div className="account-order-actions">
                  <strong>{priceText(item.total)}</strong>
                  <a className="step-action" href={'#/account/orders/' + item.id}>مشاهدهٔ جزئیات</a>
                </div>
              </article>;
            })}
          </section> : <div className="customer-panel account-empty-state">
            <Package aria-hidden="true" size={26} />
            <div>
              <h2>هنوز سفارشی ندارید</h2>
              <p>با دو سفارش نمونه، جزئیات و مراحل پیگیری را ببینید.</p>
              <button type="button" className="step-action step-primary" onClick={() => setCustomer(value => ({ ...value, showDemoOrders: true }))}>نمایش سفارش‌های نمونه</button>
            </div>
          </div>
        )}
    {orderId && (order ? <article className="customer-panel account-order-detail"><p className="badge">دادهٔ کاملاً ساختگی؛ به تسویه‌حساب متصل نیست</p><h2>{order.id}</h2><p>{order.date} · {customer.cancelled.includes(order.id) ? 'درخواست لغو · نمایشی' : order.status}</p><p>{products.find(product => product.id === order.productId)?.name} · {order.volume} × {order.quantity} · <VariantCode code={codes.get(order.variantId ?? "")} /></p><p>مبلغ نمونه: {priceText(order.total)}</p><OrderTracking stage={order.stage} cancellationRequested={customer.cancelled.includes(order.id)} /><p>نشانی نمونه: شهر آزمایشی، خیابان نمونه. اطلاعات مشتری واقعی وجود ندارد.</p>{order.cancellable && !customer.cancelled.includes(order.id) && <button className="step-action" onClick={() => setConfirm({ type: 'order', id: order.id })}>درخواست لغو نمایشی</button>}<a className="text-link" href="#/account/orders">فهرست سفارش‌ها</a></article> : <EmptyShopping title="سفارش نمایشی پیدا نشد" />)}
        {section === 'wishlist' && (
          favourites.length > 0 ? <section className="account-wishlist">
            <div className="account-list-heading">
              <h2>{new Intl.NumberFormat('fa-IR').format(favourites.length)} عطر ذخیره‌شده</h2>
              <a className="step-action" href="#/catalog">دیدن همهٔ عطرها</a>
            </div>
            <ProductGrid list={favourites} />
          </section> : <div className="customer-panel account-empty-state">
            <Heart aria-hidden="true" size={26} />
            <div>
              <h2>عطرهای دلخواهتان را اینجا نگه دارید</h2>
              <p>قلب روی کارت هر عطر را بزنید تا در همین مرورگر ذخیره شود.</p>
              <a className="step-action step-primary" href="#/catalog">دیدن همهٔ عطرها</a>
            </div>
          </div>
        )}
        {section === 'recent' && (recent.length ? <section className="account-recent">
          <div className="account-list-heading">
            <h2>عطرهایی که اخیراً دیدید</h2>
            <a className="step-action" href="#/catalog">ادامهٔ کشف عطرها</a>
          </div>
          <ProductGrid list={recent} />
        </section> : <div className="customer-panel account-empty-state">
          <Clock size={26} aria-hidden="true" />
          <div>
            <h2>هنوز عطری را باز نکرده‌اید</h2>
            <p>عطرهایی که بررسی می‌کنید اینجا می‌مانند تا دوباره پیدایشان کنید.</p>
            <a className="step-action step-primary" href="#/catalog">کشف عطرها</a>
          </div>
        </div>)}
    {section === 'cabinet' && <><p>وضعیت‌های این کمد فقط در نشست آزمایشی شما می‌مانند.</p><div className="cabinet-grid">{products.map(product => { const entry = customer.cabinet[product.id] ?? {}; const update = (patch: typeof entry) => setCustomer(value => ({ ...value, cabinet: { ...value.cabinet, [product.id]: { ...value.cabinet[product.id], ...patch } } })); return <article className="customer-panel" key={product.id}><a href={'#/product/' + product.slug}><img className="cabinet-image" src={product.image} alt={product.name} width={80} height={100} loading="lazy" /><h2>{product.name}</h2></a><div className="choice-list"><label><input type="checkbox" checked={!!entry.owned} onChange={event => update({ owned: event.target.checked })} />دارم</label><label><input type="checkbox" checked={!!entry.tested} onChange={event => update({ tested: event.target.checked })} />امتحان کرده‌ام</label></div><LuxurySelect label="نظر شخصی" value={entry.opinion ?? ''} options={[{ value: '', label: 'بدون نظر' }, { value: 'liked', label: 'دوست دارم' }, { value: 'disliked', label: 'نمی‌پسندم' }]} onChange={value => update({ opinion: (value || undefined) as typeof entry.opinion })} /></article>; })}</div></>}
        {section === 'preferences' && <section className="customer-panel account-profile-panel">
          <h2>خانواده‌های بویایی دلخواه</h2>
          <p>رایحه‌هایی را که بیشتر دوست دارید انتخاب کنید.</p>
          <fieldset className="account-choice-grid">
            <legend>خانواده‌های رایحه</legend>
            {fragranceFamilies.map(family => <label className="account-scent-choice" key={family.id}>
              <img src={familyImageUrl(family.slug)} width={42} height={42} alt="" loading="lazy" />
              <span>{family.name}</span>
              <input type="checkbox" checked={customer.preferences.includes(family.id)} onChange={() => togglePreference(family.id)} />
            </label>)}
          </fieldset>
          <p role="status">{new Intl.NumberFormat('fa-IR').format(customer.preferences.length)} انتخاب در این نشست</p>
        </section>}
        {section === 'reviews' && <section className="customer-panel account-profile-panel account-reviews">
          <h2>امتیاز و دیدگاه</h2>
          <ProductReviewForm />
        </section>}
        {section === 'support' && <div className="account-addresses">
          <section className="customer-panel account-profile-panel account-support">
            <h2>پیش‌نویس درخواست</h2>
            <p>درخواست فقط در همین نشست ذخیره می‌شود و برای پشتیبانی ارسال نمی‌شود.</p>
            <CustomerForm
              fields={[{ name: 'subject', label: 'موضوع', min: 3 }, { name: 'message', label: 'متن درخواست آزمایشی', kind: 'textarea', min: 10 }]}
              submit="ذخیرهٔ پیش‌نویس"
              onSave={values => {
                setCustomer(value => ({ ...value, requests: [...value.requests, { subject: values.subject, message: values.message }] }));
                setMessage('پیش‌نویس در این نشست ذخیره شد.');
              }}
            />
          </section>
          {customer.requests.length > 0 && <section className="account-drafts">
            <h2>پیش‌نویس‌های ذخیره‌شده</h2>
            {customer.requests.map((request, index) => <article className="customer-panel" key={index}>
              <h3>{request.subject}</h3>
              <p>{request.message}</p>
            </article>)}
          </section>}
        </div>}
        {section === 'notifications' && <section className="customer-panel account-profile-panel">
          <h2>موضوع‌های اعلان</h2>
          <p>انتخاب‌ها نمایشی‌اند و هیچ ایمیل یا پیامکی ارسال نمی‌شود.</p>
          <fieldset className="account-notification-list">
            <legend>موضوع‌های دلخواه</legend>
            {[
              { label: 'خبرهای رایحه', icon: FlaskConical, detail: 'خبرهای عطر و مجلهٔ آروما' },
              { label: 'موجودشدن عطرها', icon: Bell, detail: 'بازگشت عطرها به فروشگاه' },
              { label: 'وضعیت سفارش', icon: Package, detail: 'تغییر وضعیت و پیگیری سفارش' },
            ].map(({ label, icon: Icon, detail }) => <label key={label}>
              <Icon size={20} aria-hidden="true" />
              <span><strong>{label}</strong><small>{detail}</small></span>
              <input type="checkbox" checked={customer.notifications.includes(label)} onChange={() => setCustomer(value => ({
                ...value,
                notifications: value.notifications.includes(label)
                  ? value.notifications.filter(item => item !== label)
                  : [...value.notifications, label],
              }))} />
            </label>)}
          </fieldset>
        </section>}
  </div></div>{confirm && <Dialog title={confirm.type === 'order' ? 'درخواست لغو نمایشی؟' : 'حذف نشانی آزمایشی؟'} onClose={() => setConfirm(undefined)}><p>{confirm.type === 'order' ? 'فقط وضعیت نمونه در همین نشست تغییر می‌کند؛ درخواستی به فروشنده ارسال نمی‌شود.' : 'این نشانی از حافظهٔ این نشست حذف می‌شود.'}</p><div className="customer-actions"><button className="step-action" onClick={() => setConfirm(undefined)}>انصراف</button><button className="step-action" onClick={() => { if (confirm.type === 'order') setCustomer(value => ({ ...value, cancelled: [...value.cancelled, confirm.id] })); else { setCustomer(value => ({ ...value, addresses: value.addresses.filter(item => item.id !== confirm.id) })); if (editingAddress === confirm.id) setEditingAddress(undefined); } setMessage(confirm.type === 'order' ? 'وضعیت درخواست لغو نمایشی تغییر کرد.' : 'نشانی حذف شد.'); setConfirm(undefined); }}>تأیید</button></div></Dialog>}</section>;
}
