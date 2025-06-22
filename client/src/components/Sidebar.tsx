import { Link, useLocation } from 'wouter';
import { useOffline } from '@/contexts/OfflineContext';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Stethoscope, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu
} from 'lucide-react';
import type { Language } from '@/lib/translations';

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useOffline();
  const { businessMode } = useBusinessMode();
  const { language, setLanguage, t } = useI18n();

  const menuItems = [
    { icon: LayoutDashboard, label: t('menu.dashboard'), path: '/', shortcut: 'Alt+D' },
    { icon: ShoppingCart, label: t('menu.newSale'), path: '/sales', shortcut: 'F2' },
    { icon: Package, label: t('menu.inventory'), path: '/inventory', shortcut: 'Alt+I' },
    { icon: Users, label: t('menu.customers'), path: '/customers' },
    ...(businessMode === 'pharmacy' ? [
      { icon: Stethoscope, label: t('menu.prescriptions'), path: '/prescriptions' }
    ] : []),
    { icon: BarChart3, label: t('menu.reports'), path: '/reports', shortcut: 'Alt+R' },
    { icon: Settings, label: t('menu.settings'), path: '/settings', shortcut: 'Alt+S' },
  ];

  const getModeColor = (mode: string | null) => {
    switch (mode) {
      case 'restaurant': return 'border-l-4 border-l-orange-500';
      case 'pharmacy': return 'border-l-4 border-l-green-500';
      case 'agri': return 'border-l-4 border-l-lime-500';
      default: return 'border-l-4 border-l-blue-500';
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <div className={`
      w-60 bg-white shadow-lg flex flex-col transition-transform duration-300
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0 fixed md:relative h-full z-40
    `}>
      {/* Business Mode Header */}
      <div className={`p-4 bg-primary text-white ${getModeColor(businessMode)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-medium text-lg">{t('app.title')}</h1>
            <p className="text-sm opacity-90">
              {businessMode ? t(`businessMode.${businessMode}`) : t('businessMode.notConfigured')}
            </p>
          </div>
          
          {/* Language Switcher */}
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-16 bg-primary-dark text-white border-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="hi">हि</SelectItem>
              <SelectItem value="mr">मर</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage 
              src="" 
              alt={user?.name || 'User'} 
              className="object-cover"
            />
            <AvatarFallback>
              {user?.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-600">
              {user?.role ? t(`role.${user.role}`) : t('role.unknown')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <a className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                    {item.shortcut && (
                      <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded font-mono">
                        {item.shortcut}
                      </span>
                    )}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('actions.logout')}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}
    </div>
  );
}
