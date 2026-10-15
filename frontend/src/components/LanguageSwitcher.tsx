import React, { useState } from 'react';
import { Lang } from '../i18n/translations';
import { useI18n } from '../i18n/I18nProvider';
import { cn } from '../lib/cn';
import { IconGlobe, IconChevronDown } from './icons';

interface LanguageSwitcherProps {
  showAssistant?: boolean;
  variant?: 'full' | 'compact';
}

/**
 * variant="full" : deux selects (UI + AI) — utilisé dans la sidebar ou les paramètres
 * variant="compact" : dropdown globe — utilisé dans le header
 */
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  showAssistant = true,
  variant = 'full',
}) => {
  const { uiLang, aiLang, setUiLang, setAiLang, t } = useI18n();
  const [open, setOpen] = useState(false);

  const langFull: Record<Lang, string> = {
    fr: 'Français',
    en: 'English',
    ar: 'العربية',
  };

  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-nextrade-muted hover:bg-slate-100 transition-colors"
          aria-label="Langue"
        >
          <IconGlobe className="h-4 w-4" aria-hidden />
          <span>{uiLang.toUpperCase()}</span>
          <IconChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} aria-hidden />
        </button>
        {open && (
          <div className="absolute end-0 top-full mt-1 w-36 rounded-xl border border-nextrade-border bg-white shadow-panel py-1 z-30">
            {(['fr', 'en', 'ar'] as Lang[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => { setUiLang(lang); setOpen(false); }}
                className={cn(
                  'flex w-full px-3 py-2 text-sm hover:bg-slate-50 transition-colors',
                  uiLang === lang ? 'text-nextrade-blue font-semibold' : 'text-nextrade-muted'
                )}
              >
                {langFull[lang]}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Version full
  return (
    <div className="space-y-2 text-sm">
      <label className="block">
        <span className="text-xs font-medium text-nextrade-muted">{t('uiLanguage')}</span>
        <select
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nextrade-ink outline-none focus:border-nextrade-blue focus:ring-2 focus:ring-nextrade-blue/20"
          value={uiLang}
          onChange={(e) => setUiLang(e.target.value as Lang)}
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </label>
      {showAssistant && (
        <label className="block">
          <span className="text-xs font-medium text-nextrade-muted">{t('aiLanguage')}</span>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-nextrade-ink outline-none focus:border-nextrade-blue focus:ring-2 focus:ring-nextrade-blue/20"
            value={aiLang}
            onChange={(e) => setAiLang(e.target.value as Lang)}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </label>
      )}
    </div>
  );
};
