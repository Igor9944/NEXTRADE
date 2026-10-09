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
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-xl font-bold mb-4">{t('loginTitle')}</h1>
      {error && <p className="mb-3 text-red-600" role="alert">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-gray-600">{t('email')}</span>
          <input id="login-email" autoComplete="email" className="mt-1 w-full border rounded px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">{t('password')}</span>
          <input id="login-password" autoComplete="current-password" className="mt-1 w-full border rounded px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" disabled={loading} className="w-full bg-blue-700 text-white rounded py-2 font-semibold disabled:opacity-50">
          {loading ? t('loading') : t('submit')}
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {t('dontHaveAccount')}
          <Link to="/register" className="text-blue-700 underline hover:text-blue-800">
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
