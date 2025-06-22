import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/hooks/useI18n';
import { useOffline } from '@/contexts/OfflineContext';
import { Menu, Plus, Tv, Bell, Clock, Calendar, User, LogOut } from 'lucide-react';
import { SyncStatus } from '@/components/SyncStatus';
import { Link } from 'wouter';

interface TopHeaderProps {
  title: string;
  onMenuToggle?: () => void;
}

export function TopHeader({ title, onMenuToggle }: TopHeaderProps) {
  const { t } = useI18n();
  const { user, logout } = useOffline();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <h2 className="text-xl font-medium text-gray-900">{title}</h2>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="material-icons text-sm">access_time</span>
          <span>{formatDateTime(currentTime)}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Quick Sale Button */}
        <Link href="/sales">
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            {t('actions.quickSale')}
          </Button>
        </Link>
        
        {/* Customer Display Toggle */}
        <Button variant="ghost" size="sm">
          <Tv className="w-5 h-5" />
        </Button>
        
        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="sm">
            <Bell className="w-5 h-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>
        </div>
      </div>
    </header>
  );
}
