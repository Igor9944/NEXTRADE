import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/authService';
import { useI18n } from '../../i18n/I18nProvider';

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
      const user = await register({
        email,
        password,
        nomEntreprise,
        telephone
      });
      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-xl font-bold mb-4">{t('registerTitle')}</h1>
      {error && <p className="mb-3 text-red-600" role="alert">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-gray-600">{t('email')}</span>
          <input id="register-email" autoComplete="email" className="mt-1 w-full border rounded px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">{t('nomEntreprise')}</span>
          <input id="register-nom-entreprise" className="mt-1 w-full border rounded px-3 py-2" type="text" value={nomEntreprise} onChange={(e) => setNomEntreprise(e.target.value)} required />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">{t('telephone')}</span>
          <input id="register-telephone" autoComplete="tel" className="mt-1 w-full border rounded px-3 py-2" type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} required />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">{t('password')}</span>
          <input id="register-password" autoComplete="new-password" className="mt-1 w-full border rounded px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" disabled={loading} className="w-full bg-blue-700 text-white rounded py-2 font-semibold disabled:opacity-50">
          {loading ? t('loading') : t('register')}
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {t('alreadyHaveAccount')}
          <Link to="/login" className="text-blue-700 underline hover:text-blue-800">
            {t('login')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;