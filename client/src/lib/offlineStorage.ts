// Local storage utilities for offline functionality

export interface OfflineData {
  products: any[];
  sales: any[];
  customers: any[];
  businessConfig: any;
  categories: any[];
  stockBatches: any[];
}

const STORAGE_KEYS = {
  PRODUCTS: 'pos_products',
  SALES: 'pos_sales',
  CUSTOMERS: 'pos_customers',
  BUSINESS_CONFIG: 'pos_business_config',
  CATEGORIES: 'pos_categories',
  STOCK_BATCHES: 'pos_stock_batches',
  PENDING_SYNCS: 'pos_pending_syncs',
} as const;

export class OfflineStorageManager {
  // Generic storage methods
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to parse stored data:', error);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  }

  // Business Config
  getBusinessConfig() {
    return this.getItem(STORAGE_KEYS.BUSINESS_CONFIG, null);
  }

  setBusinessConfig(config: any) {
    this.setItem(STORAGE_KEYS.BUSINESS_CONFIG, config);
  }

  // Products
  getProducts() {
    return this.getItem(STORAGE_KEYS.PRODUCTS, []);
  }

  addProduct(product: any) {
    const products = this.getProducts();
    const newProduct = {
      ...product,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  }

  updateProduct(id: number, updates: any) {
    const products = this.getProducts();
    const index = products.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.setItem(STORAGE_KEYS.PRODUCTS, products);
      return products[index];
    }
    return null;
  }

  // Sales
  getSales() {
    return this.getItem(STORAGE_KEYS.SALES, []);
  }

  addSale(sale: any) {
    const sales = this.getSales();
    const newSale = {
      ...sale,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    sales.push(newSale);
    this.setItem(STORAGE_KEYS.SALES, sales);
    return newSale;
  }

  // Customers
  getCustomers() {
    return this.getItem(STORAGE_KEYS.CUSTOMERS, []);
  }

  addCustomer(customer: any) {
    const customers = this.getCustomers();
    const newCustomer = {
      ...customer,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    customers.push(newCustomer);
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
    return newCustomer;
  }

  // Categories
  getCategories() {
    return this.getItem(STORAGE_KEYS.CATEGORIES, [
      { id: 1, name: 'General', isActive: true, createdAt: new Date().toISOString() },
      { id: 2, name: 'Food & Beverages', isActive: true, createdAt: new Date().toISOString() },
      { id: 3, name: 'Electronics', isActive: true, createdAt: new Date().toISOString() },
    ]);
  }

  addCategory(category: any) {
    const categories = this.getCategories();
    const newCategory = {
      ...category,
      id: Date.now(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    categories.push(newCategory);
    this.setItem(STORAGE_KEYS.CATEGORIES, categories);
    return newCategory;
  }

  // Analytics
  getTodaysSales() {
    const sales = this.getSales();
    const today = new Date().toDateString();
    const todaysSales = sales.filter((sale: any) => 
      new Date(sale.createdAt).toDateString() === today
    );
    
    return {
      total: todaysSales.reduce((sum: number, sale: any) => sum + sale.totalAmount, 0),
      count: todaysSales.length,
    };
  }

  // Clear all data
  clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const offlineStorage = new OfflineStorageManager();