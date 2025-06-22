import { useState } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsOverlay } from '@/components/KeyboardShortcutsOverlay';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { StatsCards } from '@/components/StatsCards';
import { QuickActions } from '@/components/QuickActions';
import { RecentActivity } from '@/components/RecentActivity';
import { TopSellingProducts } from '@/components/TopSellingProducts';
import { StockAlerts } from '@/components/StockAlerts';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { useI18n } from '@/hooks/useI18n';

export default function Dashboard() {
  const { t } = useI18n();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useKeyboardShortcuts({
    onHelp: () => setShowShortcuts(true),
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader 
          title={t('menu.dashboard')} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Stats Cards */}
          <div className="mb-6">
            <StatsCards />
          </div>

          {/* Quick Actions and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <QuickActions />
            <RecentActivity />
          </div>

          {/* Top Selling Products and Stock Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopSellingProducts />
            <StockAlerts />
          </div>
        </main>
      </div>

      <FloatingActionButton />
      
      <KeyboardShortcutsOverlay 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
    </div>
  );
}
