import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/hooks/useI18n';
import { CheckCircle, AlertTriangle, Package } from 'lucide-react';

export function RecentActivity() {
  const { t } = useI18n();

  const { data: sales, isLoading } = useQuery({
    queryKey: ['/api/sales', { limit: 5 }],
  });

  const { data: lowStockProducts } = useQuery({
    queryKey: ['/api/products/low-stock'],
  });

  // Combine different types of activities
  const activities = [];

  // Add recent sales
  if (sales) {
    sales.slice(0, 3).forEach(sale => {
      activities.push({
        id: `sale-${sale.id}`,
        type: 'sale',
        icon: CheckCircle,
        iconColor: 'text-green-600 bg-green-100',
        title: `${t('activity.sale')} #${sale.invoiceNumber}`,
        description: `₹${sale.total}`,
        time: new Date(sale.createdAt).toLocaleTimeString('en-IN', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        }),
      });
    });
  }

  // Add low stock alerts
  if (lowStockProducts?.length > 0) {
    activities.push({
      id: 'low-stock-alert',
      type: 'alert',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600 bg-yellow-100',
      title: t('activity.lowStockAlert'),
      description: t('activity.lowStockCount', { count: lowStockProducts.length }),
      time: new Date().toLocaleTimeString('en-IN', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      }),
    });
  }

  // Sort activities by time (mock for now, in real app would use timestamps)
  activities.sort((a, b) => b.time.localeCompare(a.time));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-3 w-12" />
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
        <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>{t('dashboard.noRecentActivity')}</p>
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = activity.icon;
              
              return (
                <div
                  key={activity.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              );
            })
          )}
        </div>
        
        {activities.length > 0 && (
          <Button variant="ghost" className="w-full mt-4">
            {t('dashboard.viewAllActivity')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
