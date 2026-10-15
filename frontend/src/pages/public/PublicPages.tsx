import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { Navigation5 } from '../../components/ui/navigation-5';

export const PublicLayout: React.FC<{
  children: React.ReactNode;
  showSignIn?: boolean;
}> = ({ children, showSignIn = true }) => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-nextrade-soft text-nextrade-ink">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-nextrade-surface focus:px-4 focus:py-2 focus:shadow-panel"
        href="#public-main"
      >
        {t('skipToContent')}
      </a>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-nextrade-soft/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <Navigation5 showSignIn={showSignIn} />
      </header>

      <main id="public-main">{children}</main>

      {/* Footer */}
      <footer className="border-t border-nextrade-border/10 bg-nextrade-navy text-sky-100">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 text-sm sm:px-8 lg:grid-cols-3">
          <div>
            <img
              src="/assets/nextrade/nextrade-logo.png"
              alt="NexTrade"
              className="mb-4 h-10 w-auto object-contain"
            />
            <p className="text-sky-100/70 max-w-xs leading-6">
              Connecter les marchés, créer des opportunités.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-sky-200">
              Plateforme
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/catalog', label: t('navCatalog') },
                { to: '/login', label: t('login') },
                { to: '/register', label: t('register') },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sky-100/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-sky-100/50 text-xs">
            <p>© {new Date().getFullYear()} NexTrade</p>
            <p className="mt-1">Solution Export Import</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ─── Landing Page ─── */

const features = [
  {
    titleKey: 'featureCatalogTitle',
    textKey: 'featureCatalogText',
    icon: '📦',
    href: '/catalog',
  },
  {
    titleKey: 'featureOrdersTitle',
    textKey: 'featureOrdersText',
    icon: '🧾',
    href: '/orders',
  },
  {
    titleKey: 'featureLogisticsTitle',
    textKey: 'featureLogisticsText',
    icon: '🚢',
    href: null,
  },
  {
    titleKey: 'featureDocsTitle',
    textKey: 'featureDocsText',
    icon: '📄',
    href: null,
  },
  {
    titleKey: 'featurePaymentsTitle',
    textKey: 'featurePaymentsText',
    icon: '💳',
    href: null,
  },
  {
    titleKey: 'featureAITitle',
    textKey: 'featureAIText',
    icon: '🤖',
    href: null,
  },
];

const logisticsSteps = [
  'featureStep1',
  'featureStep2',
  'featureStep3',
  'featureStep4',
];

export const LandingPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-nextrade-navy text-white">
        <div className="nextrade-ambient-background absolute inset-0 opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.25),_transparent_28%),linear-gradient(135deg,_rgba(11,47,112,0.80)_0%,_rgba(7,89,199,0.78)_100%)]" />

        <div className="relative mx-auto grid min-h-[42rem] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          {/* Texte */}
          <div className="max-w-2xl">
            <p className="mb-6 inline-flex rounded-full border border-white/15 bg-nextrade-surface/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
              {t('publicEyebrow')}
            </p>
            <h1 className="font-inter text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              {t('publicHero1')}<br />
              <span className="text-nextrade-cyan">{t('publicHero2')}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-sky-100/85">
              {t('publicDescription')}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-nextrade-cyan px-7 font-semibold text-nextrade-navy shadow-lg shadow-cyan-500/20 transition hover:bg-[#67d6ff] "
              >
                {t('publicCta')}
              </Link>
              <Link
                to="/catalog"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-nextrade-surface/5 px-7 font-semibold text-white transition hover:bg-nextrade-surface/10"
              >
                {t('publicCatalogCta')}
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-8 text-sm text-nextrade-muted">
              {[
                { value: '2.4K+', label: t('statPartners') },
                { value: '98.7%', label: t('statDocTracking') },
                { value: '24/7', label: t('statAI') },
              ].map((stat) => (
                <div key={stat.label}>
                  <span className="block text-2xl font-black text-white">{stat.value}</span>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card dashboard flottante */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-4 rounded-xl4 border border-white/10 bg-nextrade-surface/5 backdrop-blur-sm" />
            <div className="relative w-full max-w-xl rounded-xl4 border border-white/10 bg-nextrade-surface/95 p-5 shadow-float">
              <div className="flex items-center justify-between pb-4">
                <img
                  src="/assets/nextrade/nextrade-logo.png"
                  alt="NexTrade"
                  className="h-11 w-auto object-contain"
                />
                <span className="rounded-full bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700">
                  {t('heroLive')}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl2 bg-nextrade-ice p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-nextrade-blue">
                    {t('navCatalog')}
                  </p>
                  <p className="mt-2 text-3xl font-black text-nextrade-ink">1 280</p>
                  <p className="mt-1 text-sm text-nextrade-muted">{t('heroActiveProducts')}</p>
                </div>
                <div className="rounded-xl2 bg-success-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-success-700">
                    {t('navOrders')}
                  </p>
                  <p className="mt-2 text-3xl font-black text-nextrade-ink">438</p>
                  <p className="mt-1 text-sm text-nextrade-muted">{t('heroActiveOrders')}</p>
                </div>
                <div className="rounded-xl2 bg-nextrade-soft p-4 sm:col-span-2">
                  <div className="flex items-center justify-between text-sm text-nextrade-muted">
                    <span>{t('navShipments')}</span>
                    <span className="font-semibold text-success-500">87% {t('heroOnTime')}</span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-nextrade-blue to-nextrade-cyan" />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: t('navCatalog'), icon: '📦' },
                  { label: t('navPayments'), icon: '💳' },
                  { label: t('navShipments'), icon: '🚢' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl2 border border-slate-200 bg-nextrade-soft p-3 text-center"
                  >
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-nextrade-ice text-lg">
                      {item.icon}
                    </div>
                    <p className="text-xs font-semibold text-nextrade-ink">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-nextrade-blue">
            {t('publicSectionLabel')}
          </p>
          <h2 className="mt-4 text-3xl font-black text-nextrade-ink sm:text-5xl">
            {t('featuresHeading')}
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.titleKey}
              className="group rounded-xl3 border border-nextrade-border bg-nextrade-surface p-6 shadow-card transition hover:-translate-y-1 hover:shadow-panel"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-nextrade-ice text-2xl">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-nextrade-ink">{t(feature.titleKey)}</h3>
              <p className="mt-3 text-sm leading-6 text-nextrade-muted">{t(feature.textKey)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ─── Logistique ─── */}
      <section id="logistics" className="scroll-mt-24 bg-slate-100/80">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-nextrade-blue">
              {t('publicNavLogistics')}
            </p>
            <h2 className="mt-4 text-3xl font-black text-nextrade-ink sm:text-5xl">
              {t('logisticsHeading')}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-nextrade-muted">
              {t('logisticsDescription')}
            </p>
            <div className="mt-8 space-y-3">
              {logisticsSteps.map((key, index) => (
                <div
                  key={key}
                  className="flex items-center gap-4 rounded-xl2 border border-nextrade-border bg-nextrade-surface p-4 shadow-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-nextrade-ice text-sm font-bold text-nextrade-blue">
                    {index + 1}
                  </div>
                  <span className="font-medium text-nextrade-ink">{t(key)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl4 border border-nextrade-border bg-nextrade-surface p-4 shadow-panel">
            <img
              src="/assets/nextrade/logistics-icons-reference.jpeg"
              alt="Illustrations logistique : livraison, fret maritime, aérien, entrepôt, conteneur"
              className="h-[26rem] w-full rounded-xl3 object-cover"
            />
          </div>
        </div>
      </section>

      {/* ─── About ─── */}
      <section id="about" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="relative overflow-hidden rounded-xl4 bg-nextrade-navy p-8 text-white md:p-12">
          {/* Pattern décoratif */}
          <div
            className="nextrade-pattern absolute inset-0 opacity-[0.04] mix-blend-overlay"
            aria-hidden="true"
          />
          <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-nextrade-cyan">
                NexTrade
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-5xl">
                {t('aboutHeading')}
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-nextrade-muted">
              {t('aboutDescription')}
            </p>
          </div>
          <div className="relative mt-10 flex flex-wrap gap-4">
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center rounded-full bg-nextrade-cyan px-6 font-semibold text-nextrade-navy transition hover:bg-[#67d6ff]"
            >
              {t('publicCta')}
            </Link>
            <Link
              to="/catalog"
              className="inline-flex min-h-11 items-center rounded-full border border-white/20 bg-nextrade-surface/5 px-6 font-semibold text-white transition hover:bg-nextrade-surface/10"
            >
              {t('publicCatalogCta')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
