import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/useI18n';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { apiRequest } from '@/lib/queryClient';
import { Store, User, Database, Wifi, WifiOff } from 'lucide-react';

const businessConfigSchema = z.object({
  businessType: z.enum(['restaurant', 'pharmacy', 'agri']),
  businessName: z.string().min(1, 'Business name is required'),
  gstin: z.string().optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
});

type BusinessConfigForm = z.infer<typeof businessConfigSchema>;

export default function Settings() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { businessConfig } = useBusinessMode();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('business');

  const form = useForm<BusinessConfigForm>({
    resolver: zodResolver(businessConfigSchema),
    defaultValues: {
      businessType: businessConfig?.businessType as any || 'restaurant',
      businessName: businessConfig?.businessName || '',
      gstin: businessConfig?.gstin || '',
      address: businessConfig?.address || '',
      phone: businessConfig?.phone || '',
      email: businessConfig?.email || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: BusinessConfigForm) => {
      // Try to update via API first
      try {
        if (businessConfig?.id && businessConfig.id !== 'default') {
          await apiRequest('PATCH', `/api/business-config/${businessConfig.id}`, data);
        } else {
          await apiRequest('POST', '/api/business-config', data);
        }
      } catch (error) {
        console.log('API update failed, saving locally');
      }
      
      // Always save to localStorage for offline access
      const updatedConfig = {
        ...businessConfig,
        ...data,
        isConfigured: true,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('pos_business_config', JSON.stringify(updatedConfig));
      return updatedConfig;
    },
    onSuccess: () => {
      toast({
        title: 'Settings Updated',
        description: 'Business configuration has been saved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/business-config'] });
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Could not save settings. Changes saved locally.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: BusinessConfigForm) => {
    updateMutation.mutate(data);
  };

  const clearDemoData = () => {
    localStorage.removeItem('pos_demo_products');
    localStorage.removeItem('pos_demo_initialized');
    localStorage.removeItem('pos_business_config');
    toast({
      title: 'Demo Data Cleared',
      description: 'All demo data has been removed. Please refresh the page.',
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Store className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
        <Badge variant={navigator.onLine ? 'default' : 'secondary'} className="ml-auto">
          {navigator.onLine ? (
            <>
              <Wifi className="w-3 h-3 mr-1" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </>
          )}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business">Business Config</TabsTrigger>
          <TabsTrigger value="user">User Preferences</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="restaurant">Restaurant</SelectItem>
                            <SelectItem value="pharmacy">Pharmacy</SelectItem>
                            <SelectItem value="agri">Agriculture</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your business name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gstin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GSTIN (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="22AAAAA0000A1Z5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter your business address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="business@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <Select defaultValue="en">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                      <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Theme</label>
                  <Select defaultValue="light">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Connection Status:</span>
                  <Badge variant={navigator.onLine ? 'default' : 'secondary'}>
                    {navigator.onLine ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Demo Mode:</span>
                  <Badge variant="outline">
                    {businessConfig?.id === 'default' ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Data Storage:</span>
                  <Badge variant="secondary">Local Storage</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Demo Data Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Remove all demo data and reset the application to initial state.
              </p>
              <Button variant="destructive" onClick={clearDemoData}>
                <Database className="w-4 h-4 mr-2" />
                Clear Demo Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
