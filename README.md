# Vastra — Clothing & Accessories Store

A modern, production-oriented e-commerce web platform for handcrafted clothing, pure organic linen and cotton wear, traditional Indian garments, temple jewellery, and mindful accessories. Built with a clean, serene, warm-minimalist aesthetic and powered by a robust full-stack architecture with native PostgreSQL persistence and ACID transactional integrity.

---

## 1. Project Overview & Aesthetic Direction

**Vastra** ("Clothing / Garment" in Sanskrit) celebrates traditional Indian textile crafts through an uncluttered, contemporary e-commerce interface. Inspired by natural fabrics, slow fashion, and contemplative living, Vastra features:
- **Warm off-white & earthy color palette** (`#FDFBF7` background, terracotta `#8C4A2F`, natural olive `#4A5D4E`, sand `#C5A880`, and charcoal `#22201E`).
- **Editorial typography**: Elegant serif headings (*Playfair Display*) paired with clean, accessible sans-serif body (*Inter*).
- **Responsive geometry**: Adaptive multi-column product grids with zero horizontal overflow across mobile, tablet, and desktop viewports.
- **Embedded resilient fallbacks**: Zero-network SVG fallback placeholders that gracefully preserve layout if external image URLs become unavailable.

---

## 2. Key Features

### Customer Storefront
- **Home Showcase**: Hero banner, curated category discovery, best sellers, new arrivals, and brand philosophy highlights.
- **Dynamic Catalogue (`/products`)**:
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
  - Real-time campaign activation toggle.

---

## 3. Technology Stack

### Frontend (`client/`)
- **Framework**: React 18 with TypeScript & TSX
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS v3 with custom color tokens and typography
- **Server State & Caching**: TanStack Query (React Query) v5
- **Client State**: Zustand v5 (Auth and Cart persistence)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form with Zod resolvers

### Backend (`server/`)
- **Runtime**: Node.js v20+ with Express 5 & TypeScript
- **ORM**: Prisma ORM v5
- **Request Validation**: Zod middleware (Body, Query, and Params)
- **Security**: Helmet, CORS, Argon2/Bcrypt password hashing, JWT authentication tokens
- **Architecture**: Modular REST API (`/api/v1`) with Controllers, Services, and Route modules

### Database
- **Engine**: PostgreSQL (v14+)
- **Schema**: 20 normalized relational models with composite indexes, foreign keys, and decimal types.
- **Transactions**: Prisma ACID interactive transactions for checkout order creation and stock adjustments.

### Automated Testing
- **Backend**: Vitest + Supertest integration suite (14 tests covering TC01–TC20).
- **Frontend**: Vitest + React Testing Library + JSDOM (5 component tests covering image fallback, empty states, and formatting).

---

## 4. Repository Structure

```
vastra-store/
├── client/                     # Frontend React + Vite SPA
│   ├── src/
│   │   ├── components/         # Common UI, Layouts, and Product components
│   │   ├── pages/              # Storefront, Account, and Admin pages
│   │   ├── store/              # Zustand stores (authStore, cartStore)
│   │   ├── lib/                # API client, utilities, and helpers
│   │   ├── types/              # Unified TypeScript interfaces
│   │   ├── App.tsx             # Application route mappings
│   │   └── main.tsx            # Entry point with QueryClient & Router
│   ├── index.html              # HTML shell with Google Fonts
│   ├── tailwind.config.js      # Custom theme tokens & palette
│   └── vite.config.ts          # Vite configuration with /api proxy
├── server/                     # Backend Express REST API
│   ├── prisma/
│   │   ├── schema.prisma       # 20 relational models and constraints
│   │   ├── migrations/         # PostgreSQL schema migration files
│   │   └── seed.ts             # Deterministic seed script (26 products, coupons, users)
│   ├── src/
│   │   ├── config/             # Prisma client singleton & environment config
│   │   ├── middleware/         # Auth, validation, rate-limiter, and error handlers
│   │   ├── modules/            # Auth, Products, Categories, Cart, Orders, Admin, Wishlist, Coupons
│   │   ├── __tests__/          # Vitest + Supertest integration test suite
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # HTTP server bootstrap & graceful shutdown
├── docs/                       # Project documentation
│   ├── implementation-plan.md  # Implementation checklist and verification records
│   ├── requirements.md         # System requirements specification (SRS)
│   ├── user-stories.md         # Agile user stories with acceptance criteria
│   ├── database-erd.md         # Mermaid ER diagram and schema dictionary
│   ├── api-spec.yaml           # OpenAPI 3.0 specification
│   ├── test-plan.md            # Test matrix and TC01-TC20 execution results
│   ├── ai-usage-log.md         # AI engineering collaboration record
│   ├── user-guide.md           # Customer storefront shopping guide
│   ├── admin-guide.md          # Administrator operations manual
│   └── deployment.md           # Production deployment & hosting guide
├── package.json                # Monorepo workspaces configuration
└── README.md                   # Master project documentation
```

---

## 5. Getting Started & Installation

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **PostgreSQL**: Running locally or via cloud service (e.g. Supabase, Neon)

### 1. Clone & Install Dependencies
From the repository root:
```bash
npm install
```

### 2. Configure Environment Variables
Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
NODE_ENV=development

# PostgreSQL connection string
# (Encode special characters in password, e.g. @ as %40)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/vastra_db?schema=public"

JWT_SECRET="vastra-super-secret-jwt-key-2026-production"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
```

### 3. Run Database Migrations & Seed Data
```bash
# Apply Prisma migrations to PostgreSQL
npm run prisma:migrate --workspace=server

# Seed 26 realistic products, coupons, and seed accounts
npm run prisma:seed --workspace=server
```

### 4. Start Development Servers
Run both backend and frontend concurrently from the root:
```bash
npm run dev
```
- **Storefront Client**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/v1/health

---

## 6. Seed Accounts & Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Store Administrator** | `admin@vastrastore.com` | `Admin@12345` | Full Admin Dashboard (`/admin`) |
| **Demo Customer** | `customer@vastrastore.com` | `Customer@12345` | Customer Account (`/account`) |

---

## 7. Automated Testing & Verification

Execute the automated test suites:
```bash
# Run backend integration tests (14 tests covering TC01-TC20)
npm test --workspace=server

# Run frontend component tests (5 tests)
npm test --workspace=client

# Build verification for production
npm run build
```

---

## 8. Verified Test Cases Summary (TC01–TC20)

| ID | Description | Result |
|---|---|---|
| **TC01** | Homepage loads successfully | **PASSED** |
| **TC02** | Search returns matching products | **PASSED** |
| **TC03** | Add-to-cart creates expected item | **PASSED** |
| **TC04** | Quantity changes update totals correctly | **PASSED** |
| **TC05** | Zero, negative, and invalid quantities rejected | **PASSED** |
| **TC06** | Out-of-stock variants cannot be purchased | **PASSED** |
| **TC07** | Checkout rejects missing/invalid info | **PASSED** |
| **TC08** | Successful purchase creates order & confirmation | **PASSED** |
| **TC09** | Admin stock adjustments audited in inventory | **PASSED** |
| **TC10** | Mobile layout usable without horizontal overflow | **PASSED** |
| **TC11** | Empty search results display useful message | **PASSED** |
| **TC12** | Variant selection displays correct availability | **PASSED** |
| **TC13** | Manipulated client-side prices are ignored | **PASSED** |
| **TC14** | Customers cannot access other customers' orders | **PASSED** |
| **TC15** | Customers cannot call protected admin APIs | **PASSED** |
| **TC16** | Concurrent purchases cannot oversell final unit | **PASSED** |
| **TC17** | Duplicate payment notifications handled idempotently | **PASSED** |
| **TC18** | Invalid and expired coupons are rejected | **PASSED** |
| **TC19** | Filters and sorting consistent across pagination | **PASSED** |
| **TC20** | Failed product images display localized fallback | **PASSED** |

---

## 9. Known Limitations & Production Roadmap

1. **Simulated Payment Gateway**: The current version integrates a clearly disclosed simulated payment provider (`VASTRA_MOCK_PAYMENT`). Production deployment requires attaching a real payment gateway (Razorpay or Stripe) using signed server-side webhooks.
2. **Email Notification Service**: Password recovery and order confirmation emails currently log dispatch telemetry in development. Production deployment requires connecting an SMTP or transactional email provider (SendGrid, AWS SES, or Resend).
3. **Optional AI Shopping Assistant**: Integration hooks for grounded conversational recommendations via Gemini API are documented and ready for activation with an API key.

---

## 10. License

Designed and developed for **Vastra — Clothing & Accessories Store**.
All rights reserved.
