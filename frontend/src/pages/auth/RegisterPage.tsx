import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/authService';
import { useI18n } from '../../i18n/I18nProvider';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { IconAlert } from '../../components/icons';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nomEntreprise, setNomEntreprise] = useState('');
  const [telephone, setTelephone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ email, password, nomEntreprise, telephone });
      navigate('/login', { replace: true });
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
          {t('registerTitle')}
        </h1>
        <p className="mb-6 text-center text-sm text-nextrade-muted">
          {t('registerSubtitle')}
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
            id="register-email"
            type="email"
            label={t('email')}
            placeholder="vous@entreprise.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="register-nom-entreprise"
            type="text"
            label={t('nomEntreprise')}
            placeholder="NexTrade SARL"
            value={nomEntreprise}
            onChange={(e) => setNomEntreprise(e.target.value)}
            required
          />
          <Input
            id="register-telephone"
            type="tel"
            label={t('telephone')}
            placeholder="+228 90 00 00 00"
            autoComplete="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            required
          />
          <Input
            id="register-password"
            type="password"
            label={t('password')}
            placeholder="••••••••"
            autoComplete="new-password"
            description={t('passwordHint')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            {loading ? t('loading') : t('register')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-nextrade-muted">
            {t('alreadyHaveAccount')}{' '}
            <Link
              to="/login"
              className="font-semibold text-nextrade-blue underline-offset-2 hover:underline"
            >
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
