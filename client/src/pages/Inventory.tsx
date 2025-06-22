import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/useI18n';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { KeyboardShortcutsOverlay } from '@/components/KeyboardShortcutsOverlay';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { apiRequest } from '@/lib/queryClient';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  TrendingDown,
  Calendar,
  BarChart3
} from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.number().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  costPrice: z.number().min(0, 'Cost price must be positive'),
  stock: z.number().min(0, 'Stock must be positive'),
  minStock: z.number().min(0, 'Minimum stock must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  description: z.string().optional(),
});

const stockBatchSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1, 'Quantity is required'),
  costPrice: z.number().min(0, 'Cost price must be positive'),
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;
type StockBatchForm = z.infer<typeof stockBatchSchema>;

function Inventory() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { businessConfig } = useBusinessMode();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
    retry: false,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    retry: false,
  });

  // Fetch low stock products
  const { data: lowStockProducts = [] } = useQuery({
    queryKey: ['/api/products/low-stock'],
    retry: false,
  });

  // Fetch expiring products
  const { data: expiringProducts = [] } = useQuery({
    queryKey: ['/api/stock/expiring', 30],
    retry: false,
  });

  const productForm = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      categoryId: 0,
      price: 0,
      costPrice: 0,
      stock: 0,
      minStock: 0,
      unit: 'pcs',
      description: '',
    },
  });

  const stockForm = useForm<StockBatchForm>({
    resolver: zodResolver(stockBatchSchema),
    defaultValues: {
      productId: 0,
      quantity: 0,
      costPrice: 0,
      expiryDate: '',
      batchNumber: '',
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      try {
        return await apiRequest('POST', '/api/products', data);
      } catch (error) {
        // Fallback to local storage
        const localProducts = JSON.parse(localStorage.getItem('pos_products') || '[]');
        const newProduct = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
        localProducts.push(newProduct);
        localStorage.setItem('pos_products', JSON.stringify(localProducts));
        return newProduct;
      }
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Product added successfully' });
      productForm.reset();
      setShowAddProduct(false);
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add product', variant: 'destructive' });
    },
  });

  const addStockMutation = useMutation({
    mutationFn: async (data: StockBatchForm) => {
      try {
        return await apiRequest('POST', '/api/stock/batches', data);
      } catch (error) {
        // Fallback to local storage
        const localBatches = JSON.parse(localStorage.getItem('pos_stock_batches') || '[]');
        const newBatch = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
        localBatches.push(newBatch);
        localStorage.setItem('pos_stock_batches', JSON.stringify(localBatches));
        return newBatch;
      }
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Stock added successfully' });
      stockForm.reset();
      setShowAddStock(false);
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add stock', variant: 'destructive' });
    },
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const onSubmitProduct = (data: ProductForm) => {
    addProductMutation.mutate(data);
  };

  const onSubmitStock = (data: StockBatchForm) => {
    addStockMutation.mutate(data);
  };

  useKeyboardShortcuts({
    onHelp: () => setShowShortcuts(true),
    onAddItem: () => setShowAddProduct(true),
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader 
          title={t('menu.inventory')} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="stock">Stock Management</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <Form {...productForm}>
                      <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={productForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="sku"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SKU</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={productForm.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Selling Price</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="costPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cost Price</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="unit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="pcs">Pieces</SelectItem>
                                    <SelectItem value="kg">Kilograms</SelectItem>
                                    <SelectItem value="ltr">Liters</SelectItem>
                                    <SelectItem value="box">Box</SelectItem>
                                    <SelectItem value="pack">Pack</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={productForm.control}
                            name="stock"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Initial Stock</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="minStock"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Minimum Stock</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setShowAddProduct(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={addProductMutation.isPending}>
                            {addProductMutation.isPending ? 'Adding...' : 'Add Product'}
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
                    <Package className="w-5 h-5" />
                    Products ({filteredProducts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="text-center py-8">Loading products...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product: any) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.unit}</div>
                              </div>
                            </TableCell>
                            <TableCell>{product.sku}</TableCell>
                            <TableCell>₹{product.price}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{product.stock || 0}</span>
                                {(product.stock || 0) <= (product.minStock || 0) && (
                                  <Badge variant="destructive" className="text-xs">
                                    Low Stock
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={(product.stock || 0) > 0 ? 'default' : 'secondary'}>
                                {(product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    stockForm.setValue('productId', product.id);
                                    setShowAddStock(true);
                                  }}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stock Management Tab */}
            <TabsContent value="stock" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Movements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Stock movement history and batch management will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <TrendingDown className="w-5 h-5" />
                      Low Stock Alerts ({lowStockProducts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lowStockProducts.length > 0 ? (
                      <div className="space-y-2">
                        {lowStockProducts.slice(0, 5).map((product: any) => (
                          <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                            <span className="font-medium">{product.name}</span>
                            <Badge variant="destructive">{product.stock} left</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No low stock alerts</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <Calendar className="w-5 h-5" />
                      Expiring Soon ({expiringProducts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {expiringProducts.length > 0 ? (
                      <div className="space-y-2">
                        {expiringProducts.slice(0, 5).map((batch: any) => (
                          <div key={batch.id} className="flex items-center justify-between p-2 border rounded">
                            <span className="font-medium">{batch.product?.name}</span>
                            <Badge variant="outline">{new Date(batch.expiryDate).toLocaleDateString()}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No expiring products</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Inventory Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Inventory reports and analytics will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Add Stock Dialog */}
      <Dialog open={showAddStock} onOpenChange={setShowAddStock}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock - {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <Form {...stockForm}>
            <form onSubmit={stockForm.handleSubmit(onSubmitStock)} className="space-y-4">
              <FormField
                control={stockForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={stockForm.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price per Unit</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={stockForm.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={stockForm.control}
                name="batchNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Number (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddStock(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addStockMutation.isPending}>
                  {addStockMutation.isPending ? 'Adding...' : 'Add Stock'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <FloatingActionButton />
      
      <KeyboardShortcutsOverlay 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
    </div>
  );
}

export default Inventory;
