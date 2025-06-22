import { useState } from 'react';
import { useOffline } from '@/contexts/OfflineContext';
import { useI18n } from '@/hooks/useI18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OfflineLogin() {
  const { login } = useOffline();
  const { t } = useI18n();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'cashier' | 'waiter' | 'kitchen'>('admin');

  const handleLogin = () => {
    if (userName.trim()) {
      login(userName.trim(), userRole);
    }
  };

  const handleQuickLogin = (name: string, role: 'admin' | 'cashier' | 'waiter' | 'kitchen') => {
    login(name, role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('app.title')}</h1>
          <p className="mt-2 text-gray-600">Offline Mode - Start Using Immediately</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>
              Choose your role to begin using the POS system offline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleQuickLogin('Admin', 'admin')}
                className="h-16 p-3"
              >
                <div className="text-center">
                  <div className="font-semibold">Admin</div>
                  <div className="text-xs text-gray-500">Full Access</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleQuickLogin('Cashier', 'cashier')}
                className="h-16 p-3"
              >
                <div className="text-center">
                  <div className="font-semibold">Cashier</div>
                  <div className="text-xs text-gray-500">Sales & Billing</div>
                </div>
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or customize</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="userName">Your Name</Label>
                <Input
                  id="userName"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <div>
                <Label htmlFor="userRole">Role</Label>
                <Select value={userRole} onValueChange={(value: any) => setUserRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="waiter">Waiter</SelectItem>
                    <SelectItem value="kitchen">Kitchen Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleLogin} 
                className="w-full"
                disabled={!userName.trim()}
              >
                Start Using POS
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>✓ Works completely offline</p>
          <p>✓ Data syncs when connected</p>
          <p>✓ No internet required to start</p>
        </div>
      </div>
    </div>
  );
}