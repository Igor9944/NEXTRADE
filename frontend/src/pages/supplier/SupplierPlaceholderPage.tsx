import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { PageHeader, Card, CardContent, Badge, Button } from '../../components/ui';

const SupplierPlaceholderPage: React.FC<{
  titleKey: string;
  descriptionKey: string;
}> = ({ titleKey, descriptionKey }) => {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader
        title={t(titleKey)}
        description={t('supplierWorkspace')}
      />
      <Card className="max-w-xl">
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-nextrade-ice text-3xl">
            🔧
          </div>
          <div className="mb-2">
            <Badge variant="info">Bientôt disponible</Badge>
          </div>
          <p className="mt-3 max-w-xs mx-auto text-sm leading-6 text-nextrade-muted">
            {t(descriptionKey)}
          </p>
          <Button
            variant="outline"
            as={Link}
            to="/supplier/dashboard"
            className="mt-6"
          >
            {t('supplierBackToDashboard')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierPlaceholderPage;
