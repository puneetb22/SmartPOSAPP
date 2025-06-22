import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/useI18n';
import { apiRequest } from '@/lib/queryClient';
import { Store, Utensils, Stethoscope, Wheat } from 'lucide-react';

const businessConfigSchema = z.object({
  businessType: z.enum(['restaurant', 'pharmacy', 'agri']),
  businessName: z.string().min(1, 'Business name is required'),
  gstin: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required').optional(),
});

type BusinessConfigForm = z.infer<typeof businessConfigSchema>;

export default function BusinessSetup() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string>('');

  const form = useForm<BusinessConfigForm>({
    resolver: zodResolver(businessConfigSchema),
    defaultValues: {
      businessName: '',
      gstin: '',
      address: '',
      phone: '',
      email: '',
    },
  });

  const setupMutation = useMutation({
    mutationFn: async (data: BusinessConfigForm) => {
      const response = await apiRequest('POST', '/api/business-config', data);
      // Also save to localStorage for offline access
      localStorage.setItem('pos_business_config', JSON.stringify(response));
      return response;
    },
    onSuccess: () => {
      toast({
        title: t('setup.success.title'),
        description: t('setup.success.description'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/business-config'] });
      setLocation('/');
    },
    onError: (error) => {
      toast({
        title: t('setup.error.title'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const businessTypes = [
    {
      value: 'restaurant',
      label: t('businessMode.restaurant'),
      icon: Utensils,
      description: t('setup.types.restaurant.description'),
      features: [
        t('setup.types.restaurant.feature1'),
        t('setup.types.restaurant.feature2'),
        t('setup.types.restaurant.feature3'),
      ],
    },
    {
      value: 'pharmacy',
      label: t('businessMode.pharmacy'),
      icon: Stethoscope,
      description: t('setup.types.pharmacy.description'),
      features: [
        t('setup.types.pharmacy.feature1'),
        t('setup.types.pharmacy.feature2'),
        t('setup.types.pharmacy.feature3'),
      ],
    },
    {
      value: 'agri',
      label: t('businessMode.agri'),
      icon: Wheat,
      description: t('setup.types.agri.description'),
      features: [
        t('setup.types.agri.feature1'),
        t('setup.types.agri.feature2'),
        t('setup.types.agri.feature3'),
      ],
    },
  ];

  const onSubmit = (data: BusinessConfigForm) => {
    setupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <Store className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h1 className="text-3xl font-bold mb-2">{t('setup.title')}</h1>
          <p className="text-gray-600">{t('setup.subtitle')}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Business Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>{t('setup.businessType')}</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid md:grid-cols-3 gap-4">
                          {businessTypes.map((type) => {
                            const Icon = type.icon;
                            const isSelected = field.value === type.value;
                            
                            return (
                              <div
                                key={type.value}
                                className={`
                                  p-4 border-2 rounded-lg cursor-pointer transition-colors
                                  ${isSelected 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                  }
                                `}
                                onClick={() => {
                                  field.onChange(type.value);
                                  setSelectedType(type.value);
                                }}
                              >
                                <div className="text-center">
                                  <Icon className={`w-12 h-12 mx-auto mb-2 ${
                                    isSelected ? 'text-blue-600' : 'text-gray-400'
                                  }`} />
                                  <h3 className="font-semibold mb-2">{type.label}</h3>
                                  <p className="text-sm text-gray-600 mb-3">
                                    {type.description}
                                  </p>
                                  <ul className="text-xs text-gray-500 space-y-1">
                                    {type.features.map((feature, index) => (
                                      <li key={index}>• {feature}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Business Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t('setup.businessDetails')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('setup.fields.businessName')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gstin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('setup.fields.gstin')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="22AAAAA0000A1Z5" />
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
                      <FormLabel>{t('setup.fields.address')}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('setup.fields.phone')}</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" />
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
                        <FormLabel>{t('setup.fields.email')}</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                size="lg" 
                disabled={setupMutation.isPending}
                className="px-8"
              >
                {setupMutation.isPending ? t('setup.saving') : t('setup.complete')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
