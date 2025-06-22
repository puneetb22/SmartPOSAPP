# Maharashtra POS System

## Overview

This is a comprehensive Point of Sale (POS) system designed for multiple business types in Maharashtra, India. The application supports restaurant, pharmacy, and agriculture business modes with multilingual support (English, Hindi, Marathi) and GST compliance features.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state, React Context for app state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints with typed responses

## Key Components

### Business Mode System
The application supports three distinct business modes:
- **Restaurant Mode**: Table management, menu items, order tracking
- **Pharmacy Mode**: Prescription management, drug inventory, expiry tracking
- **Agriculture Mode**: Crop products, seasonal inventory, batch tracking

Each mode provides specialized features while sharing core POS functionality.

### Authentication & Authorization
- Uses Replit's OIDC authentication system
- Role-based access control (admin, cashier, waiter, kitchen)
- Session persistence with PostgreSQL backing
- Protected routes based on authentication status

### Database Schema
- **Users**: Authentication and role management
- **Business Config**: Multi-mode business settings
- **Products**: Inventory with category and supplier relationships
- **Sales**: Transaction recording with itemized details
- **Stock Management**: Batch tracking with expiry dates
- **Customers**: Customer relationship management

### Multilingual Support
- Built-in i18n system supporting English, Hindi, and Marathi
- Context-based translation management
- Language preference persistence
- Keyboard shortcuts with localized labels

## Data Flow

1. **Authentication Flow**: User authenticates via Replit OIDC → Session created → User data stored
2. **Business Setup**: First-time setup determines business mode → Configures specialized features
3. **Sales Process**: Product selection → Cart management → Payment processing → Receipt generation
4. **Inventory Management**: Stock updates → Low stock alerts → Supplier management
5. **Reporting**: Real-time analytics → GST compliance reports → Business insights

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **drizzle-orm**: TypeScript ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for server
- **tailwindcss**: Utility-first CSS framework
- **vite**: Development server and build tool

### Authentication
- **openid-client**: OIDC client implementation
- **passport**: Authentication middleware
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- Replit-hosted with automatic reload
- Hot module replacement via Vite
- PostgreSQL development database
- Environment variable configuration

### Production Build
- **Frontend**: Vite production build to `dist/public`
- **Backend**: esbuild bundle to `dist/index.js`
- **Database**: Drizzle migrations for schema management
- **Deployment**: Replit autoscale deployment target

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier
- `NODE_ENV`: Environment mode (development/production)

## Local Development Setup

This project can be run locally in VS Code. See `SETUP.md` for detailed instructions on:
- Installing prerequisites (Node.js, PostgreSQL, VS Code extensions)
- Environment configuration
- Database setup and migrations
- Development workflow and debugging

## Changelog
```
Changelog:
- June 22, 2025. Initial setup and authentication debugging
- June 22, 2025. Fixed business setup flow and local development guide
- June 22, 2025. Resolved database schema issues and business config creation errors
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```