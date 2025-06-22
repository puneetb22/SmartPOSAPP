import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertBusinessConfigSchema, 
  insertProductSchema, 
  insertSaleSchema, 
  insertCustomerSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Business configuration routes
  app.get('/api/business-config', async (req, res) => {
    try {
      const config = await storage.getBusinessConfig();
      res.json(config);
    } catch (error) {
      console.error("Error fetching business config:", error);
      res.status(500).json({ message: "Failed to fetch business configuration" });
    }
  });

  app.post('/api/business-config', async (req: any, res) => {
    try {
      const validatedData = insertBusinessConfigSchema.parse(req.body);
      // Add default user ID for offline mode and mark as configured
      const configWithDefaults = {
        ...validatedData,
        userId: 'offline_user',
        isConfigured: true,
        factoryResetProtection: true
      };
      const config = await storage.createBusinessConfig(configWithDefaults);
      res.json(config);
    } catch (error) {
      console.error("Error creating business config:", error);
      res.status(500).json({ message: "Failed to create business configuration" });
    }
  });

  app.patch('/api/business-config/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertBusinessConfigSchema.partial().parse(req.body);
      const config = await storage.updateBusinessConfig(parseInt(id), validatedData);
      res.json(config);
    } catch (error) {
      console.error("Error updating business config:", error);
      res.status(500).json({ message: "Failed to update business configuration" });
    }
  });

  // Product routes (no auth required for offline mode)
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const products = await storage.searchProducts(q);
      res.json(products);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  app.get('/api/products/low-stock', async (req, res) => {
    try {
      const products = await storage.getLowStockProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });

  app.post('/api/products', async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!['admin', 'cashier'].includes(user?.role || '')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Category routes (no auth required for offline mode)
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Customer routes (no auth required for offline mode)
  app.get('/api/customers', async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  // Sales routes (no auth required for offline mode)
  app.get('/api/sales', async (req, res) => {
    try {
      const { limit } = req.query;
      const sales = await storage.getSales(limit ? parseInt(limit as string) : undefined);
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post('/api/sales', async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!['admin', 'cashier', 'waiter'].includes(user?.role || '')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const { sale, items } = req.body;
      const validatedSale = insertSaleSchema.parse({ ...sale, userId });
      
      // Create the sale
      const newSale = await storage.createSale(validatedSale);
      
      // Create sale items and update inventory
      for (const item of items) {
        await storage.createSaleItem({
          ...item,
          saleId: newSale.id,
        });
        
        // Create inventory movement
        await storage.createInventoryMovement({
          productId: item.productId,
          batchId: item.batchId,
          movementType: 'out',
          quantity: -item.quantity,
          reason: 'sale',
          referenceId: newSale.id,
          userId,
          notes: `Sale #${newSale.id}`,
        });
      }
      
      res.json(newSale);
    } catch (error) {
      console.error("Error creating sale:", error);
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  // Statistics routes (no auth required for offline mode)
  app.get('/api/stats/today', async (req, res) => {
    try {
      const stats = await storage.getTodaysSales();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching today's stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.get('/api/stats/top-products', async (req, res) => {
    try {
      const { limit = 5 } = req.query;
      const products = await storage.getTopSellingProducts(parseInt(limit as string));
      res.json(products);
    } catch (error) {
      console.error("Error fetching top products:", error);
      res.status(500).json({ message: "Failed to fetch top selling products" });
    }
  });

  // Stock routes
  app.get('/api/stock/expiring', isAuthenticated, async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const expiringProducts = await storage.getExpiringProducts(parseInt(days as string));
      res.json(expiringProducts);
    } catch (error) {
      console.error("Error fetching expiring products:", error);
      res.status(500).json({ message: "Failed to fetch expiring products" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
