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
import { formatRelativeDate } from '../../lib/format';

type Notification = {
  id_notification: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

const SupplierNotificationsPage: React.FC = () => {
  const { t } = useI18n();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiRequest<{ status: string; data: Notification[] }>('/api/v1/notifications')
      .then((result) => { if (active) setItems(result.data); })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : t('error')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [t]);

  if (loading) return <div className="h-64 animate-pulse rounded-xl3 bg-slate-200" />;
  if (error) return <EmptyState variant="error" title={t('error')} description={error} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('supplierNotifications')}
        description={t('supplierWorkspace')}
      />

      {items.length === 0 ? (
        <EmptyState variant="empty" title={t('noNotifications')} />
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <Card
              key={n.id_notification}
              className={n.is_read ? '' : 'border-nextrade-blue/20 bg-nextrade-ice/50'}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-nextrade-ink">{n.title}</p>
                      {!n.is_read && (
                        <Badge variant="info">Nouveau</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-nextrade-muted">{n.message}</p>
                  </div>
                  <time
                    dateTime={n.created_at}
                    className="shrink-0 text-xs text-nextrade-muted"
                  >
                    {formatRelativeDate(n.created_at)}
                  </time>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierNotificationsPage;
