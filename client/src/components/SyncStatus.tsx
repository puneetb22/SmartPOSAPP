import { useOffline } from '@/contexts/OfflineContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';

export function SyncStatus() {
  const { syncStatus, triggerSync } = useOffline();

  return (
    <div className="flex items-center gap-2">
      {syncStatus.isOnline ? (
        <Badge variant="outline" className="text-green-600 border-green-200">
          <Wifi className="w-3 h-3 mr-1" />
          Online
        </Badge>
      ) : (
        <Badge variant="outline" className="text-orange-600 border-orange-200">
          <WifiOff className="w-3 h-3 mr-1" />
          Offline
        </Badge>
      )}

      {syncStatus.pendingSyncs > 0 && (
        <Badge variant="secondary">
          {syncStatus.pendingSyncs} pending
        </Badge>
      )}

      {syncStatus.isOnline && syncStatus.pendingSyncs > 0 && (
        <Button
          size="sm"
          variant="outline"
          onClick={triggerSync}
          className="h-6 px-2"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Sync
        </Button>
      )}

      {syncStatus.lastSync && (
        <span className="text-xs text-gray-500 flex items-center">
          <CheckCircle className="w-3 h-3 mr-1" />
          Last: {new Date(syncStatus.lastSync).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}