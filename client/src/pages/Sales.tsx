import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';

export default function Sales() {
  const { t } = useI18n();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('menu.newSale')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {t('pages.sales.placeholder')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
