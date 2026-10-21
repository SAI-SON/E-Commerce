# 🛍️ Vastra — Clothing & Accessories Store

<p align="center">
  <a href="https://e-commerce-seven-navy-77.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🌐_LIVE_DEMO_STOREFRONT-VISIT_NOW-8C4A2F?style=for-the-badge&logo=vercel&logoColor=white" height="36" alt="Live Demo Storefront" />
  </a>
  &nbsp;
  <a href="https://vastra-api-lesr.onrender.com/api/v1/health" target="_blank">
    <img src="https://img.shields.io/badge/⚙️_BACKEND_API-HEALTHY-00B37E?style=for-the-badge&logo=render&logoColor=white" height="36" alt="Live Backend API" />
  </a>
</p>

> 🔗 **Live Storefront Demo**: [**https://e-commerce-seven-navy-77.vercel.app**](https://e-commerce-seven-navy-77.vercel.app/)  
> ⚙️ **Production REST API**: [**https://vastra-api-lesr.onrender.com**](https://vastra-api-lesr.onrender.com)  
> 🔑 **Demo Admin Login**: `admin@vastrastore.com` / `Admin@12345`  
> 👤 **Demo Customer Login**: `customer@vastrastore.com` / `Customer@12345`  

<p align="center">
  <a href="https://e-commerce-seven-navy-77.vercel.app/"><img src="https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel&logoColor=white" alt="Vercel" /></a>
  <a href="https://vastra-api-lesr.onrender.com/api/v1/health"><img src="https://img.shields.io/badge/Render-Online-46E3B7?logo=render&logoColor=white" alt="Render" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" /></a>
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind-CSS%203-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind" />
</p>

A modern, production-oriented e-commerce web platform for handcrafted clothing, pure organic linen and cotton wear, traditional Indian garments, temple jewellery, and mindful accessories. Built with a clean, serene, warm-minimalist aesthetic and powered by a robust full-stack architecture with native PostgreSQL persistence and ACID transactional integrity.

---

## 🚀 Live Demo & Production Deployment

| Service | Environment | Status / URL |
| :--- | :--- | :--- |
| **Storefront** | Vercel | [https://e-commerce-seven-navy-77.vercel.app](https://e-commerce-seven-navy-77.vercel.app/) |
| **Backend REST API** | Render | [https://vastra-api-lesr.onrender.com](https://vastra-api-lesr.onrender.com) |
| **API Health Check** | Render | [https://vastra-api-lesr.onrender.com/api/v1/health](https://vastra-api-lesr.onrender.com/api/v1/health) |
| **Cloud Database** | Supabase | Managed PostgreSQL with connection pooling |

### Quick Demo Credentials

Visitors can log in to test customer and admin features:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Store Administrator** | `admin@vastrastore.com` | `Admin@12345` | Full Admin Suite (`/admin`) |
| **Demo Customer** | `customer@vastrastore.com` | `Customer@12345` | Customer Account (`/account`) |

---

## 1. Project Overview & Aesthetic Direction

**Vastra** ("Clothing / Garment" in Sanskrit) celebrates traditional Indian textile crafts through an uncluttered, contemporary e-commerce interface. Inspired by natural fabrics, slow fashion, and contemplative living, Vastra features:
- **Warm off-white & earthy color palette** (`#FDFBF7` background, terracotta `#8C4A2F`, natural olive `#4A5D4E`, sand `#C5A880`, and charcoal `#22201E`).
- **Editorial typography**: Elegant serif headings (*Playfair Display*) paired with clean, accessible sans-serif body (*Inter* / *Plus Jakarta Sans*).
- **Responsive geometry**: Adaptive multi-column product grids with zero horizontal overflow across mobile, tablet, and desktop viewports.
- **Embedded resilient fallbacks**: Zero-network SVG fallback placeholders that gracefully preserve layout if external image URLs become unavailable.

---

## 2. Key Features

### Customer Storefront
- **Home Showcase**: Hero banner, curated category discovery, best sellers, new arrivals, and brand philosophy highlights.
- **Dynamic Catalogue (`/catalogue`)**:
  - Full-text search across titles, descriptions, and tags.
  - Multi-faceted server-side filtering by category, size, colour, price range, and in-stock status.
  - Interactive grid and list view modes.
  - Shareable search, filter, and pagination states synchronized with URL query parameters.
- **Interactive Product Details (`/products/:slug`)**:
  - Image gallery with thumbnail selection.
  - Multi-attribute variant selectors (Size and Colour).
  - Real-time variant-specific stock counter.
  - Automatic button disabling when selected variant is out of stock.
  - Authentic craftsmanship, fabric composition, and washing recommendations.
- **Authoritative Shopping Cart (`/cart`)**:
  - Server-calculated subtotals, discounts, shipping, and grand totals.
  - Persistent guest session carts via `X-Guest-Session-Id` that seamlessly merge into customer accounts upon login.
  - Complimentary shipping progress indicator.
  - Promotional coupon engine supporting percentage and fixed discounts with minimum spend rules and maximum caps.
- **ACID Transactional Checkout (`/checkout`)**:
  - Delivery address entry or quick selection from saved addresses.
  - Concurrency-safe stock verification and atomic inventory decrements.
  - Client-side price tampering rejection (authoritative server pricing).
  - Clearly disclosed simulated payment gateway (`VASTRA_MOCK_PAYMENT`).
  - Order confirmation receipt with immutable item and address snapshots (`/order-confirmation/:orderNumber`).
- **Customer Account Portal (`/account`)**:
  - Profile management (`/account/profile`).
  - Multi-address book with default shipping/billing designations (`/account/addresses`).
  - Private order history and detailed receipt breakdown (`/account/orders`).
  - Personal wishlist with one-click selection (`/account/wishlist`).

### Administrator Management Suite (`/admin`)
- **Role-Based Authorization**: Protected by server-side JWT verification (`requireAdmin`).
- **Operational Performance Dashboard**: Database-calculated KPIs (gross sales, total orders, completed deliveries, pending shipments, customer accounts, low-stock warnings, recent orders, and sales leaderboards).
- **Catalogue & Product Editor**:
  - Full product list with search and pagination.
  - Quick publish/unpublish toggle and soft-delete archive actions.
  - Product creation and editing with image gallery configuration, category assignments, and variant SKU setup.
- **Auditable Inventory & Stock Controls**:
  - Variant-level stock monitor with automated low-stock and out-of-stock badges.
  - Stock adjustment modal with mandatory business reason logging.
  - Strict prevention of negative inventory levels.
  - Immutable `InventoryMovement` timeline log.
- **Order Lifecycle & State Machine**:
  - Filter and search incoming customer orders.
  - Strict status transitions: `PENDING_PAYMENT` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PROCESSING` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED`.
  - Automatic inventory restock upon order cancellation (`CANCELLED`).
- **Promotional Coupon Campaigns**:
  - Deploy new discount codes with usage limits, minimum subtotals, discount caps, and expiry dates.
  - Real-time campaign activation toggle (`VASTRA10`, `FESTIVE25`, `WELCOME500`).

---

## 3. Technology Stack

### Frontend (`client/`)
- **Framework**: React 18 with TypeScript & TSX
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS v3 with custom color tokens and typography
- **Server State & Caching**: TanStack Query (React Query) v5
- **Client State**: Zustand v5 (Auth and Cart persistence)
- **Routing**: React Router v6 (configured with SPA rewrites via `vercel.json`)
- **Icons**: Lucide React
- **Component Library**: Material UI (MUI v9) for rich interactive controls
- **Forms & Validation**: React Hook Form with Zod resolvers

### Backend (`server/`)
- **Runtime**: Node.js v20+ with Express 4/5 & TypeScript
- **ORM**: Prisma ORM v6 with connection pooling
- **Request Validation**: Zod middleware (Body, Query, and Params)
- **Security**: Helmet, CORS origin whitelisting, Bcrypt password hashing, JWT authentication tokens
- **Architecture**: Modular REST API (`/api/v1`) with Controllers, Services, and Route modules

### Database
- **Engine**: PostgreSQL (hosted on Supabase)
- **Schema**: 20 normalized relational models with composite indexes, foreign keys, and decimal types.
- **Transactions**: Prisma ACID interactive transactions for checkout order creation and stock adjustments.

---

## 4. Repository Structure

```
vastra-store/
├── client/                     # Frontend React + Vite SPA
│   ├── src/
│   │   ├── components/         # Common UI, Layouts, and Product components
│   │   ├── pages/              # Storefront, Account, and Admin pages
│   │   ├── store/              # Zustand stores (authStore, cartStore)
│   │   ├── lib/                # API client, utilities, and Supabase client
│   │   ├── types/              # Unified TypeScript interfaces
│   │   ├── App.tsx             # Application route mappings
│   │   └── main.tsx            # Entry point with QueryClient & Router
│   ├── index.html              # HTML shell with Google Fonts
│   ├── tailwind.config.js      # Custom theme tokens & palette
│   ├── vercel.json             # SPA routing rewrite rules for Vercel
│   └── vite.config.ts          # Vite configuration with /api proxy
├── server/                     # Backend Express REST API
│   ├── prisma/
│   │   ├── schema.prisma       # Relational models, constraints, and pooling config
│   │   ├── migrations/         # PostgreSQL schema migration files
│   │   └── seed.ts             # Deterministic seed script (26 products, coupons, users)
│   ├── src/
│   │   ├── config/             # Prisma client singleton & environment config
│   │   ├── middleware/         # Auth, validation, rate-limiter, and error handlers
│   │   ├── modules/            # Auth, Products, Categories, Cart, Orders, Admin, Wishlist, Coupons
│   │   ├── __tests__/          # Vitest + Supertest integration test suite
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # HTTP server bootstrap & graceful shutdown
│   ├── tsconfig.json           # Production TypeScript compilation configuration
│   └── package.json            # Server dependencies and lifecycle scripts
├── docs/                       # Project documentation
│   ├── requirements.md         # System requirements specification (SRS)
│   ├── user-stories.md         # Agile user stories with acceptance criteria
│   ├── database-erd.md         # Mermaid ER diagram and schema dictionary
│   ├── api-spec.yaml           # OpenAPI 3.0 specification
│   ├── test-plan.md            # Test matrix and TC01-TC20 execution results
│   ├── user-guide.md           # Customer storefront shopping guide
│   ├── admin-guide.md          # Administrator operations manual
│   └── deployment.md           # Production deployment & hosting guide
├── package.json                # Monorepo workspaces configuration
└── README.md                   # Master project documentation
```

---

## 5. Local Development Setup

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **PostgreSQL**: Local instance or cloud database (Supabase / Neon)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/SAI-SON/E-Commerce.git
cd E-Commerce
npm install
```

### 2. Configure Environment Variables

**Backend (`server/.env`)**:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DB]?schema=public"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DB]"
JWT_SECRET="your-jwt-secret-key-here"
JWT_EXPIRES_IN="7d"
COOKIE_SECRET="your-cookie-secret-key"
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
SUPABASE_URL="https://[YOUR-PROJECT].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

**Frontend (`client/.env`)**:
```env
VITE_API_URL="http://localhost:5000/api/v1"
VITE_SUPABASE_URL="https://[YOUR-PROJECT].supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 3. Run Database Migrations & Seed Data
```bash
# Apply Prisma migrations
npx prisma migrate deploy --schema=server/prisma/schema.prisma

# Seed initial categories, products, coupons, and test accounts
npm run prisma:seed --workspace=server
```

### 4. Start Development Servers
```bash
npm run dev
```
- **Storefront Client**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/v1/health

---

## 6. Production Deployment Guide

This project is deployed across modern serverless and cloud hosting providers:

### Architecture

```
[ Customer Browser ] 
        │
        ├──> Frontend SPA ──────> Vercel Edge Network
        │                         (e-commerce-seven-navy-77.vercel.app)
        │
        └──> Backend REST API ──> Render Web Service (Node.js/Express)
                                  (vastra-api-lesr.onrender.com)
                                        │
                                        ▼
                                  Supabase PostgreSQL
                                  (AWS ap-northeast-1 / Pooled)
```

1. **Database**: Hosted on **Supabase** with transaction and session pooling.
2. **Backend**: Hosted on **Render** as a Node.js Web Service running `node dist/server.js`.
3. **Frontend**: Hosted on **Vercel** with automatic Vite builds and client-side single page app routing via `vercel.json`.

Detailed hosting instructions are documented in [docs/deployment.md](docs/deployment.md).

---

## 7. Automated Testing & Verification

Execute the test suites:
```bash
# Backend integration tests
npm test --workspace=server

# Frontend component tests
npm test --workspace=client

# Full monorepo production build
npm run build
```

---

## 8. License

Designed and developed for **Vastra — Clothing & Accessories Store**.  
All rights reserved.
