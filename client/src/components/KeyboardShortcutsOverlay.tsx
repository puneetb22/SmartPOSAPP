import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useI18n } from '@/hooks/useI18n';

interface KeyboardShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsOverlay({ isOpen, onClose }: KeyboardShortcutsOverlayProps) {
  const { t } = useI18n();

  const shortcuts = [
    {
      category: t('shortcuts.general'),
      items: [
        { label: t('shortcuts.help'), key: 'F1' },
        { label: t('shortcuts.newSale'), key: 'F2' },
        { label: t('shortcuts.print'), key: 'F3' },
        { label: t('shortcuts.search'), key: 'F4' },
        { label: t('shortcuts.customerDisplay'), key: 'F5' },
      ],
    },
    {
      category: t('shortcuts.sales'),
      items: [
        { label: t('shortcuts.addItem'), key: 'F6' },
        { label: t('shortcuts.removeItem'), key: 'F7' },
        { label: t('shortcuts.discount'), key: 'F8' },
        { label: t('shortcuts.payment'), key: 'F9' },
        { label: t('shortcuts.clearCart'), key: 'F10' },
      ],
    },
    {
      category: t('shortcuts.navigation'),
      items: [
        { label: t('shortcuts.dashboard'), key: 'Alt+D' },
        { label: t('shortcuts.inventory'), key: 'Alt+I' },
        { label: t('shortcuts.reports'), key: 'Alt+R' },
        { label: t('shortcuts.settings'), key: 'Alt+S' },
        { label: t('shortcuts.logout'), key: 'Ctrl+L' },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">
            {t('shortcuts.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shortcuts.map((section) => (
            <div key={section.category} className="space-y-2">
              <h3 className="font-medium text-primary">{section.category}</h3>
              <div className="space-y-1 text-sm">
                {section.items.map((item) => (
                  <div key={item.key} className="flex justify-between">
                    <span>{item.label}</span>
                    <kbd className="bg-gray-200 border border-gray-300 rounded px-2 py-1 text-xs font-mono">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
