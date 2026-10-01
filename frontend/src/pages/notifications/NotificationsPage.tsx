import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/http';
import { useI18n } from '../../i18n/I18nProvider';

type NotificationRow = {
  id_notification: string;
  event_type: string;
  aggregate_id: string;
  channel: string;
  recipient: string;
  status: string;
  created_at: string;
};

const NotificationsPage: React.FC = () => {
  const { t } = useI18n();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<{ status: string; data: { notifications: NotificationRow[] } }>('/api/v1/notifications')
      .then((result) => setItems(result.data.notifications || []))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h1 className="text-xl font-bold mb-4">{t('navNotifications')}</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      {items.length === 0 && !error && <p className="text-sm text-gray-600">{t('noNotifications')}</p>}
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id_notification} className="border rounded p-3">
            <p className="font-medium">{item.event_type} — {item.status}</p>
            <p>{t('order')}: {item.aggregate_id}</p>
            <p>{item.channel} · {item.recipient}</p>
            <p className="text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPage;
