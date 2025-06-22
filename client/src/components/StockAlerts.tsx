import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/hooks/useI18n';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { AlertTriangle, Clock, Package } from 'lucide-react';

export function StockAlerts() {
  const { t } = useI18n();
  const { businessMode } = useBusinessMode();

  const { data: lowStockProducts, isLoading: lowStockLoading } = useQuery({
    queryKey: ['/api/products/low-stock'],
  });

  const { data: expiringProducts, isLoading: expiringLoading } = useQuery({
    queryKey: ['/api/stock/expiring', { days: 30 }],
    enabled: businessMode === 'pharmacy' || businessMode === 'agri',
  });

  const isLoading = lowStockLoading || expiringLoading;

  const alerts = [];

  // Add low stock alerts
  if (lowStockProducts) {
    lowStockProducts.slice(0, 3).forEach(product => {
      alerts.push({
        id: `low-stock-${product.id}`,
        type: 'low-stock',
        icon: AlertTriangle,
        severity: 'error',
        title: t('alerts.lowStock'),
        description: `${product.name} - ${t('alerts.unitsLeft', { count: 0 })}`,
        action: t('actions.reorder'),
        actionType: 'reorder',
        productId: product.id,
      });
    });
  }

  // Add expiring products alerts for pharmacy/agri
  if (expiringProducts && (businessMode === 'pharmacy' || businessMode === 'agri')) {
    expiringProducts.slice(0, 2).forEach(batch => {
      alerts.push({
        id: `expiring-${batch.id}`,
        type: 'expiring',
        icon: Clock,
        severity: 'warning',
        title: t('alerts.expiringSoon'),
        description: `${batch.productId} - ${t('alerts.expiresInDays', { 
          days: Math.ceil((new Date(batch.expiryDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        })}`,
        action: t('actions.markSale'),
        actionType: 'sale',
        batchId: batch.id,
      });
    });
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.stockAlerts')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-6 h-6" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16" />
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
        <CardTitle>{t('dashboard.stockAlerts')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>{t('dashboard.noAlerts')}</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const Icon = alert.icon;
              const severityClasses = {
                error: 'bg-red-50 border-red-200 text-red-800',
                warning: 'bg-orange-50 border-orange-200 text-orange-800',
              };
              const buttonClasses = {
                error: 'bg-red-600 hover:bg-red-700',
                warning: 'bg-orange-600 hover:bg-orange-700',
              };
              
              return (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 border rounded-lg ${severityClasses[alert.severity]}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <div>
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs opacity-80">{alert.description}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className={`text-white ${buttonClasses[alert.severity]}`}
                  >
                    {alert.action}
                  </Button>
                </div>
              );
            })
          )}
        </div>
        
        {alerts.length > 0 && (
          <Button variant="ghost" className="w-full mt-4">
            {t('dashboard.viewAllAlerts')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
