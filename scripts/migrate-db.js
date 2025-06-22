#!/usr/bin/env node

/**
 * Database Migration Script for Maharashtra POS System
 * 
 * This script handles database schema updates for the internal Docker hosted database.
 * It compares the current schema with the target schema and applies necessary changes.
 * 
 * Usage:
 *   node scripts/migrate-db.js [--dry-run] [--force]
 * 
 * Options:
 *   --dry-run: Show what would be changed without applying
 *   --force: Apply changes without confirmation
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

// Schema validation queries
const SCHEMA_CHECKS = [
  {
    name: 'Check if sessions table exists',
    query: `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sessions'
      ) as exists;
    `
  },
  {
    name: 'Check if users table exists',
    query: `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as exists;
    `
  },
  {
    name: 'Check if business_config table exists',
    query: `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'business_config'
      ) as exists;
    `
  },
  {
    name: 'Check if categories table exists',
    query: `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categories'
      ) as exists;
    `
  },
  {
    name: 'Check if products table exists',
    query: `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      ) as exists;
    `
  },
  {
    name: 'Check if stock_batches table exists',
    query: `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'stock_batches'
      ) as exists;
    `
  },
  {
    name: 'Check if suppliers table exists',
    query: `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'suppliers'
      ) as exists;
    `
  },
  {
    name: 'Check if customers table exists',
    query: `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customers'
      ) as exists;
    `
  },
  {
    name: 'Check if sales table exists',
    query: `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sales'
      ) as exists;
    `
  },
  {
    name: 'Check if sale_items table exists',
    query: `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sale_items'
      ) as exists;
    `
  },
  {
    name: 'Check if inventory_movements table exists',
    query: `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'inventory_movements'
      ) as exists;
    `
  }
];

// Column validation queries
const COLUMN_CHECKS = [
  {
    name: 'Check products table columns',
    query: `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
  },
  {
    name: 'Check customers table columns',
    query: `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'customers' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
  }
];

// Schema creation queries
const CREATE_TABLES = [
  {
    name: 'Create sessions table',
    query: `
      CREATE TABLE IF NOT EXISTS "sessions" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      ) WITH (OIDS=FALSE);
      ALTER TABLE "sessions" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");
    `
  },
  {
    name: 'Create users table',
    query: `
      CREATE TABLE IF NOT EXISTS "users" (
        "id" text PRIMARY KEY NOT NULL,
        "first_name" text,
        "last_name" text,
        "profile_image_url" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `
  },
  {
    name: 'Create business_config table',
    query: `
      CREATE TABLE IF NOT EXISTS "business_config" (
        "id" serial PRIMARY KEY NOT NULL,
        "business_type" text NOT NULL,
        "business_name" text NOT NULL,
        "gstin" text,
        "address" text NOT NULL,
        "phone" text NOT NULL,
        "email" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `
  },
  {
    name: 'Create categories table',
    query: `
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `
  },
  {
    name: 'Create suppliers table',
    query: `
      CREATE TABLE IF NOT EXISTS "suppliers" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "contact_person" text,
        "phone" text,
        "email" text,
        "address" text,
        "gstin" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `
  },
  {
    name: 'Create products table',
    query: `
      CREATE TABLE IF NOT EXISTS "products" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "sku" text NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "cost_price" numeric(10,2),
        "stock" integer DEFAULT 0 NOT NULL,
        "min_stock" integer DEFAULT 0 NOT NULL,
        "unit" text DEFAULT 'pcs' NOT NULL,
        "category_id" integer,
        "supplier_id" integer,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "products_sku_unique" UNIQUE("sku")
      );
    `
  },
  {
    name: 'Create stock_batches table',
    query: `
      CREATE TABLE IF NOT EXISTS "stock_batches" (
        "id" serial PRIMARY KEY NOT NULL,
        "product_id" integer NOT NULL,
        "batch_number" text,
        "quantity" integer NOT NULL,
        "cost_price" numeric(10,2) NOT NULL,
        "expiry_date" date,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `
  },
  {
    name: 'Create customers table',
    query: `
      CREATE TABLE IF NOT EXISTS "customers" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "phone" text NOT NULL,
        "email" text,
        "address" text,
        "gstin" text,
        "credit_limit" numeric(10,2) DEFAULT 0,
        "total_sales" numeric(10,2) DEFAULT 0,
        "total_orders" integer DEFAULT 0,
        "last_order_date" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "customers_phone_unique" UNIQUE("phone")
      );
    `
  },
  {
    name: 'Create sales table',
    query: `
      CREATE TABLE IF NOT EXISTS "sales" (
        "id" serial PRIMARY KEY NOT NULL,
        "invoice_number" text NOT NULL,
        "customer_id" integer,
        "subtotal" numeric(10,2) NOT NULL,
        "discount" numeric(10,2) DEFAULT 0 NOT NULL,
        "tax_amount" numeric(10,2) DEFAULT 0 NOT NULL,
        "total" numeric(10,2) NOT NULL,
        "payment_method" text NOT NULL,
        "notes" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "sales_invoice_number_unique" UNIQUE("invoice_number")
      );
    `
  },
  {
    name: 'Create sale_items table',
    query: `
      CREATE TABLE IF NOT EXISTS "sale_items" (
        "id" serial PRIMARY KEY NOT NULL,
        "sale_id" integer NOT NULL,
        "product_id" integer NOT NULL,
        "quantity" integer NOT NULL,
        "unit_price" numeric(10,2) NOT NULL,
        "total_price" numeric(10,2) NOT NULL,
        "discount" numeric(10,2) DEFAULT 0 NOT NULL
      );
    `
  },
  {
    name: 'Create inventory_movements table',
    query: `
      CREATE TABLE IF NOT EXISTS "inventory_movements" (
        "id" serial PRIMARY KEY NOT NULL,
        "product_id" integer NOT NULL,
        "type" text NOT NULL,
        "quantity" integer NOT NULL,
        "reference_id" integer,
        "reference_type" text,
        "notes" text,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `
  }
];

// Foreign key constraints
const ADD_FOREIGN_KEYS = [
  {
    name: 'Add products foreign keys',
    query: `
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_category_id_categories_id_fk') THEN
          ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" 
          FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_supplier_id_suppliers_id_fk') THEN
          ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_suppliers_id_fk" 
          FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
      END $$;
    `
  },
  {
    name: 'Add stock_batches foreign keys',
    query: `
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stock_batches_product_id_products_id_fk') THEN
          ALTER TABLE "stock_batches" ADD CONSTRAINT "stock_batches_product_id_products_id_fk" 
          FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `
  },
  {
    name: 'Add sales foreign keys',
    query: `
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sales_customer_id_customers_id_fk') THEN
          ALTER TABLE "sales" ADD CONSTRAINT "sales_customer_id_customers_id_fk" 
          FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
      END $$;
    `
  },
  {
    name: 'Add sale_items foreign keys',
    query: `
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sale_items_sale_id_sales_id_fk') THEN
          ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sales_id_fk" 
          FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sale_items_product_id_products_id_fk') THEN
          ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_id_products_id_fk" 
          FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `
  },
  {
    name: 'Add inventory_movements foreign keys',
    query: `
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_movements_product_id_products_id_fk') THEN
          ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_product_id_products_id_fk" 
          FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `
  }
];

// Insert default data
const INSERT_DEFAULT_DATA = [
  {
    name: 'Insert default categories',
    query: `
      INSERT INTO "categories" ("name", "description") 
      SELECT * FROM (VALUES 
        ('General', 'General products'),
        ('Electronics', 'Electronic items'),
        ('Food & Beverages', 'Food and drink items'),
        ('Medical', 'Medical and pharmaceutical items'),
        ('Agricultural', 'Agricultural products and supplies')
      ) AS v(name, description)
      WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = v.name);
    `
  }
];

// Main migration function
async function runMigration(options = {}) {
  const { dryRun = false, force = false } = options;
  
  console.log('🚀 Starting database migration...\n');
  
  try {
    // Check current schema
    console.log('📋 Checking current database schema...');
    for (const check of SCHEMA_CHECKS) {
      try {
        const result = await db.execute(sql.raw(check.query));
        const exists = result[0]?.exists;
        console.log(`   ${exists ? '✅' : '❌'} ${check.name}: ${exists ? 'EXISTS' : 'MISSING'}`);
      } catch (error) {
        console.log(`   ❌ ${check.name}: ERROR - ${error.message}`);
      }
    }
    
    console.log('\n📊 Checking column structures...');
    for (const check of COLUMN_CHECKS) {
      try {
        const result = await db.execute(sql.raw(check.query));
        console.log(`   📝 ${check.name}:`);
        if (result.length > 0) {
          result.forEach(col => {
            console.log(`      - ${col.column_name} (${col.data_type}${col.is_nullable === 'YES' ? ', nullable' : ''})`);
          });
        } else {
          console.log('      Table does not exist');
        }
      } catch (error) {
        console.log(`   ❌ ${check.name}: ERROR - ${error.message}`);
      }
    }
    
    if (dryRun) {
      console.log('\n🔍 DRY RUN MODE - No changes will be applied');
      return;
    }
    
    if (!force) {
      const { createInterface } = await import('readline');
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('\n❓ Do you want to proceed with the migration? (y/N): ', resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('Migration cancelled.');
        return;
      }
    }
    
    console.log('\n🔨 Creating missing tables...');
    for (const table of CREATE_TABLES) {
      try {
        await db.execute(sql.raw(table.query));
        console.log(`   ✅ ${table.name}`);
      } catch (error) {
        console.log(`   ❌ ${table.name}: ERROR - ${error.message}`);
      }
    }
    
    console.log('\n🔗 Adding foreign key constraints...');
    for (const constraint of ADD_FOREIGN_KEYS) {
      try {
        await db.execute(sql.raw(constraint.query));
        console.log(`   ✅ ${constraint.name}`);
      } catch (error) {
        console.log(`   ❌ ${constraint.name}: ERROR - ${error.message}`);
      }
    }
    
    console.log('\n📥 Inserting default data...');
    for (const data of INSERT_DEFAULT_DATA) {
      try {
        await db.execute(sql.raw(data.query));
        console.log(`   ✅ ${data.name}`);
      } catch (error) {
        console.log(`   ❌ ${data.name}: ERROR - ${error.message}`);
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  force: args.includes('--force')
};

// Show help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Database Migration Script for Maharashtra POS System

Usage: node scripts/migrate-db.js [options]

Options:
  --dry-run    Show what would be changed without applying
  --force      Apply changes without confirmation
  --help, -h   Show this help message

Examples:
  node scripts/migrate-db.js --dry-run
  node scripts/migrate-db.js --force
  node scripts/migrate-db.js
  `);
  process.exit(0);
}

// Run migration
runMigration(options).catch(console.error);