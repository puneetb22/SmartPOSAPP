import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface ShortcutHandlers {
  onHelp?: () => void;
  onNewSale?: () => void;
  onPrint?: () => void;
  onSearch?: () => void;
  onCustomerDisplay?: () => void;
  onAddItem?: () => void;
  onRemoveItem?: () => void;
  onDiscount?: () => void;
  onPayment?: () => void;
  onClearCart?: () => void;
  onDashboard?: () => void;
  onInventory?: () => void;
  onReports?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          handlers.onHelp?.();
          break;
        case 'F2':
          e.preventDefault();
          handlers.onNewSale?.() || setLocation('/sales');
          break;
        case 'F3':
          e.preventDefault();
          handlers.onPrint?.();
          break;
        case 'F4':
          e.preventDefault();
          handlers.onSearch?.();
          break;
        case 'F5':
          e.preventDefault();
          handlers.onCustomerDisplay?.();
          break;
        case 'F6':
          e.preventDefault();
          handlers.onAddItem?.();
          break;
        case 'F7':
          e.preventDefault();
          handlers.onRemoveItem?.();
          break;
        case 'F8':
          e.preventDefault();
          handlers.onDiscount?.();
          break;
        case 'F9':
          e.preventDefault();
          handlers.onPayment?.();
          break;
        case 'F10':
          e.preventDefault();
          handlers.onClearCart?.();
          break;
      }

      // Alt + key combinations
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault();
            handlers.onDashboard?.() || setLocation('/');
            break;
          case 'i':
            e.preventDefault();
            handlers.onInventory?.() || setLocation('/inventory');
            break;
          case 'r':
            e.preventDefault();
            handlers.onReports?.() || setLocation('/reports');
            break;
          case 's':
            e.preventDefault();
            handlers.onSettings?.() || setLocation('/settings');
            break;
        }
      }

      // Ctrl + key combinations
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'l':
            e.preventDefault();
            handlers.onLogout?.() || (window.location.href = '/api/logout');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers, setLocation]);
}
