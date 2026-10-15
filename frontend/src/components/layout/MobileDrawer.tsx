import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { IconClose, IconLogout, IconAI, IconGlobe, IconChevronDown } from '../icons';
import { Badge } from '../ui/Badge';
import { useI18n } from '../../i18n/I18nProvider';
import { Lang } from '../../i18n/translations';
import type { NavItem } from './AppSidebar';
import { useState } from 'react';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  navigation: NavItem[];
  userEmail: string;
  userRole: string;
  onLogout: () => void;
  onAssistantOpen: () => void;
  logoLink?: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  open,
  onClose,
  navigation,
  userEmail,
  userRole,
  onLogout,
  onAssistantOpen,
  logoLink = '/',
}) => {
  const { t, uiLang, setUiLang } = useI18n();
  const [langOpen, setLangOpen] = useState(false);
  const langLabels: Record<Lang, string> = { fr: 'Français', en: 'English', ar: 'العربية' };

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-nextrade-navy/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex w-72 flex-col bg-white shadow-modal transition-transform duration-250',
          open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t('privateNavigation')}
      >
        {/* Header drawer */}
        <div className="flex h-16 items-center justify-between border-b border-nextrade-border px-4">
          <img
            src="/assets/nextrade/nextrade-logo.png"
            alt="NexTrade"
            className="h-8 w-auto object-contain"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="rounded-lg p-1.5 text-nextrade-muted hover:bg-slate-100 transition-colors"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-nextrade-blue/8 text-nextrade-blue'
                        : 'text-nextrade-muted hover:bg-slate-50 hover:text-nextrade-ink'
                    )
                  }
                >
                  <span aria-hidden="true" className="shrink-0">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge variant="danger">{item.badge > 99 ? '99+' : item.badge}</Badge>
                  )}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => { onAssistantOpen(); onClose(); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-nextrade-muted hover:bg-slate-50 hover:text-nextrade-ink transition-colors"
              >
                <IconAI className="h-5 w-5 shrink-0" aria-hidden />
                <span>{t('navAssistant')}</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Bas */}
        <div className="border-t border-nextrade-border p-3 space-y-2">
          {/* Langue */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-nextrade-muted hover:bg-slate-50 transition-colors"
            >
              <IconGlobe className="h-4 w-4 shrink-0" aria-hidden />
              <span>{langLabels[uiLang]}</span>
              <IconChevronDown className={cn('h-3 w-3 ms-auto transition-transform', langOpen && 'rotate-180')} aria-hidden />
            </button>
            {langOpen && (
              <div className="rounded-xl border border-nextrade-border bg-slate-50 py-1 mt-1">
                {(['fr', 'en', 'ar'] as Lang[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => { setUiLang(lang); setLangOpen(false); }}
                    className={cn(
                      'flex w-full px-4 py-2 text-sm transition-colors hover:bg-slate-100',
                      uiLang === lang ? 'text-nextrade-blue font-semibold' : 'text-nextrade-muted'
                    )}
                  >
                    {langLabels[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nextrade-blue/10 text-xs font-bold text-nextrade-blue uppercase">
              {userEmail.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-nextrade-ink">{userEmail}</p>
              <p className="text-[10px] text-nextrade-muted">{userRole}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { onClose(); onLogout(); }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-danger-500 hover:bg-danger-50 transition-colors"
          >
            <IconLogout className="h-4 w-4 shrink-0" aria-hidden />
            {t('logout')}
          </button>
        </div>
      </div>
    </>
  );
};
