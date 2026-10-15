import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { Lang } from '../../i18n/translations';
import { IconChevronDown, IconClose, IconGlobe, IconMenu } from '../icons';

const navItems = [
  { to: '/', label: 'publicNavHome' },
  { to: '/catalog', label: 'publicNavCatalog' },
  { to: '/#features', label: 'publicNavFeatures' },
  { to: '/#logistics', label: 'publicNavLogistics' },
  { to: '/#about', label: 'publicNavAbout' },
];

interface Navigation5Props {
  showSignIn?: boolean;
}

export function Navigation5({ showSignIn = true }: Navigation5Props) {
  const { t, uiLang, setUiLang } = useI18n();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const isCurrentItem = (to: string) => {
    const [pathname, hash] = to.split('#');
    return location.pathname === pathname
      && (hash ? location.hash === `#${hash}` : !location.hash);
  };

  const languageLabels: Record<Lang, string> = {
    fr: t('languageFrench'),
    en: t('languageEnglish'),
    ar: t('languageArabic'),
  };
  const renderNavigationLink = (item: (typeof navItems)[number], mobile = false) => {
    const isCurrent = isCurrentItem(item.to);
    const className = mobile
      ? `rounded-2xl px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nextrade-blue ${
        isCurrent
          ? 'bg-nextrade-ice text-nextrade-blue'
          : 'text-nextrade-muted hover:bg-nextrade-soft hover:text-nextrade-ink'
      }`
      : `whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nextrade-blue ${
        isCurrent
          ? 'bg-nextrade-ice text-nextrade-blue'
          : 'text-nextrade-muted hover:bg-nextrade-soft hover:text-nextrade-ink'
      }`;
    const onClick = mobile ? () => setMobileOpen(false) : undefined;
    const label = t(item.label);

    return item.to.includes('#') ? (
      <a
        key={item.to}
        href={item.to}
        onClick={onClick}
        aria-current={isCurrent ? 'page' : undefined}
        className={className}
      >
        {label}
      </a>
    ) : (
      <Link
        key={item.to}
        to={item.to}
        onClick={onClick}
        aria-current={isCurrent ? 'page' : undefined}
        className={className}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="relative mx-auto max-w-7xl">
      <div className="flex min-h-16 items-center justify-between gap-2 rounded-full border border-nextrade-border bg-white px-3 shadow-card sm:gap-4 sm:px-5">
        <Link
          to="/"
          className="flex shrink-0 items-center rounded-full ps-1 pe-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nextrade-blue"
          aria-label={t('appName')}
        >
          <img
            src="/assets/nextrade/nextrade-logo.png"
            alt="NexTrade"
            className="h-9 w-auto object-contain"
          />
        </Link>

        <nav
          aria-label={t('publicNavigation')}
          className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex"
        >
          {navItems.map((item) => renderNavigationLink(item))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((open) => !open)}
              aria-label={t('changeLanguage')}
              aria-expanded={langOpen}
              className="flex h-9 items-center gap-1 rounded-full px-2 text-xs font-semibold text-nextrade-muted transition-colors hover:bg-nextrade-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nextrade-blue"
            >
              <IconGlobe className="h-4 w-4" aria-hidden />
              <span>{uiLang.toUpperCase()}</span>
              <IconChevronDown className={`h-3 w-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            {langOpen && (
              <div className="absolute end-0 top-full z-40 mt-2 w-36 rounded-2xl border border-nextrade-border bg-white p-1 shadow-panel">
                {(['fr', 'en', 'ar'] as Lang[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setUiLang(lang);
                      setLangOpen(false);
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-start text-sm transition-colors hover:bg-nextrade-soft ${
                      uiLang === lang
                        ? 'font-semibold text-nextrade-blue'
                        : 'text-nextrade-muted'
                    }`}
                  >
                    {languageLabels[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {showSignIn && (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-nextrade-ink transition-colors hover:bg-nextrade-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nextrade-blue"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="whitespace-nowrap rounded-full bg-nextrade-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-nextrade-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nextrade-cyan focus-visible:ring-offset-2"
              >
                {t('register')}
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full text-nextrade-ink transition-colors hover:bg-nextrade-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nextrade-blue lg:hidden"
          >
            {mobileOpen
              ? <IconClose className="h-5 w-5" aria-hidden />
              : <IconMenu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 rounded-3xl border border-nextrade-border bg-white p-3 shadow-panel lg:hidden">
          <nav aria-label={t('publicNavigation')} className="flex flex-col gap-1">
            {navItems.map((item) => renderNavigationLink(item, true))}
            {showSignIn && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-nextrade-border pt-3 sm:hidden">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-nextrade-border px-4 py-2.5 text-center text-sm font-semibold text-nextrade-ink"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-nextrade-navy px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
