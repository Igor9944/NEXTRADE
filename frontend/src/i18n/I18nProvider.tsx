import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations, Lang } from './translations';
import { apiRequest } from '../services/http';
import { getToken } from '../auth/session';

const UI_KEY = 'nextrade_ui_lang';
const AI_KEY = 'nextrade_ai_lang';

type I18nValue = {
  uiLang: Lang;
  aiLang: Lang;
  setUiLang: (lang: Lang) => void;
  setAiLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

function readLang(key: string, fallback: Lang): Lang {
  const value = localStorage.getItem(key);
  return value === 'fr' || value === 'en' || value === 'ar' ? value : fallback;
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uiLang, setUiLangState] = useState<Lang>(() => readLang(UI_KEY, 'fr'));
  const [aiLang, setAiLangState] = useState<Lang>(() => readLang(AI_KEY, 'fr'));

  useEffect(() => {
    const onLang = () => {
      setUiLangState(readLang(UI_KEY, 'fr'));
      setAiLangState(readLang(AI_KEY, 'fr'));
    };
    window.addEventListener('nextrade-languages', onLang);
    return () => window.removeEventListener('nextrade-languages', onLang);
  }, []);

  useEffect(() => {
    document.documentElement.lang = uiLang;
    document.documentElement.dir = uiLang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(UI_KEY, uiLang);
  }, [uiLang]);

  useEffect(() => {
    localStorage.setItem(AI_KEY, aiLang);
  }, [aiLang]);

  const persist = (ui: Lang, ai: Lang) => {
    if (!getToken()) return;
    apiRequest('/api/v1/profile/me', {
      method: 'PATCH',
      body: JSON.stringify({ ui_language: ui, assistant_language: ai })
    }).catch(() => undefined);
  };

  const setUiLang = (lang: Lang) => {
    setUiLangState(lang);
    persist(lang, aiLang);
  };
  const setAiLang = (lang: Lang) => {
    setAiLangState(lang);
    persist(uiLang, lang);
  };

  const value = useMemo(
    () => ({
      uiLang,
      aiLang,
      setUiLang,
      setAiLang,
      t: (key: string) => translations[uiLang]?.[key] || key
    }),
    [uiLang, aiLang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('I18nProvider missing');
  return ctx;
}

export function applyProfileLanguages(ui?: string | null, ai?: string | null) {
  if (ui === 'fr' || ui === 'en' || ui === 'ar') {
    localStorage.setItem(UI_KEY, ui);
  }
  if (ai === 'fr' || ai === 'en' || ai === 'ar') {
    localStorage.setItem(AI_KEY, ai);
  }
  window.dispatchEvent(new Event('nextrade-languages'));
}
