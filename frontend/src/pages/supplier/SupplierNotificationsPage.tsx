import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/http';
import { useI18n } from '../../i18n/I18nProvider';

type Notification = { id_notification: string; title: string; message: string; is_read: boolean; created_at: string };

const SupplierNotificationsPage: React.FC = () => {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest<{ status: string; data: Notification[] }>('/api/v1/notifications').then((result) => active && setNotifications(result.data)).catch((caught) => active && setError(caught instanceof Error ? caught.message : t('error'))).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [t]);

  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-slate-100" />;
  if (error) return <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</section>;

  return (
    <div className="space-y-6">
      <div><p className="text-sm text-blue-700">{t('supplierWorkspace')}</p><h1 className="mt-1 text-2xl font-bold">{t('supplierNotifications')}</h1></div>
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        {notifications.length > 0 ? <ul className="space-y-3">{notifications.map((notification) => <li key={notification.id_notification} className="rounded-lg border p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{notification.title}</h2><p className="mt-1 text-sm text-slate-600">{notification.message}</p></div><span className="text-xs text-slate-400">{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(notification.created_at))}</span></div></li>)}</ul> : <p className="text-sm text-slate-500">{t('noNotifications')}</p>}
      </section>
    </div>
  );
};

export default SupplierNotificationsPage;
