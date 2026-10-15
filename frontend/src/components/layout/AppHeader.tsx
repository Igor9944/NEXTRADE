import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { IconMenu, IconNotification, IconUser, IconLogout, IconChevronDown, IconGlobe } from '../icons';
import { useI18n } from '../../i18n/I18nProvider';
import { Lang } from '../../i18n/translations';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AppHeaderProps {
  userEmail: string;
  userRole: string;
  notificationCount?: number;
  onMenuOpen: () => void;
  onLogout: () => void;
  breadcrumbs?: Breadcrumb[];
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  userEmail,
  userRole,
  notificationCount = 0,
  onMenuOpen,
  onLogout,
  breadcrumbs,
}) => {
  const { t, uiLang, setUiLang } = useI18n();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const langLabels: Record<Lang, string> = { fr: 'FR', en: 'EN', ar: 'AR' };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-nextrade-border bg-white px-4 sm:px-6">
      {/* Hamburger mobile */}
      <button
        type="button"
        onClick={onMenuOpen}
        aria-label="Ouvrir le menu"
        className="shrink-0 rounded-lg p-1.5 text-nextrade-muted hover:bg-slate-100 transition-colors md:hidden"
      >
        <IconMenu className="h-5 w-5" />
      </button>

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Fil d'Ariane" className="hidden md:flex items-center gap-1 text-xs text-nextrade-muted overflow-hidden">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span aria-hidden="true" className="mx-1">/</span>}
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-nextrade-blue truncate transition-colors max-w-[140px]">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-nextrade-ink font-medium truncate max-w-[160px]" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sélecteur langue compact */}
      <div className="relative">
        <button
          type="button"
          onClick={() => { setLangMenuOpen((v) => !v); setUserMenuOpen(false); }}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-nextrade-muted hover:bg-slate-100 transition-colors"
          aria-label="Changer de langue"
        >
          <IconGlobe className="h-4 w-4" aria-hidden />
          <span>{langLabels[uiLang]}</span>
          <IconChevronDown className="h-3 w-3" aria-hidden />
        </button>
        {langMenuOpen && (
          <div className="absolute end-0 top-full mt-1 w-32 rounded-xl border border-nextrade-border bg-white shadow-panel py-1 z-30">
            {(['fr', 'en', 'ar'] as Lang[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => { setUiLang(lang); setLangMenuOpen(false); }}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-slate-50',
                  uiLang === lang ? 'text-nextrade-blue font-semibold' : 'text-nextrade-muted'
                )}
              >
                {lang === 'fr' ? 'Français' : lang === 'en' ? 'English' : 'العربية'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <Link
        to="/notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-nextrade-muted hover:bg-slate-100 transition-colors"
        aria-label={`${notificationCount} notification${notificationCount !== 1 ? 's' : ''}`}
      >
        <IconNotification className="h-5 w-5" />
        {notificationCount > 0 && (
          <span className="absolute end-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[9px] font-bold text-white">
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </Link>

      {/* Avatar + menu utilisateur */}
      <div ref={userMenuRef} className="relative">
        <button
          type="button"
          onClick={() => { setUserMenuOpen((v) => !v); setLangMenuOpen(false); }}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 transition-colors"
          aria-expanded={userMenuOpen}
          aria-label="Menu utilisateur"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-nextrade-blue/10 text-xs font-bold text-nextrade-blue uppercase">
            {userEmail.charAt(0)}
          </div>
          <span className="hidden text-sm font-medium text-nextrade-ink sm:block max-w-[120px] truncate">
            {userEmail.split('@')[0]}
          </span>
          <IconChevronDown className={cn('h-3 w-3 text-nextrade-muted transition-transform', userMenuOpen && 'rotate-180')} aria-hidden />
        </button>

        {userMenuOpen && (
          <div className="absolute end-0 top-full mt-1 w-52 rounded-xl border border-nextrade-border bg-white shadow-panel py-1 z-30">
            <div className="border-b border-nextrade-border px-3 py-2">
              <p className="text-xs font-medium text-nextrade-ink truncate">{userEmail}</p>
              <p className="text-[10px] text-nextrade-muted">{userRole}</p>
            </div>
            <button
              type="button"
              onClick={() => { setUserMenuOpen(false); onLogout(); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger-500 hover:bg-slate-50 transition-colors"
            >
              <IconLogout className="h-4 w-4" aria-hidden />
              {t('logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
