import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/useI18n';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { KeyboardShortcutsOverlay } from '@/components/KeyboardShortcutsOverlay';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Phone, 
  Mail,
  MapPin,
  Calendar,
  IndianRupee,
  TrendingUp
} from 'lucide-react';

const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  address: z.string().optional(),
  gstin: z.string().optional(),
  creditLimit: z.number().min(0, 'Credit limit must be positive').optional(),
});

type CustomerForm = z.infer<typeof customerSchema>;

function Customers() {
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Fetch customers
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['/api/customers'],
    retry: false,
  });

  const customerForm = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      gstin: '',
      creditLimit: 0,
    },
  });

  const addCustomerMutation = useMutation({
    mutationFn: async (data: CustomerForm) => {
      try {
        return await apiRequest('POST', '/api/customers', data);
      } catch (error) {
        // Fallback to local storage
        const localCustomers = JSON.parse(localStorage.getItem('pos_customers') || '[]');
        const newCustomer = { 
          ...data, 
          id: Date.now(), 
          createdAt: new Date().toISOString(),
          totalSales: 0,
          totalOrders: 0,
          lastOrderDate: null,
        };
        localCustomers.push(newCustomer);
        localStorage.setItem('pos_customers', JSON.stringify(localCustomers));
        return newCustomer;
      }
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Customer added successfully' });
      customerForm.reset();
      setShowAddCustomer(false);
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add customer', variant: 'destructive' });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CustomerForm> }) => {
      try {
        return await apiRequest('PATCH', `/api/customers/${id}`, data);
      } catch (error) {
        // Fallback to local storage
        const localCustomers = JSON.parse(localStorage.getItem('pos_customers') || '[]');
        const customerIndex = localCustomers.findIndex((c: any) => c.id === id);
        if (customerIndex !== -1) {
          localCustomers[customerIndex] = { ...localCustomers[customerIndex], ...data };
          localStorage.setItem('pos_customers', JSON.stringify(localCustomers));
          return localCustomers[customerIndex];
        }
        throw new Error('Customer not found');
      }
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Customer updated successfully' });
      setSelectedCustomer(null);
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update customer', variant: 'destructive' });
    },
  });

  const filteredCustomers = customers.filter((customer: any) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const onSubmitCustomer = (data: CustomerForm) => {
    if (selectedCustomer) {
      updateCustomerMutation.mutate({ id: selectedCustomer.id, data });
    } else {
      addCustomerMutation.mutate(data);
    }
  };

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    customerForm.reset({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      gstin: customer.gstin || '',
      creditLimit: customer.creditLimit || 0,
    });
    setShowAddCustomer(true);
  };

  useKeyboardShortcuts({
    onHelp: () => setShowShortcuts(true),
  });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c: any) => c.totalOrders > 0).length;
  const totalSalesValue = customers.reduce((sum: number, c: any) => sum + (c.totalSales || 0), 0);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader 
          title="Customer Management" 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <Tabs defaultValue="customers" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Customers Tab */}
            <TabsContent value="customers" className="space-y-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Customers</p>
                        <p className="text-2xl font-bold">{totalCustomers}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Customers</p>
                        <p className="text-2xl font-bold">{activeCustomers}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Sales Value</p>
                        <p className="text-2xl font-bold">₹{totalSalesValue.toFixed(2)}</p>
                      </div>
                      <IndianRupee className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center justify-between">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Dialog open={showAddCustomer} onOpenChange={(open) => {
                  setShowAddCustomer(open);
                  if (!open) {
                    setSelectedCustomer(null);
                    customerForm.reset();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Customer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...customerForm}>
                      <form onSubmit={customerForm.handleSubmit(onSubmitCustomer)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={customerForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Customer Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={customerForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={customerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email (Optional)</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={customerForm.control}
                            name="gstin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>GSTIN (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={customerForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={customerForm.control}
                          name="creditLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Credit Limit (Optional)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setShowAddCustomer(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={addCustomerMutation.isPending || updateCustomerMutation.isPending}>
                            {(addCustomerMutation.isPending || updateCustomerMutation.isPending) ? 'Saving...' : selectedCustomer ? 'Update Customer' : 'Add Customer'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Customers ({filteredCustomers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customersLoading ? (
                    <div className="text-center py-8">Loading customers...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Total Sales</TableHead>
                          <TableHead>Last Order</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((customer: any) => (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{customer.name}</div>
                                {customer.gstin && (
                                  <div className="text-sm text-gray-500">GSTIN: {customer.gstin}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <span className="text-sm">{customer.phone}</span>
                                </div>
                                {customer.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    <span className="text-sm">{customer.email}</span>
                                  </div>
                                )}
                                {customer.address && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span className="text-sm text-gray-500">{customer.address}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {customer.totalOrders || 0} orders
                              </Badge>
                            </TableCell>
                            <TableCell>₹{(customer.totalSales || 0).toFixed(2)}</TableCell>
                            <TableCell>
                              {customer.lastOrderDate ? (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span className="text-sm">
                                    {new Date(customer.lastOrderDate).toLocaleDateString()}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-500">Never</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCustomer(customer)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Customer analytics and insights will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Customer reports and detailed analysis will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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

export default Customers;