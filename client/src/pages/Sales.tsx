import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/useI18n';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { KeyboardShortcutsOverlay } from '@/components/KeyboardShortcutsOverlay';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { demoProducts } from '@/lib/demoData';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Search, 
  Calculator, 
  CreditCard, 
  Banknote,
  Smartphone,
  Trash2,
  User,
  Check,
  ChevronsUpDown
} from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface Customer {
  id?: number;
  name: string;
  phone: string;
}

function Sales() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { businessConfig } = useBusinessMode();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Fetch customers for search
  const { data: customers = [] } = useQuery({
    queryKey: ['/api/customers'],
    retry: false,
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'mixed'>('cash');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Demo products query with fallback
  const { data: products = demoProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
    retry: false,
    queryFn: async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.log('Using demo products');
      }
      return demoProducts;
    },
  });

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxRate = 18; // GST rate
  const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const addToCart = (product: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { 
                ...item, 
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price 
              }
            : item
        );
      } else {
        return [...prevCart, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          total: product.price
        }];
      }
    });
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id
          ? { 
              ...item, 
              quantity: newQuantity,
              total: newQuantity * item.price 
            }
          : item
      )
    );
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setDiscountPercent(0);
  };

  // Customer Search Component
  function CustomerSearch({ selectedCustomer, onCustomerSelect }: {
    selectedCustomer: Customer | null;
    onCustomerSelect: (customer: Customer | null) => void;
  }) {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const filteredCustomers = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      customer.phone.includes(searchValue)
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCustomer 
              ? `${selectedCustomer.name} (${selectedCustomer.phone})`
              : "Search customer or walk-in..."
            }
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput 
              placeholder="Search customers..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>No customers found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="walk-in"
                  onSelect={() => {
                    onCustomerSelect(null);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selectedCustomer === null ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  Walk-in Customer
                </CommandItem>
                {filteredCustomers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={`${customer.name}-${customer.phone}`}
                    onSelect={() => {
                      onCustomerSelect(customer);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <div className="flex flex-col">
                      <span>{customer.name}</span>
                      <span className="text-xs text-gray-500">{customer.phone}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  const processSale = useMutation({
    mutationFn: async () => {
      const saleData = {
        customerId: selectedCustomer?.id || null,
        subtotal: subtotal.toFixed(2),
        discount: discountAmount.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        total: total.toFixed(2),
        paymentMethod,
        items: cart,
        notes: `${businessConfig?.businessType} sale`
      };

      // Try to save to server, fallback to local storage
      try {
        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saleData)
        });
        
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.log('Server unavailable, saving locally');
      }

      // Save to local storage
      const localSales = JSON.parse(localStorage.getItem('pos_local_sales') || '[]');
      const newSale = {
        ...saleData,
        id: Date.now(),
        invoiceNumber: `INV-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      localSales.push(newSale);
      localStorage.setItem('pos_local_sales', JSON.stringify(localSales));
      
      return newSale;
    },
    onSuccess: (data) => {
      toast({
        title: 'Sale Completed',
        description: `Invoice ${data.invoiceNumber || data.id} - ₹${total.toFixed(2)}`,
      });
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
    },
    onError: () => {
      toast({
        title: 'Sale Failed',
        description: 'Could not process the sale. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSale = () => {
    if (cart.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to cart before proceeding.',
        variant: 'destructive',
      });
      return;
    }
    processSale.mutate();
  };

  useKeyboardShortcuts({
    onHelp: () => setShowShortcuts(true),
    onClearCart: clearCart,
    onPayment: handleSale,
  });

  useKeyboardShortcuts({
    onHelp: () => setShowShortcuts(true),
    onClearCart: clearCart,
    onPayment: handleSale,
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader 
          title={t('menu.newSale')} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Products Section */}
              <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Products
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => addToCart(product)}
                    >
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                      <p className="text-lg font-bold text-blue-600">₹{product.price}</p>
                      <p className="text-xs text-gray-500">{product.sku}</p>
                      {product.stock && (
                        <Badge variant={product.stock < 10 ? 'destructive' : 'secondary'} className="text-xs mt-1">
                          Stock: {product.stock}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {filteredProducts.length === 0 && !productsLoading && (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No products found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

              {/* Cart & Billing Section */}
              <div className="space-y-4">
          
          {/* Customer Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerSearch 
                selectedCustomer={selectedCustomer}
                onCustomerSelect={setSelectedCustomer}
              />
            </CardContent>
          </Card>

          {/* Cart */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Cart ({cart.length})</CardTitle>
                {cart.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="ml-2 text-right">
                        <p className="text-sm font-medium">₹{item.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Summary */}
          {cart.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Bill Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Discount:</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-16 h-8 text-xs"
                      min="0"
                      max="100"
                    />
                    <span className="text-xs">%</span>
                    <span className="text-sm">₹{discountAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <Banknote className="w-4 h-4 mr-1" />
                      Cash
                    </Button>
                    <Button
                      variant={paymentMethod === 'card' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaymentMethod('card')}
                    >
                      <CreditCard className="w-4 h-4 mr-1" />
                      Card
                    </Button>
                    <Button
                      variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaymentMethod('upi')}
                      className="col-span-2"
                    >
                      <Smartphone className="w-4 h-4 mr-1" />
                      UPI
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handleSale} 
                  className="w-full" 
                  size="lg"
                  disabled={processSale.isPending}
                >
                  {processSale.isPending ? 'Processing...' : `Complete Sale - ₹${total.toFixed(2)}`}
                </Button>
              </CardContent>
            </Card>
          )}
              </div>
            </div>
          </div>
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

export default Sales;
