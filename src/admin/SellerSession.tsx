import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Clock3 } from 'lucide-react';
import { Panel } from './AdminUI';

type SellerRole = 'seller' | 'analyst';
export interface DraftAccess {
  csrfToken: string;
  draftPermissions: { create: boolean; edit: boolean; createBrand: boolean; viewBrand: boolean };
}
interface Session extends DraftAccess {
  authenticated: boolean;
  role: SellerRole | null;
  expiresAt: string | null;
  lockout?: Lockout | null;
}

interface Lockout {
  lockedUntil: string;
  serverTime: string;
}

const countdownNumber = new Intl.NumberFormat('fa-IR', { minimumIntegerDigits: 2 });

const endpoint = import.meta.env.BASE_URL + 'api/v1/seller/';

async function requestSession(path: string, init?: RequestInit): Promise<Response> {
  return fetch(endpoint + path, { ...init, cache: 'no-store', credentials: 'same-origin' });
}

async function readSession(response: Response): Promise<Session> {
  if (!response.ok) throw new Error('Seller session unavailable');
  const data = await response.json();
  if (typeof data?.csrfToken !== 'string' || typeof data.authenticated !== 'boolean' ||
      typeof data.draftPermissions?.create !== 'boolean' || typeof data.draftPermissions?.edit !== 'boolean' ||
      typeof data.draftPermissions?.createBrand !== 'boolean' || typeof data.draftPermissions?.viewBrand !== 'boolean' ||
      (data.role !== null && data.role !== 'seller' && data.role !== 'analyst') ||
      (data.role !== null && (!data.authenticated || !Number.isFinite(Date.parse(data.expiresAt))))) {
    throw new Error('Invalid seller session');
  }
  return data;
}

export function SellerSession({ children }: {
  children: (role: SellerRole, logout: () => Promise<void>, draftAccess: DraftAccess) => ReactNode;
}) {
  const [session, setSession] = useState<Session>();
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [lockoutEnds, setLockoutEnds] = useState(0);
  const [remaining, setRemaining] = useState(0);

  function applyLockout(lockout: Lockout | null | undefined) {
    const duration = lockout ? Date.parse(lockout.lockedUntil) - Date.parse(lockout.serverTime) : 0;
    if (!Number.isFinite(duration) || (lockout && duration <= 0)) throw new Error('Invalid lockout');
    setLockoutEnds(duration ? Date.now() + duration : 0);
    setRemaining(Math.ceil(duration / 1000));
  }

  useEffect(() => {
    const controller = new AbortController();
    void requestSession('session/', { signal: controller.signal })
      .then(readSession)
      .then(data => {
        if (controller.signal.aborted) return;
        applyLockout(data.lockout);
        setSession(data);
      })
      .catch(() => { if (!controller.signal.aborted) setError('بررسی نشست ممکن نبود.'); });
    return () => controller.abort();
  }, [retry]);

  useEffect(() => {
    if (!lockoutEnds) return;
    function updateCountdown() {
      const seconds = Math.max(0, Math.ceil((lockoutEnds - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds > 0) return;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', updateCountdown);
      setSession(undefined);
      setError('');
      setRetry(value => value + 1);
    }
    const timer = window.setInterval(updateCountdown, 250);
    document.addEventListener('visibilitychange', updateCountdown);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', updateCountdown);
    };
  }, [lockoutEnds]);

  useEffect(() => {
    if (!session?.role || !session.expiresAt) return;
    const timer = window.setTimeout(() => {
      setSession(undefined);
      setError('');
      setRetry(value => value + 1);
    }, Math.max(0, Date.parse(session.expiresAt) - Date.now()));
    return () => window.clearTimeout(timer);
  }, [session]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || busy || lockoutEnds) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setError('');
    try {
      const response = await requestSession('login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': session.csrfToken },
        body: JSON.stringify({ username: values.get('username'), password: values.get('password') }),
      });
      if (response.status === 429) {
        form.reset();
        try {
          const data = await response.json();
          if (!data.lockout) throw new Error('Missing lockout');
          applyLockout(data.lockout);
        } catch {
          setSession(undefined);
          setRetry(value => value + 1);
        }
      } else if (response.status === 403) {
        const failure = await response.json();
        if (failure.code === 'csrf_failed') {
          const fresh = await readSession(await requestSession('session/'));
          applyLockout(fresh.lockout);
          setSession(fresh);
          setError('اعتبار فرم تازه شد. دوباره وارد شوید.');
        } else {
          form.reset();
          const username = form.elements.namedItem('username');
          if (username instanceof HTMLInputElement) username.focus();
          setError('ورود ممکن نبود. نام کاربری، رمز و دسترسی حساب را بررسی کنید.');
        }
      } else {
        setSession(await readSession(response));
      }
    } catch {
      setError('ارتباط با سرور برقرار نشد. دوباره تلاش کنید.');
    } finally {
      const password = form.elements.namedItem('password');
      if (password instanceof HTMLInputElement) password.value = '';
      setBusy(false);
    }
  }

  async function signOut() {
    if (!session || busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await requestSession('logout/', {
        method: 'POST',
        headers: { 'X-CSRFToken': session.csrfToken },
      });
      if (response.status === 403 && (await response.json()).code === 'csrf_failed') {
        setSession(await readSession(await requestSession('session/')));
        setError('اعتبار نشست تازه شد. دوباره خروج را بزنید.');
        return;
      }
      if (!response.ok) throw new Error('Seller logout failed');
      setSession(undefined);
      setRetry(value => value + 1);
    } catch {
      setError('خروج از حساب انجام نشد. دوباره تلاش کنید.');
    } finally {
      setBusy(false);
    }
  }

  if (session?.role) return <>
    {children(session.role, signOut, session)}
    {error && <div className="admin-session-feedback" dir="rtl" role="alert">{error}</div>}
  </>;

  return <div className="admin-app admin-seller" data-field-style="capsule-sage" dir="rtl">
    <header className="admin-topbar">
      <a className="admin-wordmark" href="#home" dir="ltr">AROMA <span>STORE OPERATIONS</span></a>
      <a className="admin-store-link" href="#home">بازگشت به فروشگاه</a>
    </header>
    <main className="admin-main admin-sign-in">
      <Panel title="ورود به پنل فروشنده">
        {lockoutEnds > 0 && session && <div className="admin-lockout">
          <Clock3 aria-hidden="true" size={28} />
          <strong role="status">ورود موقتاً محدود شده است</strong>
          <p>به دلیل تلاش‌های ناموفق، تا پایان زمان زیر امکان ورود وجود ندارد.</p>
          <bdi role="timer" aria-label="زمان باقی‌مانده" dir="ltr">
            {countdownNumber.format(Math.floor(remaining / 60))}:{countdownNumber.format(remaining % 60)}
          </bdi>
        </div>}
        {!session && !error && <p role="status">در حال بررسی نشست…</p>}
        {error && <p className="admin-error" role="alert">{error}</p>}
        {!session && error && <button type="button" className="admin-primary" onClick={() => {
          setError('');
          setRetry(value => value + 1);
        }}>تلاش دوباره</button>}
        {session && <form className="admin-sign-in-form" onSubmit={signIn}>
          <label htmlFor="seller-username">نام کاربری</label>
          <input id="seller-username" name="username" dir="ltr" placeholder="نام کاربری خود را وارد کنید" autoComplete="username" maxLength={150} disabled={lockoutEnds > 0} required />
          <label htmlFor="seller-password">رمز عبور</label>
          <input id="seller-password" name="password" type="password" dir="ltr" placeholder="رمز عبور خود را وارد کنید" autoComplete="current-password" maxLength={4096} disabled={lockoutEnds > 0} required />
          <button className="admin-primary" type="submit" disabled={busy || lockoutEnds > 0}>{busy ? 'در حال ورود…' : 'ورود'}</button>
        </form>}
      </Panel>
    </main>
  </div>;
}
