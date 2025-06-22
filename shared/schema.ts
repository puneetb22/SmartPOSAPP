import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  date,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["admin", "cashier", "waiter", "kitchen"] }).notNull().default("cashier"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Business configuration table
export const businessConfig = pgTable("business_config", {
  id: serial("id").primaryKey(),
  businessType: varchar("business_type", { enum: ["restaurant", "pharmacy", "agri"] }).notNull(),
  businessName: varchar("business_name").notNull(),
  gstin: varchar("gstin"),
  address: text("address"),
  phone: varchar("phone"),
  email: varchar("email"),
  userId: varchar("user_id").references(() => users.id),
  isConfigured: boolean("is_configured").notNull().default(false),
  factoryResetProtection: boolean("factory_reset_protection").notNull().default(true),
  defaultLanguage: varchar("default_language", { enum: ["en", "hi", "mr"] }).notNull().default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  nameHi: varchar("name_hi"),
  nameMr: varchar("name_mr"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table with multi-language support
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku").notNull().unique(),
  name: varchar("name").notNull(),
  nameHi: varchar("name_hi"),
  nameMr: varchar("name_mr"),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id),
  hsnCode: varchar("hsn_code").notNull(),
  gstRate: decimal("gst_rate", { precision: 5, scale: 2 }).notNull(),
  unitOfMeasure: varchar("unit_of_measure").notNull(),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  manufacturer: varchar("manufacturer"),
  minStockLevel: integer("min_stock_level").notNull().default(10),
  maxStockLevel: integer("max_stock_level"),
  isBatchTracked: boolean("is_batch_tracked").notNull().default(false),
  hasExpiry: boolean("has_expiry").notNull().default(false),
  barcode: varchar("barcode"),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stock batches table for batch tracking
export const stockBatches = pgTable("stock_batches", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  batchNumber: varchar("batch_number").notNull(),
  expiryDate: date("expiry_date"),
  manufactureDate: date("manufacture_date"),
  purchaseDate: date("purchase_date").notNull(),
  quantity: integer("quantity").notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  contactPerson: varchar("contact_person"),
  phone: varchar("phone"),
  email: varchar("email"),
  address: text("address"),
  gstin: varchar("gstin"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  phone: varchar("phone"),
  email: varchar("email"),
  address: text("address"),
  gstin: varchar("gstin"),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sales table
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  userId: varchar("user_id").references(() => users.id).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { enum: ["cash", "card", "upi", "mixed"] }).notNull(),
  paymentStatus: varchar("payment_status", { enum: ["pending", "completed", "cancelled"] }).notNull().default("completed"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sale items table
export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").references(() => sales.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  batchId: integer("batch_id").references(() => stockBatches.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

// Inventory movements table
export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  batchId: integer("batch_id").references(() => stockBatches.id),
  movementType: varchar("movement_type", { enum: ["in", "out", "adjustment"] }).notNull(),
  quantity: integer("quantity").notNull(),
  reason: varchar("reason").notNull(),
  referenceId: integer("reference_id"), // Sale ID, Purchase ID, etc.
  userId: varchar("user_id").references(() => users.id).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Restaurant specific tables
export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  tableNumber: varchar("table_number").notNull().unique(),
  capacity: integer("capacity").notNull(),
  status: varchar("status", { enum: ["available", "occupied", "reserved", "maintenance"] }).notNull().default("available"),
  isActive: boolean("is_active").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number").notNull().unique(),
  tableId: integer("table_id").references(() => tables.id),
  customerId: integer("customer_id").references(() => customers.id),
  waiterId: varchar("waiter_id").references(() => users.id),
  status: varchar("status", { enum: ["pending", "preparing", "ready", "served", "cancelled"] }).notNull().default("pending"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  stockBatches: many(stockBatches),
  saleItems: many(saleItems),
  inventoryMovements: many(inventoryMovements),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const stockBatchesRelations = relations(stockBatches, ({ one, many }) => ({
  product: one(products, {
    fields: [stockBatches.productId],
    references: [products.id],
  }),
  supplier: one(suppliers, {
    fields: [stockBatches.supplierId],
    references: [suppliers.id],
  }),
  saleItems: many(saleItems),
  inventoryMovements: many(inventoryMovements),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
  user: one(users, {
    fields: [sales.userId],
    references: [users.id],
  }),
  saleItems: many(saleItems),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
  batch: one(stockBatches, {
    fields: [saleItems.batchId],
    references: [stockBatches.id],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  stockBatches: many(stockBatches),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  sales: many(sales),
  orders: many(orders),
}));

export const usersRelations = relations(users, ({ many }) => ({
  sales: many(sales),
  inventoryMovements: many(inventoryMovements),
  orders: many(orders),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertBusinessConfigSchema = createInsertSchema(businessConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type BusinessConfig = typeof businessConfig.$inferSelect;
export type InsertBusinessConfig = z.infer<typeof insertBusinessConfigSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type StockBatch = typeof stockBatches.$inferSelect;
export type SaleItem = typeof saleItems.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;
