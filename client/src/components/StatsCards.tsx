import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/hooks/useI18n';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { IndianRupee, Receipt, AlertTriangle, Clock } from 'lucide-react';

export function StatsCards() {
  const { t } = useI18n();
  const { businessMode } = useBusinessMode();

  const { data: todaysStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats/today'],
  });

  const { data: lowStockProducts, isLoading: lowStockLoading } = useQuery({
    queryKey: ['/api/products/low-stock'],
  });

  const { data: expiringProducts, isLoading: expiringLoading } = useQuery({
    queryKey: ['/api/stock/expiring', { days: 30 }],
  });

  const stats = [
    {
      title: t('stats.todaysSales'),
      value: statsLoading ? '...' : `₹${todaysStats?.total?.toLocaleString('en-IN') || '0'}`,
      change: '+12.5% from yesterday',
      icon: IndianRupee,
      color: 'bg-blue-500',
    },
    {
      title: t('stats.transactions'),
      value: statsLoading ? '...' : String(todaysStats?.count || 0),
      change: '+8 from yesterday',
      icon: Receipt,
      color: 'bg-orange-500',
    },
    {
      title: t('stats.lowStock'),
      value: lowStockLoading ? '...' : String(lowStockProducts?.length || 0),
      change: t('stats.needsAttention'),
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      variant: 'warning' as const,
    },
  ];

  // Add expiring products stat for pharmacy mode
  if (businessMode === 'pharmacy') {
    stats.push({
      title: t('stats.expiringSoon'),
      value: expiringLoading ? '...' : String(expiringProducts?.length || 0),
      change: t('stats.next30Days'),
      icon: Clock,
      color: 'bg-red-500',
      variant: 'error' as const,
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  {statsLoading || lowStockLoading || expiringLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className={`text-2xl font-bold mt-1 ${
                      stat.variant === 'warning' ? 'text-yellow-600' :
                      stat.variant === 'error' ? 'text-red-600' :
                      'text-gray-900'
                    }`}>
                      {stat.value}
                    </p>
                  )}
                  <p className={`text-sm mt-1 ${
                    stat.variant === 'warning' ? 'text-yellow-600' :
                    stat.variant === 'error' ? 'text-red-600' :
                    'text-green-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
