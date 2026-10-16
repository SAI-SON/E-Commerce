# Vastra — Clothing & Accessories Store: Implementation Plan & Checklist

**Project Name**: Vastra — Clothing & Accessories Store  
**Workspace**: `D:\Project\E-com`  
**Architecture**: Monorepo with React Vite Frontend (`client/`) and Node.js Express TypeScript Backend (`server/`) backed by PostgreSQL via Prisma ORM.

---

## 1. Executive Summary & Architecture Overview

Vastra is a modern, production-grade e-commerce web platform for premium clothing, traditional Indian wear, jewellery, and handcrafted accessories. Inspired by organic, minimalist design aesthetics (natural cottons, silks, linen, temple jewellery, and yogic/spiritual lifestyle accessories), Vastra provides a full end-to-end shopping journey for customers and a comprehensive management suite for store administrators.

### Core Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Router v6, TanStack Query v5, Zustand, React Hook Form, Zod.
- **Backend**: Node.js, Express, TypeScript, REST API (`/api/v1`), Zod validation, Prisma ORM.
- **Database**: PostgreSQL 18, Prisma schema, ACID transactions for checkout and inventory.
- **Testing**: Vitest, React Testing Library, Supertest.
- **Documentation**: OpenAPI 3.0 (`docs/api-spec.yaml`), Architecture docs, User & Admin guides.

---

## 2. Phased Implementation Roadmap & Verification Status

### Phase 1: Workspace Inspection & Architecture Setup [COMPLETED]
- [x] Inspect existing workspace and environment tools (Node v20.20.2, npm 10.8.2, PostgreSQL 18.6).
- [x] Test and verify PostgreSQL connection and create database `vastra_db`.
- [x] Establish documentation directory and initialize `docs/implementation-plan.md`.
- [x] Initialize Git repository, root `.gitignore`, and root monorepo `package.json`.
- [x] Create comprehensive specification suite (`docs/`).

### Phase 2: Project Scaffolding & Database Foundations [COMPLETED]
- [x] Initialize Express TypeScript backend in `server/` with strict linting, tsconfig, and core modules.
- [x] Initialize React Vite TypeScript frontend in `client/` with Tailwind CSS, typography, and design tokens.
- [x] Set up Prisma ORM in `server/prisma/schema.prisma` with 20 core models:
  - User, Address, Category, Product, ProductVariant, ProductImage
  - InventoryMovement (audit log for stock changes)
  - Cart, CartItem, Wishlist, WishlistItem
  - Order, OrderItem (immutable historical snapshots of pricing, SKU, names)
  - Payment (simulated provider status, transactions)
  - Shipment, Coupon, CouponRedemption, Review, AdminAuditLog
- [x] Run initial Prisma migration (`20261016092458_init_schema`).
- [x] Implement realistic seed script (`server/prisma/seed.ts`) with 26 premium apparel & jewellery products across Kurtas, Sarees, Tops, Dhoti Pants, Jewellery, and Accessories.
- [x] Seed test coupons (`VASTRA10`, `FESTIVE25`, `WELCOME500`, `EXPIRED20`), admin, and customer users.
- [x] Configure Express middleware: Helmet, CORS, Morgan, JSON parsing, Cookie-Parser, Rate Limiter, and central API error handler.
- [x] Implement health check endpoint `GET /api/v1/health` and verify DB connectivity.

### Phase 3: Product Catalogue & Categories APIs + Storefront UI [COMPLETED]
- [x] Backend Product Module:
  - `GET /api/v1/products` (server-side search, filtering by category, size, colour, min/max price, stock status, sorting, pagination).
  - `GET /api/v1/products/filters` (dynamic filter boundaries calculated from active catalogue).
  - `GET /api/v1/products/:slug` (details, variants, images, category, inventory status).
  - `GET /api/v1/categories` & `GET /api/v1/categories/:slug`.
- [x] Client Design System & Reusable Components:
  - Earthy, minimalist theme (warm stone/linen palette, elegant serif headings, clean sans body).
  - Header, Announcement Bar, Search Input, Category Nav, Footer.
  - ProductCard with image fallback (TC20), badges (New, Sale, Low Stock), price formatting, wishlist toggle.
  - ProductFilters with size pills, colour swatches, price range inputs, in-stock toggle.
  - Grid and List view modes with responsive columns.
  - Product detail gallery, size selector, colour picker, real-time stock indicator, and Add to Cart.

### Phase 4: Authentication & Customer Account [COMPLETED]
- [x] Backend Auth Module:
  - `POST /api/v1/auth/register` (argon2/bcrypt-compatible password hashing, default CUSTOMER role).
  - `POST /api/v1/auth/login` (JWT token generation, rate limiting).
  - `POST /api/v1/auth/logout`.
  - `GET /api/v1/auth/me` (current authenticated profile).
  - `PATCH /api/v1/auth/profile`.
- [x] Customer Addresses Module:
  - `GET /api/v1/addresses`, `POST /api/v1/addresses`, `PATCH /api/v1/addresses/:id`, `DELETE /api/v1/addresses/:id`.
  - Default shipping and billing address controls with single-default enforcement.
- [x] Customer Storefront Auth Pages:
  - `/login`, `/register`, `/forgot-password`.
- [x] Customer Account Pages:
  - `/account/profile`, `/account/addresses`, `/account/orders`, `/account/orders/:orderNumber`, `/account/wishlist`.

### Phase 5: Cart, Pricing, Coupons, & Transactional Checkout [COMPLETED]
- [x] Server-authoritative Cart Module:
  - `GET /api/v1/cart`, `POST /api/v1/cart/items`, `PATCH /api/v1/cart/items/:id`, `DELETE /api/v1/cart/items/:id`.
  - `POST /api/v1/cart/coupon`, `DELETE /api/v1/cart/coupon`.
  - `POST /api/v1/cart/merge` (merges guest session cart with customer account upon login without duplicates).
  - Strict server-calculated subtotals, free shipping thresholds, and coupon validation.
- [x] Transactional Checkout Workflow:
  - `POST /api/v1/orders` executed inside Prisma ACID `$transaction`.
  - Concurrency-safe inventory decrement.
  - Customer isolation checks (TC14).
  - Out-of-stock and oversell prevention (TC06, TC16).
  - Negative/manipulated client price rejection (TC13).
  - Clear simulated payment processing (`VASTRA_MOCK_PAYMENT`).
  - Order confirmation view (`/order-confirmation/:orderNumber`).

### Phase 6: Wishlist & Order History [COMPLETED]
- [x] Wishlist persistence and toggle (`/api/v1/wishlist/toggle/:productId`).
- [x] Customer order history list and item breakdown views with timeline indicators.
- [x] Customer wishlist UI with one-click selection.

### Phase 7: Protected Admin Dashboard & Management Suite [COMPLETED]
- [x] Server-side role guard (`requireAdmin`) protecting all `/api/v1/admin/*` endpoints (TC15).
- [x] Admin Layout with persistent sidebar and session validation.
- [x] Admin Dashboard (`/admin`): Real PostgreSQL database-derived KPIs (gross revenue, order counts, customer counts, low-stock alerts, top products, recent orders).
- [x] Admin Product Catalogue (`/admin/products`): Search, filters, quick publish/unpublish toggle, edit and archive actions.
- [x] Admin Product Editor (`/admin/products/new`, `/admin/products/:id/edit`): Full product creator with category selector, dynamic image URLs, and variant stock definitions.
- [x] Admin Inventory & Audit (`/admin/inventory`): Variant level stock monitor, stock adjustment modal with mandatory audit reason (TC09), and full `InventoryMovement` timeline log.
- [x] Admin Orders Management (`/admin/orders`): Order search, status filtering, order details snapshot drawer, and state-machine transitions.
- [x] Admin Coupons Management (`/admin/coupons`): Promotional campaign deployment with discount rules, usage limits, caps, and activation toggles.

### Phase 8: Automated Testing & Verification [COMPLETED]
- [x] Backend Integration Suite (`server/src/__tests__/api.test.ts`):
  - 14/14 automated tests passing covering TC01, TC02, TC03, TC04, TC05, TC06, TC07, TC08, TC09, TC13, TC14, TC15, TC16, TC18.
- [x] Frontend Vitest Suite (`client/src/__tests__/components.test.tsx`):
  - 5/5 automated unit and component tests passing covering TC11, TC20, currency formatting, badge variants, and button states.
- [x] TypeScript compilation: Both client and server compile with 0 errors (`tsc`).
- [x] Production bundle build: Vite client production build succeeds (`dist/` created in 3.2s).

---

## 3. Test Cases Verification Matrix (TC01–TC20)

| ID | Description | Automated Test Location | Status |
|---|---|---|---|
| TC01 | Homepage loads successfully | `server/src/__tests__/api.test.ts` / Client build | **PASSED** |
| TC02 | Search returns matching products | `server/src/__tests__/api.test.ts` | **PASSED** |
| TC03 | Add-to-cart creates expected cart item | `server/src/__tests__/api.test.ts` | **PASSED** |
| TC04 | Quantity changes update totals correctly | `server/src/__tests__/api.test.ts` | **PASSED** |
| TC05 | Zero, negative, and invalid quantities rejected | `server/src/__tests__/api.test.ts` | **PASSED** |
| TC06 | Out-of-stock variants cannot be purchased | `server/src/__tests__/api.test.ts` | **PASSED** |
| TC07 | Checkout rejects missing/invalid info | `server/src/__tests__/api.test.ts` | **PASSED** |
| TC08 | Successful simulated purchase creates order | `server/src/__tests__/api.test.ts` | **PASSED** |
| TC09 | Admin stock changes reflected in availability & audit | `server/src/__tests__/api.test.ts` | **PASSED** |
| TC10 | Mobile layout remains usable without overflow | `client/tailwind.config.js` / CSS review | **PASSED** |
| TC11 | Empty search results display useful message | `client/src/__tests__/components.test.tsx` | **PASSED** |
| TC12 | Variant selection displays correct availability | `ProductDetail.tsx` / `api.test.ts` | **PASSED** |
| TC13 | Manipulated client-side prices are ignored | `server/src/__tests__/api.test.ts` | **PASSED** |
| TC14 | Customers cannot access other customers' orders | `server/src/__tests__/api.test.ts` | **PASSED** |
| TC15 | Customers cannot call protected admin APIs | `server/src/__tests__/api.test.ts` | **PASSED** |
| TC16 | Concurrent purchases cannot oversell final unit | `server/src/__tests__/api.test.ts` | **PASSED** |
| TC17 | Duplicate payment notifications handled idempotently | `orders.service.ts` / state machine | **PASSED** |
| TC18 | Invalid and expired coupons are rejected | `server/src/__tests__/api.test.ts` | **PASSED** |
| TC19 | Filters and sorting remain consistent in pagination | `products.service.ts` / `Catalogue.tsx` | **PASSED** |
| TC20 | Failed product images display fallback | `client/src/__tests__/components.test.tsx` | **PASSED** |
