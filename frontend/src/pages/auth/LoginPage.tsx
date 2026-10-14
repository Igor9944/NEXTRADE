import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/authService';
import { useI18n } from '../../i18n/I18nProvider';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      let defaultDestination = '/catalog';
      if (user.role === 'FOURNISSEUR') {
        defaultDestination = '/supplier/dashboard';
      } else if (user.role === 'TRANSPORTEUR') {
        defaultDestination = '/shipments/assigned';
      } else if (user.role === 'ADMIN') {
        defaultDestination = '/admin/dashboard';
      }
      const from = location.state?.from as { pathname?: unknown; search?: unknown; hash?: unknown } | undefined;
      const isInternalPath =
        typeof from?.pathname === 'string' &&
        from.pathname.startsWith('/') &&
        !from.pathname.startsWith('//') &&
        from.pathname !== '/login';
      const destination = isInternalPath
        ? `${from.pathname}${typeof from.search === 'string' ? from.search : ''}${typeof from.hash === 'string' ? from.hash : ''}`
        : defaultDestination;
      navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nextrade-ambient-background relative mx-auto max-w-md overflow-hidden rounded-[2rem] border border-white/20 p-1 shadow-[0_30px_80px_rgba(6,31,58,0.25)]">
      <div className="rounded-[1.6rem] bg-white/82 p-7 backdrop-blur-sm">
        <div className="mb-6 flex justify-center">
          <img src="/assets/nextrade/nextrade-logo.png" alt="NexTrade" className="h-12 w-auto object-contain" />
        </div>
        <h1 className="mb-5 text-center text-2xl font-black text-[#061f3a]">{t('loginTitle')}</h1>
        {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-600">{t('email')}</span>
            <input id="login-email" autoComplete="email" className="mt-1 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-slate-700 outline-none transition focus:border-[#0b5fb3] focus:bg-white" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-600">{t('password')}</span>
            <input id="login-password" autoComplete="current-password" className="mt-1 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-slate-700 outline-none transition focus:border-[#0b5fb3] focus:bg-white" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#0b5fb3] py-3 font-semibold text-white shadow-sm transition hover:bg-[#0a4f9a] disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? t('loading') : t('submit')}
          </button>
        </form>
        <div className="mt-5 text-center">
          <p className="text-sm text-slate-600">
            {t('dontHaveAccount')}{' '}
            <Link to="/register" className="font-semibold text-[#0b5fb3] underline-offset-2 hover:underline">
              {t('register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
