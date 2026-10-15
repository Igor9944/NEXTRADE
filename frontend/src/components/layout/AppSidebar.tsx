import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { Badge } from '../ui/Badge';
import {
  IconChevronDown,
  IconLogout,
  IconUser,
  IconAI,
  IconGlobe,
} from '../icons';
import { useI18n } from '../../i18n/I18nProvider';
import { Lang } from '../../i18n/translations';

export interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface AppSidebarProps {
  navigation: NavItem[];
  userEmail: string;
  userRole: string;
  onLogout: () => void;
  onAssistantOpen: () => void;
  assistantOpen: boolean;
  logoLink?: string;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  navigation,
  userEmail,
  userRole,
  onLogout,
  onAssistantOpen,
  assistantOpen,
  logoLink = '/',
}) => {
  const { t, uiLang, setUiLang } = useI18n();
  const [langOpen, setLangOpen] = useState(false);

  const langLabels: Record<Lang, string> = { fr: 'FR', en: 'EN', ar: 'AR' };

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-e border-nextrade-border bg-white">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-nextrade-border px-5">
        <Link to={logoLink} className="flex items-center gap-3" aria-label={t('appName')}>
          <img
            src="/assets/nextrade/nextrade-logo.png"
            alt="NexTrade"
            className="h-9 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav
        aria-label={t('privateNavigation')}
        className="flex-1 overflow-y-auto px-3 py-4"
      >
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-250',
                    isActive
                      ? 'bg-nextrade-blue/8 text-nextrade-blue border-s-2 border-nextrade-blue ps-2.5'
                      : 'text-nextrade-muted hover:bg-slate-50 hover:text-nextrade-ink'
                  )
                }
              >
                <span aria-hidden="true" className="shrink-0">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge variant="danger" className="ms-auto shrink-0">
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </NavLink>
            </li>
          ))}

          {/* Assistant IA */}
          <li>
            <button
              type="button"
              onClick={onAssistantOpen}
              aria-expanded={assistantOpen}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-250',
                assistantOpen
                  ? 'bg-nextrade-blue/8 text-nextrade-blue border-s-2 border-nextrade-blue ps-2.5'
                  : 'text-nextrade-muted hover:bg-slate-50 hover:text-nextrade-ink'
              )}
            >
              <span aria-hidden="true" className="shrink-0">
                <IconAI className="h-5 w-5" />
              </span>
              <span>{t('navAssistant')}</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Bas : langue + profil + logout */}
      <div className="shrink-0 border-t border-nextrade-border p-3 space-y-2">
        {/* Sélecteur de langue compact */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-nextrade-muted hover:bg-slate-50 transition-colors"
          >
            <IconGlobe className="h-4 w-4 shrink-0" aria-hidden />
            <span>{langLabels[uiLang]}</span>
            <IconChevronDown className={cn('h-3 w-3 ms-auto transition-transform', langOpen && 'rotate-180')} aria-hidden />
          </button>
          {langOpen && (
            <div className="absolute bottom-full mb-1 start-0 w-full rounded-xl border border-nextrade-border bg-white shadow-panel py-1 z-10">
              {(['fr', 'en', 'ar'] as Lang[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => { setUiLang(lang); setLangOpen(false); }}
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

        {/* Profil */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nextrade-blue/10 text-xs font-bold text-nextrade-blue uppercase">
            {userEmail.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-nextrade-ink">{userEmail}</p>
            <p className="text-[10px] text-nextrade-muted">{userRole}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-nextrade-muted hover:bg-slate-50 hover:text-danger-500 transition-colors"
        >
          <IconLogout className="h-4 w-4 shrink-0" aria-hidden />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};
