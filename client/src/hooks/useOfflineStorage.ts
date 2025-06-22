import { useState, useEffect } from 'react';

interface SyncStatus {
  lastSync: string | null;
  pendingSyncs: number;
  isOnline: boolean;
}

export function useOfflineStorage() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: localStorage.getItem('pos_last_sync'),
    pendingSyncs: parseInt(localStorage.getItem('pos_pending_syncs') || '0'),
    isOnline: navigator.onLine,
  });

  // Initialize demo data if not exists
  useEffect(() => {
    if (!localStorage.getItem('pos_demo_initialized')) {
      const demoProducts = [
        { id: 1, name: 'Demo Product 1', price: 100, stock: 50 },
        { id: 2, name: 'Demo Product 2', price: 250, stock: 30 },
        { id: 3, name: 'Demo Product 3', price: 150, stock: 25 }
      ];
      localStorage.setItem('pos_demo_products', JSON.stringify(demoProducts));
      localStorage.setItem('pos_demo_initialized', 'true');
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      // Auto-sync when coming online
      if (syncStatus.pendingSyncs > 0) {
        triggerSync();
      }
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncStatus.pendingSyncs]);

  const addPendingSync = (data: any) => {
    const pendingData = JSON.parse(localStorage.getItem('pos_pending_data') || '[]');
    pendingData.push({
      id: Date.now(),
      data,
      timestamp: new Date().toISOString(),
    });
    
    localStorage.setItem('pos_pending_data', JSON.stringify(pendingData));
    localStorage.setItem('pos_pending_syncs', (syncStatus.pendingSyncs + 1).toString());
    
    setSyncStatus(prev => ({
      ...prev,
      pendingSyncs: prev.pendingSyncs + 1,
    }));
  };

  const triggerSync = async () => {
    if (!syncStatus.isOnline) return;

    try {
      const pendingData = JSON.parse(localStorage.getItem('pos_pending_data') || '[]');
      
      // Here you would sync with server when online
      // For now, we'll just clear the pending data
      localStorage.setItem('pos_pending_data', '[]');
      localStorage.setItem('pos_pending_syncs', '0');
      localStorage.setItem('pos_last_sync', new Date().toISOString());
      
      setSyncStatus(prev => ({
        ...prev,
        pendingSyncs: 0,
        lastSync: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return {
    syncStatus,
    addPendingSync,
    triggerSync,
  };
}