import React from 'react';
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nProvider';

export const PublicLayout: React.FC<{ children: React.ReactNode; showSignIn?: boolean }> = ({
  children,
  showSignIn = true
}) => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#f4f5ef] text-[#202a26]">
      <a className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:bg-white focus:p-3" href="#public-main">
        {t('skipToContent')}
      </a>
      <header className="border-b border-[#d8ddd5] bg-[#f4f5ef]">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link to="/" className="text-xl font-bold tracking-normal text-[#153d32]" aria-label={t('appName')}>
            NexTrade<span className="text-[#d5673c]">.</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher showAssistant={false} />
            {showSignIn && (
              <Link
                className="hidden border-b border-[#153d32] pb-1 text-sm font-semibold text-[#153d32] sm:inline-flex"
                to="/login"
              >
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      </header>
      <main id="public-main">{children}</main>
      <footer className="border-t border-[#d8ddd5]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-sm text-[#596761] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>NexTrade</span>
          <span>{t('publicFooter')}</span>
        </div>
      </footer>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <>
      <section className="bg-[#153d32] text-[#f4f5ef]">
        <div className="mx-auto grid min-h-[34rem] max-w-7xl content-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="max-w-2xl self-center">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#c8d5ca]">
              {t('publicEyebrow')}
            </p>
            <h1 className="font-serif text-5xl leading-[1.04] sm:text-6xl lg:text-7xl">
              {t('publicTitle')}
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#d9e1da]">
              {t('publicDescription')}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center justify-center bg-[#e5784e] px-6 font-semibold text-[#1f2823] transition-colors hover:bg-[#f08a61] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {t('publicCta')}
              </Link>
              <span className="text-sm text-[#c8d5ca]">{t('publicAccessNote')}</span>
            </div>
          </div>

          <div className="relative hidden min-h-[25rem] items-center justify-center lg:flex" aria-hidden="true">
            <div className="absolute inset-y-8 start-1/2 w-px bg-[#719081]" />
            <div className="absolute inset-x-10 top-1/2 h-px bg-[#719081]" />
            <div className="relative grid w-full max-w-md grid-cols-2 gap-x-14 gap-y-16">
              <div className="border-s-2 border-[#e5784e] ps-4">
                <p className="font-serif text-4xl text-white">01</p>
                <p className="mt-2 text-sm text-[#d9e1da]">{t('publicStepCatalog')}</p>
              </div>
              <div className="border-s-2 border-[#e5784e] ps-4">
                <p className="font-serif text-4xl text-white">02</p>
                <p className="mt-2 text-sm text-[#d9e1da]">{t('publicStepOrders')}</p>
              </div>
              <div className="border-s-2 border-[#e5784e] ps-4">
                <p className="font-serif text-4xl text-white">03</p>
                <p className="mt-2 text-sm text-[#d9e1da]">{t('publicStepLogistics')}</p>
              </div>
              <div className="border-s-2 border-[#e5784e] ps-4">
                <p className="font-serif text-4xl text-white">04</p>
                <p className="mt-2 text-sm text-[#d9e1da]">{t('publicStepDocuments')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#bd5734]">{t('publicSectionLabel')}</p>
          <h2 className="mt-4 max-w-md font-serif text-4xl leading-tight text-[#153d32] sm:text-5xl">
            {t('publicSectionTitle')}
          </h2>
        </div>
        <div className="grid gap-0 sm:grid-cols-3">
          <article className="border-t border-[#b8c1b8] py-5 sm:me-6">
            <h3 className="text-lg font-semibold">{t('publicFeatureCatalog')}</h3>
            <p className="mt-3 text-sm leading-6 text-[#596761]">{t('publicFeatureCatalogText')}</p>
          </article>
          <article className="border-t border-[#b8c1b8] py-5 sm:me-6">
            <h3 className="text-lg font-semibold">{t('publicFeatureOperations')}</h3>
            <p className="mt-3 text-sm leading-6 text-[#596761]">{t('publicFeatureOperationsText')}</p>
          </article>
          <article className="border-t border-[#b8c1b8] py-5">
            <h3 className="text-lg font-semibold">{t('publicFeatureFollowup')}</h3>
            <p className="mt-3 text-sm leading-6 text-[#596761]">{t('publicFeatureFollowupText')}</p>
          </article>
        </div>
      </section>
    </>
  );
};