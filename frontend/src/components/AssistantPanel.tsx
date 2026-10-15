import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiRequest } from '../services/http';
import { useI18n } from '../i18n/I18nProvider';
import { cn } from '../lib/cn';
import { IconAI, IconClose, IconChevronDown } from './icons';
import { Spinner } from './ui/Spinner';

function moduleFromPath(pathname: string): string {
  if (pathname.startsWith('/supplier')) return 'supplier';
  if (pathname.startsWith('/admin/dashboard')) return 'analytics';
  if (pathname.startsWith('/documents') || pathname.startsWith('/invoices')) return 'documents';
  if (pathname.startsWith('/import-export')) return 'import-export';
  if (pathname.startsWith('/shipments')) return 'shipments';
  if (pathname.startsWith('/payments')) return 'payments';
  return 'support';
}

export const AssistantPanel: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { t, aiLang, setAiLang } = useI18n();
  const location = useLocation();
  const moduleName = useMemo(() => moduleFromPath(location.pathname), [location.pathname]);
  const [message, setMessage] = useState('');
  const [lines, setLines] = useState<Array<{ from: 'user' | 'assistant'; text: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines, open]);

  // Fermeture clavier
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const send = async () => {
    const text = message.trim();
    if (!text || busy) return;
    setBusy(true);
    setLines((prev) => [...prev, { from: 'user', text }]);
    setMessage('');
    try {
      const result = await apiRequest<{ status: string; data: { reply: string } }>(
        '/api/v1/ai/chat',
        {
          method: 'POST',
          body: JSON.stringify({ message: text, language: aiLang, context: { module: moduleName } }),
        }
      );
      setLines((prev) => [...prev, { from: 'assistant', text: result.data.reply }]);
    } catch (error) {
      setLines((prev) => [
        ...prev,
        { from: 'assistant', text: error instanceof Error ? error.message : t('error') },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const langLabels: Record<string, string> = { fr: 'Français', en: 'English', ar: 'العربية' };
  const langs = ['fr', 'en', 'ar'] as const;

  return (
    <div
      id="assistant-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-panel-title"
      className="fixed inset-y-0 end-0 z-40 flex w-full flex-col border-s border-nextrade-border bg-white shadow-modal sm:w-96"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-nextrade-border px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-nextrade-blue/10 text-nextrade-blue">
          <IconAI className="h-4 w-4" aria-hidden />
        </div>
        <h2 id="assistant-panel-title" className="flex-1 font-semibold text-nextrade-ink">
          {t('assistantTitle')}
        </h2>

        {/* Sélecteur langue AI compact */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-nextrade-muted hover:bg-slate-100 transition-colors"
          >
            {langLabels[aiLang]}
            <IconChevronDown className={cn('h-3 w-3 transition-transform', langOpen && 'rotate-180')} aria-hidden />
          </button>
          {langOpen && (
            <div className="absolute end-0 top-full mt-1 w-28 rounded-xl border border-nextrade-border bg-white shadow-panel py-1 z-10">
              {langs.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => { setAiLang(lang); setLangOpen(false); }}
                  className={cn(
                    'flex w-full px-3 py-1.5 text-xs hover:bg-slate-50',
                    aiLang === lang ? 'text-nextrade-blue font-semibold' : 'text-nextrade-muted'
                  )}
                >
                  {langLabels[lang]}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setLines([])}
          className="rounded-lg p-1 text-xs text-nextrade-muted hover:bg-slate-100 transition-colors"
          aria-label={t('clear')}
        >
          {t('clear')}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-nextrade-muted hover:bg-slate-100 transition-colors"
          aria-label={t('close')}
        >
          <IconClose className="h-4 w-4" />
        </button>
      </div>

      {/* Hint module */}
      <p className="px-4 pt-2 text-xs text-nextrade-muted">
        {t('assistantHint')} · <span className="font-medium">{moduleName}</span>
      </p>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
        {lines.length === 0 && (
          <p className="text-center text-xs text-nextrade-muted pt-8">
            {t('assistantEmpty')}
          </p>
        )}
        {lines.map((line, i) => (
          <div key={i} className={cn('flex', line.from === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] rounded-xl px-3 py-2 text-sm leading-6',
                line.from === 'user'
                  ? 'bg-nextrade-blue text-white rounded-br-sm'
                  : 'bg-slate-100 text-nextrade-ink rounded-bl-sm'
              )}
            >
              {line.text}
            </div>
          </div>
        ))}
        {/* Indicateur typing */}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-xl rounded-bl-sm bg-slate-100 px-4 py-2">
              <Spinner size="xs" label="L'assistant répond…" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <form
        className="border-t border-nextrade-border p-3"
        onSubmit={(e) => { e.preventDefault(); send(); }}
      >
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nextrade-ink placeholder:text-nextrade-muted outline-none focus:border-nextrade-blue focus:ring-2 focus:ring-nextrade-blue/20 transition-colors"
            placeholder={t('assistantPlaceholder')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={busy}
            aria-label={t('send')}
          />
          <button
            type="submit"
            disabled={busy || !message.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nextrade-blue text-white transition hover:bg-[#0a4f9a] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('send')}
          >
            <svg className="h-4 w-4 rtl:rotate-180" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export const AssistantToggle: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const { t } = useI18n();
  return (
    <div className="fixed bottom-6 end-6 z-50">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label={t('navAssistant')}
        aria-expanded={open}
        aria-controls={open ? 'assistant-panel' : undefined}
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full text-white shadow-float',
          'transition-all duration-250',
          open
            ? 'bg-nextrade-navy'
            : 'bg-nextrade-blue hover:bg-nextrade-navy animate-[pulse_3s_ease-in-out_infinite]'
        )}
      >
        <IconAI className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
};
