import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiRequest } from '../services/http';
import { useI18n } from '../i18n/I18nProvider';

function moduleFromPath(pathname: string): string {
  if (pathname.startsWith('/admin/dashboard')) return 'analytics';
  if (pathname.startsWith('/documents') || pathname.startsWith('/invoices')) return 'documents';
  if (pathname.startsWith('/import-export')) return 'import-export';
  if (pathname.startsWith('/shipments')) return 'shipments';
  if (pathname.startsWith('/payments')) return 'payments';
  return 'support';
}

export const AssistantPanel: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { t, aiLang } = useI18n();
  const location = useLocation();
  const moduleName = useMemo(() => moduleFromPath(location.pathname), [location.pathname]);
  const [message, setMessage] = useState('');
  const [lines, setLines] = useState<Array<{ from: 'user' | 'assistant'; text: string }>>([]);
  const [busy, setBusy] = useState(false);

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
        body: JSON.stringify({ message: text, language: aiLang, context: { module: moduleName } })
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

  return (
    <aside className="fixed inset-y-0 end-0 w-full sm:w-96 bg-white border-s shadow-xl z-40 flex flex-col">
      <div className="p-3 border-b flex items-center justify-between gap-2">
        <h2 className="font-semibold">{t('assistantTitle')}</h2>
        <div className="flex gap-2">
          <button className="text-sm border rounded px-2 py-1" onClick={() => setLines([])}>
            {t('clear')}
          </button>
          <button className="text-sm border rounded px-2 py-1" onClick={onClose} aria-label={t('close')}>
            X
          </button>
        </div>
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
    </aside>
  );
};
