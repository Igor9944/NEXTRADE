import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiRequest } from '../services/http';
import { useI18n } from '../i18n/I18nProvider';

function moduleFromPath(pathname: string): string {
  if (pathname.startsWith('/supplier')) return 'supplier';
  if (pathname.startsWith('/admin/dashboard')) return 'analytics';
  if (pathname.startsWith('/documents') || pathname.startsWith('/invoices')) return 'documents';
  if (pathname.startsWith('/import-export')) return 'import-export';
  if (pathname.startsWith('/shipments')) return 'shipments';
  if (pathname.startsWith('/payments')) return 'payments';
  return 'support';
}

export const AssistantPanel: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { t, aiLang, setAiLang } = useI18n();
  const location = useLocation();
  const moduleName = useMemo(() => moduleFromPath(location.pathname), [location.pathname]);
  const [message, setMessage] = useState('');
  const [lines, setLines] = useState<Array<{ from: 'user' | 'assistant'; text: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [assistantLanguage, setAssistantLanguage] = useState<'fr' | 'en' | 'ar'>(aiLang);

  if (!open) return null;

  const send = async () => {
    const text = message.trim();
    if (!text) return;
    setBusy(true);
    setLines((current) => [...current, { from: 'user', text }]);
    setMessage('');
    try {
      const result = await apiRequest<{ status: string; data: { reply: string } }>('/api/v1/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, language: assistantLanguage, context: { module: moduleName } })
      });
      setLines((current) => [...current, { from: 'assistant', text: result.data.reply }]);
    } catch (error) {
      setLines((current) => [
        ...current,
        { from: 'assistant', text: error instanceof Error ? error.message : t('error') }
      ]);
    } finally {
      setBusy(false);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value as 'fr' | 'en' | 'ar';
    setAssistantLanguage(lang);
    setAiLang(lang); // Update the global assistant language preference
  };

  return (
    <div className="fixed inset-y-0 end-0 w-full sm:w-96 bg-white border-s shadow-xl z-40 flex flex-col">
      <div className="p-3 border-b flex items-center justify-between gap-2">
        <h2 id="assistant-panel-title" className="font-semibold">{t('assistantTitle')}</h2>
        <div className="flex gap-2">
          <button className="text-sm border rounded px-2 py-1" onClick={() => setLines([])}>
            {t('clear')}
          </button>
          <button className="text-sm border rounded px-2 py-1" onClick={onClose} aria-label={t('close')}>
            X
          </button>
        </div>
      </div>
      <div className="p-3 border-b">
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('assistantLanguage')}</label>
        <select
          value={assistantLanguage}
          onChange={handleLanguageChange}
          className="block w-full p-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="fr">{t('languageFrench')}</option>
          <option value="en">{t('languageEnglish')}</option>
          <option value="ar">{t('languageArabic')}</option>
        </select>
      </div>
      <p className="px-3 pt-2 text-xs text-gray-600">{t('assistantHint')} · {moduleName}</p>
      <div className="flex-1 overflow-auto p-3 space-y-2 text-sm">
        {lines.map((line, index) => (
          <div key={index} className={line.from === 'user' ? 'text-end' : 'text-start'}>
            <span className={`inline-block rounded px-2 py-1 ${line.from === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {line.text}
            </span>
          </div>
        ))}
      </div>
      <form
        className="p-3 border-t flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <input
          className="flex-1 border rounded px-2 py-2"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button className="bg-blue-700 text-white rounded px-3" disabled={busy} type="submit">
          {t('send')}
        </button>
      </form>
    </div>
  );
};

export const AssistantToggle: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({ open, onOpenChange }) => {
  const { t } = useI18n();
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
        aria-label={t('navAssistant')}
        aria-expanded={open}
        aria-controls="assistant-panel"
        onClick={() => onOpenChange(!open)}
      >
        <span className="text-xl">◉</span>
      </button>
    </div>
  );
};
