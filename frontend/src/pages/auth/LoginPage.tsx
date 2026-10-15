import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/authService';
import { useI18n } from '../../i18n/I18nProvider';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { IconAlert } from '../../components/icons';

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
      const from = location.state?.from as
        | { pathname?: unknown; search?: unknown; hash?: unknown }
        | undefined;
      const isInternalPath =
        typeof from?.pathname === 'string' &&
        from.pathname.startsWith('/') &&
        !from.pathname.startsWith('//') &&
        from.pathname !== '/login';
      const destination = isInternalPath
        ? `${from.pathname}${typeof from.search === 'string' ? from.search : ''}${typeof from.hash === 'string' ? from.hash : ''}`
        : defaultDestination;
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nextrade-ambient-background relative mx-auto max-w-md overflow-hidden rounded-xl4 border border-white/20 p-1 shadow-float">
      <div className="rounded-[1.6rem] bg-white/90 p-7 backdrop-blur-sm">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img
            src="/assets/nextrade/nextrade-logo.png"
            alt="NexTrade"
            className="h-14 w-auto object-contain"
          />
        </div>

        <h1 className="mb-1 text-center text-2xl font-black text-nextrade-navy">
          {t('loginTitle')}
        </h1>
        <p className="mb-6 text-center text-sm text-nextrade-muted">
          {t('loginSubtitle')}
        </p>

        {/* Erreur */}
        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3"
          >
            <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger-500" aria-hidden />
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="login-email"
            type="email"
            label={t('email')}
            placeholder="vous@entreprise.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="login-password"
            type="password"
            label={t('password')}
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Mot de passe oublié — API non disponible, placeholder */}
          <div className="flex justify-end">
            <span
              className="text-xs text-nextrade-muted cursor-not-allowed"
              title="Fonctionnalité à venir"
            >
              {t('forgotPassword')}
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            {t('submit')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-nextrade-muted">
            {t('dontHaveAccount')}{' '}
            <Link
              to="/register"
              className="font-semibold text-nextrade-blue underline-offset-2 hover:underline"
            >
              {t('register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
