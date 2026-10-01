import React from 'react';
import { Lang } from '../i18n/translations';
import { useI18n } from '../i18n/I18nProvider';

export const LanguageSwitcher: React.FC = () => {
  const { uiLang, aiLang, setUiLang, setAiLang, t } = useI18n();
  return (
    <div className="space-y-2 text-sm">
      <label className="block">
        {t('uiLanguage')}
        <select
          className="mt-1 w-full border rounded px-2 py-1 bg-white"
          value={uiLang}
          onChange={(event) => setUiLang(event.target.value as Lang)}
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </label>
      <label className="block">
        {t('aiLanguage')}
        <select
          className="mt-1 w-full border rounded px-2 py-1 bg-white"
          value={aiLang}
          onChange={(event) => setAiLang(event.target.value as Lang)}
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </label>
    </div>
  );
};
