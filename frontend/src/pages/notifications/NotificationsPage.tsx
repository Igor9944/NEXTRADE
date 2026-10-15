import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/http';
import { useI18n } from '../../i18n/I18nProvider';
import {
  PageHeader,
  Card,
  CardContent,
  Badge,
  EmptyState,
} from '../../components/ui';
import { formatRelativeDate, formatStatus } from '../../lib/format';

type NotificationRow = {
  id_notification: string;
  event_type: string;
  aggregate_id: string;
  channel: string;
  recipient: string;
  status: string;
  created_at: string;
};

function notifBadgeVariant(status: string): 'success' | 'info' | 'warning' | 'neutral' {
  if (status === 'SENT') return 'success';
  if (status === 'PENDING') return 'warning';
  if (status === 'FAILED') return 'neutral';
  return 'info';
}

const NotificationsPage: React.FC = () => {
  const { t } = useI18n();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ status: string; data: { notifications: NotificationRow[] } }>(
      '/api/v1/notifications'
    )
      .then((result) => setItems(result.data.notifications || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl3 bg-slate-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('navNotifications')} />

      {error && <EmptyState variant="error" title="Erreur" description={error} />}

      {!error && items.length === 0 && (
        <EmptyState variant="empty" title={t('noNotifications')} />
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id_notification}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-nextrade-ink">
                      {formatStatus(item.event_type)}
                    </p>
                    <Badge variant={notifBadgeVariant(item.status)}>
                      {formatStatus(item.status)}
                    </Badge>
                    <Badge variant="neutral">{item.channel}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-nextrade-muted">
                    {t('order')}: <span className="font-mono text-xs">{item.aggregate_id.slice(0, 8)}…</span>
                  </p>
                  <p className="text-xs text-nextrade-muted">{item.recipient}</p>
                </div>
                <time
                  dateTime={item.created_at}
                  className="shrink-0 text-xs text-nextrade-muted"
                >
                  {formatRelativeDate(item.created_at)}
                </time>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
