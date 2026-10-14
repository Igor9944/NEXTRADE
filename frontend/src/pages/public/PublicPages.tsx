import React from 'react';
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nProvider';

const navItems = [
  { href: '/', label: 'Accueil' },
  { href: '/catalog', label: 'Catalogue' },
  { href: '#features', label: 'Fonctionnalités' },
  { href: '#logistics', label: 'Logistique' },
  { href: '#about', label: 'À propos' }
];

export const PublicLayout: React.FC<{ children: React.ReactNode; showSignIn?: boolean }> = ({
  children,
  showSignIn = true
}) => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <a className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:bg-white focus:p-3" href="#public-main">
        {t('skipToContent')}
      </a>
      <header className="sticky top-0 z-30 border-b border-white/20 bg-[#061f3a]/80 text-white backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label={t('appName')}>
            <img src="/assets/nextrade/nextrade-logo.png" alt="NexTrade" className="h-11 w-auto object-contain" />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-sky-100/85 md:flex" aria-label="Navigation principale">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher showAssistant={false} />
            {showSignIn && (
              <div className="hidden items-center gap-3 sm:flex">
                <Link className="rounded-full border border-white/25 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10" to="/login">
                  {t('login')}
                </Link>
                <Link className="rounded-full bg-[#1db8ff] px-4 py-2 text-sm font-semibold text-[#061f3a] shadow-sm transition hover:bg-[#6fe1ff]" to="/register">
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main id="public-main">{children}</main>
      <footer className="border-t border-sky-100 bg-[#061f3a] text-sky-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm text-sky-100/80 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-4">
            <img src="/assets/nextrade/nextrade-logo.png" alt="NexTrade" className="h-10 w-auto object-contain" />
            <p className="max-w-md text-sky-100/80">
              Connecter les marchés, créer des opportunités.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-6">
            <Link to="/catalog" className="transition hover:text-white">Catalogue</Link>
            <Link to="/login" className="transition hover:text-white">Connexion</Link>
            <span>{t('publicFooter')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <>
      <section className="relative overflow-hidden bg-[#061f3a] text-white">
        <div className="nextrade-ambient-background absolute inset-0 opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.35),_transparent_28%),linear-gradient(135deg,_rgba(6,31,58,0.78)_0%,_rgba(11,95,179,0.82)_100%)]" />

        <div className="relative mx-auto grid min-h-[38rem] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="max-w-2xl">
            <p className="mb-6 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
              {t('publicEyebrow')}
            </p>
            <h1 className="font-sans text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-7xl">
              Connecter les marchés,<br />
              <span className="text-sky-300">créer des opportunités.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-sky-100/85">
              {t('publicDescription')}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#1db8ff] px-6 font-semibold text-[#061f3a] shadow-lg shadow-cyan-500/20 transition hover:bg-[#67d6ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {t('publicCta')}
              </Link>
              <Link
                to="/catalog"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 font-semibold text-white transition hover:bg-white/10"
              >
                Explorer le catalogue
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-sky-100/80">
              <div>
                <span className="block text-2xl font-black text-white">2.4K+</span>
                <span>partenaires</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white">98.7%</span>
                <span>suivi documentaire</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white">24/7</span>
                <span>assistant IA</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-4 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-sm" />
            <div className="relative w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/95 p-5 shadow-[0_30px_80px_rgba(4,16,31,0.45)]">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                  <img src="/assets/nextrade/nextrade-logo.png" alt="NexTrade" className="h-12 w-auto object-contain" />
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Opérations en direct
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#eff7ff] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-sky-700">Catalogue</p>
                  <p className="mt-2 text-3xl font-black text-[#061f3a]">1,280</p>
                  <p className="mt-2 text-sm text-slate-600">produits actifs</p>
                </div>
                <div className="rounded-2xl bg-[#f4fbf8] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-emerald-700">Commandes</p>
                  <p className="mt-2 text-3xl font-black text-[#061f3a]">438</p>
                  <p className="mt-2 text-sm text-slate-600">en cours</p>
                </div>
                <div className="rounded-2xl bg-[#f5f7fb] p-4 sm:col-span-2">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Expéditions</span>
                    <span className="font-semibold text-emerald-600">87% à temps</span>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-[#0b5fb3] to-[#1db8ff]" />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {['Catalogue', 'Paiements', 'Logistique'].map((item, index) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#dfeeff] text-lg text-[#0b5fb3]">
                      {['📦', '💳', '🚚'][index]}
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0b5fb3]">{t('publicSectionLabel')}</p>
          <h2 className="mt-4 text-3xl font-black text-[#061f3a] sm:text-5xl">
            Une plateforme pensée pour le commerce international.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[
            { title: 'Catalogue commercial', text: 'Consultez les offres, les prix et les profils de fournisseurs approuvés.', icon: '📦' },
            { title: 'Achats & commandes', text: 'Créez, suivez et validez les commandes dans un workflow unique.', icon: '🧾' },
            { title: 'Logistique', text: 'Surveillez les expéditions, les livraisons et les transporteurs.', icon: '🚚' },
            { title: 'Documents & factures', text: 'Centralisez dossiers, factures, bordereaux et formalités.', icon: '📄' },
            { title: 'Paiements', text: 'Suivez les règlements et les transactions commerciales.', icon: '💳' },
            { title: 'Assistant IA', text: 'Obtenez de l’aide sur les décisions, les documents et les opérations.', icon: '🤖' }
          ].map((feature) => (
            <article key={feature.title} className="group rounded-[1.75rem] border border-sky-100 bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(11,95,179,0.10)]">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf7ff] text-2xl text-[#0b5fb3]">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[#061f3a]">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="logistics" className="bg-slate-100/80">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0b5fb3]">Logistique</p>
            <h2 className="mt-4 text-3xl font-black text-[#061f3a] sm:text-5xl">
              Des opérations qui restent lisibles de la commande à la livraison.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Chaque étape de votre chaîne commerciale est centralisée pour améliorer la visibilité, limiter les surprises et accélérer les échanges entre acteurs.
            </p>
            <div className="mt-8 space-y-4">
              {['Explorer les produits', 'Créer une commande', 'Suivre l’expédition', 'Consulter les documents'].map((step, index) => (
                <div key={step} className="flex items-center gap-4 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dfeeff] text-sm font-bold text-[#0b5fb3]">
                    {index + 1}
                  </div>
                  <span className="font-medium text-slate-700">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-sky-100 bg-white p-4 shadow-[0_30px_70px_rgba(10,35,71,0.10)]">
            <div className="logistics-reference h-[26rem] rounded-[1.5rem] border border-sky-100 bg-slate-200" />
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="rounded-[2rem] bg-[#061f3a] p-8 text-white md:p-12">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">NexTrade</p>
              <h2 className="mt-3 text-3xl font-black sm:text-5xl">Fournir une expérience efficace et fiable.</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-sky-100/80">
              La plateforme regroupe les acteurs — fournisseurs, acheteurs, transporteurs et administrations — autour d’un système cohérent pour piloter les opérations commerciales et logistiques.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};