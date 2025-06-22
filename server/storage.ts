import {
  users,
  businessConfig,
  products,
  categories,
  stockBatches,
  suppliers,
  customers,
  sales,
  saleItems,
  inventoryMovements,
  type User,
  type UpsertUser,
  type BusinessConfig,
  type InsertBusinessConfig,
  type Product,
  type InsertProduct,
  type Sale,
  type InsertSale,
  type Customer,
  type InsertCustomer,
  type StockBatch,
  type SaleItem,
  type Category,
  type Supplier,
  type InventoryMovement,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, lt, sql, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Business configuration
  getBusinessConfig(): Promise<BusinessConfig | undefined>;
  createBusinessConfig(config: InsertBusinessConfig): Promise<BusinessConfig>;
  updateBusinessConfig(id: number, config: Partial<InsertBusinessConfig>): Promise<BusinessConfig>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  searchProducts(query: string): Promise<Product[]>;
  getLowStockProducts(): Promise<Product[]>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category>;
  
  // Stock operations
  getStockBatches(productId?: number): Promise<StockBatch[]>;
  createStockBatch(batch: Omit<StockBatch, 'id' | 'createdAt'>): Promise<StockBatch>;
  updateStockBatch(id: number, quantity: number): Promise<StockBatch>;
  getExpiringProducts(days: number): Promise<StockBatch[]>;
  
  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;
  
  // Sales operations
  getSales(limit?: number): Promise<Sale[]>;
  getSale(id: number): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  getSaleItems(saleId: number): Promise<SaleItem[]>;
  createSaleItem(item: Omit<SaleItem, 'id'>): Promise<SaleItem>;
  
  // Inventory operations
  createInventoryMovement(movement: Omit<InventoryMovement, 'id' | 'createdAt'>): Promise<InventoryMovement>;
  getInventoryMovements(productId?: number): Promise<InventoryMovement[]>;
  
  // Statistics
  getTodaysSales(): Promise<{ total: number; count: number }>;
  getTopSellingProducts(limit: number): Promise<Array<{ product: Product; sales: number; revenue: number }>>;
  
  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Business configuration
  async getBusinessConfig(): Promise<BusinessConfig | undefined> {
    const [config] = await db.select().from(businessConfig).limit(1);
    return config;
  }

  async createBusinessConfig(config: InsertBusinessConfig): Promise<BusinessConfig> {
    const [newConfig] = await db.insert(businessConfig).values(config).returning();
    return newConfig;
  }

  async updateBusinessConfig(id: number, config: Partial<InsertBusinessConfig>): Promise<BusinessConfig> {
    const [updatedConfig] = await db
      .update(businessConfig)
      .set({ ...config, updatedAt: new Date() })
      .where(eq(businessConfig.id, id))
      .returning();
    return updatedConfig;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.sku, sku));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          like(products.name, `%${query}%`)
        )
      );
  }

  async getLowStockProducts(): Promise<Product[]> {
    const result = await db
      .select()
      .from(products)
      .leftJoin(stockBatches, eq(products.id, stockBatches.productId))
      .where(eq(products.isActive, true))
      .groupBy(products.id)
      .having(sql`COALESCE(SUM(${stockBatches.quantity}), 0) <= ${products.minStockLevel}`);
    
    return result.map(item => item.products);
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }

  async createCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Stock operations
  async getStockBatches(productId?: number): Promise<StockBatch[]> {
    if (productId) {
      return await db.select().from(stockBatches).where(
        and(eq(stockBatches.isActive, true), eq(stockBatches.productId, productId))
      );
    }
    
    return await db.select().from(stockBatches).where(eq(stockBatches.isActive, true));
  }

  async createStockBatch(batch: Omit<StockBatch, 'id' | 'createdAt'>): Promise<StockBatch> {
    const [newBatch] = await db.insert(stockBatches).values(batch).returning();
    return newBatch;
  }

  async updateStockBatch(id: number, quantity: number): Promise<StockBatch> {
    const [updatedBatch] = await db
      .update(stockBatches)
      .set({ quantity })
      .where(eq(stockBatches.id, id))
      .returning();
    return updatedBatch;
  }

  async getExpiringProducts(days: number): Promise<StockBatch[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    
    return await db
      .select()
      .from(stockBatches)
      .where(
        and(
          eq(stockBatches.isActive, true),
          lt(stockBatches.expiryDate, expiryDate.toISOString().split('T')[0])
        )
      );
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).where(eq(customers.isActive, true));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.phone, phone));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set(customer)
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  // Sales operations
  async getSales(limit = 50): Promise<Sale[]> {
    return await db.select().from(sales).orderBy(desc(sales.createdAt)).limit(limit);
  }

  async getSale(id: number): Promise<Sale | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale;
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [newSale] = await db.insert(sales).values(sale).returning();
    return newSale;
  }

  async getSaleItems(saleId: number): Promise<SaleItem[]> {
    return await db.select().from(saleItems).where(eq(saleItems.saleId, saleId));
  }

  async createSaleItem(item: Omit<SaleItem, 'id'>): Promise<SaleItem> {
    const [newItem] = await db.insert(saleItems).values(item).returning();
    return newItem;
  }

  // Inventory operations
  async createInventoryMovement(movement: Omit<InventoryMovement, 'id' | 'createdAt'>): Promise<InventoryMovement> {
    const [newMovement] = await db.insert(inventoryMovements).values(movement).returning();
    return newMovement;
  }

  async getInventoryMovements(productId?: number): Promise<InventoryMovement[]> {
    const query = db.select().from(inventoryMovements).orderBy(desc(inventoryMovements.createdAt));
    
    if (productId) {
      query.where(eq(inventoryMovements.productId, productId));
    }
    
    return await query;
  }

  // Statistics
  async getTodaysSales(): Promise<{ total: number; count: number }> {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await db
      .select({
        total: sql<number>`COALESCE(SUM(${sales.total}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(sales)
      .where(sql`DATE(${sales.createdAt}) = ${today}`);
    
    return result[0] || { total: 0, count: 0 };
  }

  async getTopSellingProducts(limit: number): Promise<Array<{ product: Product; sales: number; revenue: number }>> {
    const result = await db
      .select({
        product: products,
        sales: sql<number>`COALESCE(SUM(${saleItems.quantity}), 0)`,
        revenue: sql<number>`COALESCE(SUM(${saleItems.total}), 0)`,
      })
      .from(products)
      .leftJoin(saleItems, eq(products.id, saleItems.productId))
      .where(eq(products.isActive, true))
      .groupBy(products.id)
      .orderBy(desc(sql`COALESCE(SUM(${saleItems.quantity}), 0)`))
      .limit(limit);
    
    return result.map(({ product, sales, revenue }) => ({
      product,
      sales: Number(sales),
      revenue: Number(revenue),
    }));
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).where(eq(suppliers.isActive, true));
  }

  async createSupplier(supplier: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }
}

export const storage = new DatabaseStorage();
