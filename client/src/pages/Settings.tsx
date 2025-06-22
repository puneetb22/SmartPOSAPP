import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';

export default function Settings() {
  const { t } = useI18n();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('menu.settings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {t('pages.settings.placeholder')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
