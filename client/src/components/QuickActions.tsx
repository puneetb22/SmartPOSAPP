import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { Link } from 'wouter';
import { ShoppingCart, Plus, Search, Stethoscope, Users, Package } from 'lucide-react';

export function QuickActions() {
  const { t } = useI18n();
  const { businessMode } = useBusinessMode();

  const getQuickActions = () => {
    const commonActions = [
      {
        icon: ShoppingCart,
        label: t('actions.newSale'),
        path: '/sales',
        shortcut: 'F2',
        color: 'text-blue-600',
      },
      {
        icon: Plus,
        label: t('actions.addProduct'),
        path: '/inventory/add',
        shortcut: 'F6',
        color: 'text-green-600',
      },
      {
        icon: Search,
        label: t('actions.search'),
        path: '/search',
        shortcut: 'F4',
        color: 'text-purple-600',
      },
    ];

    switch (businessMode) {
      case 'pharmacy':
        return [
          ...commonActions,
          {
            icon: Stethoscope,
            label: t('actions.prescription'),
            path: '/prescriptions',
            shortcut: 'Ctrl+P',
            color: 'text-red-600',
          },
        ];
      case 'restaurant':
        return [
          ...commonActions,
          {
            icon: Users,
            label: t('actions.newOrder'),
            path: '/orders',
            shortcut: 'Ctrl+O',
            color: 'text-orange-600',
          },
        ];
      case 'agri':
        return [
          ...commonActions,
          {
            icon: Package,
            label: t('actions.bulkEntry'),
            path: '/bulk-entry',
            shortcut: 'Ctrl+B',
            color: 'text-lime-600',
          },
        ];
      default:
        return commonActions;
    }
  };

  const actions = getQuickActions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.quickActions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            
            return (
              <Link key={action.path} href={action.path}>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50"
                >
                  <Icon className={`w-8 h-8 ${action.color}`} />
                  <div className="text-center">
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-xs text-gray-500 font-mono">{action.shortcut}</p>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
