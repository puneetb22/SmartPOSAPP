import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { KeyboardShortcutsOverlay } from '@/components/KeyboardShortcutsOverlay';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function Inventory() {
  const { t } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useKeyboardShortcuts({
    onHelp: () => setShowShortcuts(true),
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader 
          title={t('menu.inventory')} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 p-6 overflow-y-auto">
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

export default Inventory;
