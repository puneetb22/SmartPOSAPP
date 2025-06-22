import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/hooks/useI18n';

export function TopSellingProducts() {
  const { t } = useI18n();

  const { data: topProducts, isLoading } = useQuery({
    queryKey: ['/api/stats/top-products', { limit: 5 }],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.topSellingProducts')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between py-2">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.topSellingProducts')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="pb-2 text-sm font-medium text-gray-600">
                  {t('product.name')}
                </th>
                <th className="pb-2 text-sm font-medium text-gray-600">
                  {t('stats.sales')}
                </th>
                <th className="pb-2 text-sm font-medium text-gray-600">
                  {t('stats.revenue')}
                </th>
              </tr>
            </thead>
            <tbody>
              {topProducts?.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-500">
                    {t('dashboard.noSalesData')}
                  </td>
                </tr>
              ) : (
                topProducts?.map((item) => (
                  <tr key={item.product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3">
                      <div>
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-gray-600">{item.product.manufacturer}</p>
                      </div>
                    </td>
                    <td className="py-3 text-sm">
                      {item.sales} {item.product.unitOfMeasure}
                    </td>
                    <td className="py-3 text-sm font-medium">
                      ₹{item.revenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
