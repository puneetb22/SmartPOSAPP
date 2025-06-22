import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { KeyboardShortcutsOverlay } from '@/components/KeyboardShortcutsOverlay';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useLocation } from 'wouter';
import { Stethoscope } from 'lucide-react';

function Prescriptions() {
  const { t } = useI18n();
  const { businessMode } = useBusinessMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [, setLocation] = useLocation();

  useKeyboardShortcuts({
    onHelp: () => setShowShortcuts(true),
  });

  // Redirect if not pharmacy mode
  if (businessMode !== 'pharmacy') {
    setLocation('/dashboard');
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader 
          title={t('menu.prescriptions')} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                {t('menu.prescriptions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Prescription management system for pharmacy operations. This feature allows you to:
              </p>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>• Record and manage customer prescriptions</li>
                <li>• Track medication dispensing</li>
                <li>• Monitor prescription history</li>
                <li>• Generate prescription reports</li>
                <li>• Handle controlled substances tracking</li>
              </ul>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This feature is only available for pharmacy business mode and includes compliance features for medication management.
                </p>
              </div>
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

export default Prescriptions;