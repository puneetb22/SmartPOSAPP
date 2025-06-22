import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';

export default function Inventory() {
  const { t } = useI18n();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('menu.inventory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {t('pages.inventory.placeholder')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
