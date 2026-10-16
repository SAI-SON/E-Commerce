# Vastra E-Commerce Platform — System Requirements Specification (SRS)

## 1. Introduction & Vision

**Vastra** is a modern, production-oriented online shopping platform for handcrafted Indian wear, pure organic linen and cotton clothing, traditional temple jewellery, and yogic accessories. Inspired by clean, serene lifestyle aesthetics, the platform delivers a serene and friction-free shopping journey for discerning customers and an authoritative, auditable control center for store administrators.

---

## 2. User Roles & Personas

1. **Guest Visitor (Unauthenticated)**:
   - Browses catalog, searches, filters, views variants, adds items to persistent guest session cart, and can register or log in seamlessly.
2. **Authenticated Customer**:
   - Manages personal profile, saves multiple shipping and billing addresses, maintains a persistent cart, applies coupons, completes checkout, reviews order history and order tracking, and curates a wishlist.
3. **Store Administrator**:
   - Possesses cryptographically verified server-side `ADMIN` privileges. Manages product definitions, image galleries, variants, executes auditable inventory adjustments, controls order lifecycle state transitions, creates coupon campaigns, and monitors real database KPIs.

---

## 3. Functional Requirements (FR)

### 3.1 Storefront & Catalogue
- **FR01: Server-Side Product Filtering**: Customers can filter products by Category, Price Range, Available Sizes, Colours, and In-Stock availability with pagination and allowlisted sorting (Newest, Price Low-High, Price High-Low). Filtering must occur on the database.
- **FR02: Full-Text Keyword Search**: Real-time server-side product search across names, descriptions, and tags.
- **FR03: Product Variant Resolution**: Every apparel piece supports multi-attribute variants (Size and Colour). Selection updates real-time stock availability, SKU, and unit prices.
- **FR04: Graceful Image Fallbacks**: Missing or broken image URLs must immediately render a lightweight, embedded SVG fallback without disrupting page geometry (TC20).

### 3.2 Cart & Pricing Consistency
- **FR05: Authoritative Server Calculation**: The server is the sole authority for item subtotals, shipping charges, discount deductions, and grand totals. Client-provided prices are completely discarded (TC13).
- **FR06: Cart Persistence & Merging**: Guest carts are tracked via `X-Guest-Session-Id`. Upon customer login, guest items automatically merge with the customer's database cart without creating duplicate line items.
- **FR07: Promotional Coupon Engine**: Supports percentage-based and fixed-amount discounts with optional minimum cart thresholds, maximum discount caps, per-coupon usage limits, and expiration dates. Expired, invalid, or sub-threshold coupons are rejected with explicit feedback (TC18).

### 3.3 Checkout & Transactional Order Placement
- **FR08: ACID Checkout Transaction**: Order creation, inventory deduction, coupon redemption increment, and payment snapshot occur within a single database transaction (`prisma.$transaction`).
- **FR09: Oversell & Concurrency Prevention**: If two customers attempt to purchase the last unit simultaneously, only one succeeds; the second receives an out-of-stock rejection (TC06, TC16).
- **FR10: Immutable Order Snapshots**: Orders preserve immutable historical snapshots of product name, SKU, unit price, quantity, and complete delivery address at time of purchase.
- **FR11: Transparent Simulated Payments**: Integrates a clearly disclosed mock payment provider (`VASTRA_MOCK_PAYMENT`) generating authentic transaction identifiers without pretending to process live currency.

### 3.4 Customer Account
- **FR12: Address Book Management**: Customers can save multiple addresses with explicit default shipping and billing designations.
- **FR13: Customer Isolation**: Customers can only access their own private profile, orders, and addresses (TC14).
- **FR14: Customer Wishlist**: Authenticated customers can toggle items into a personal wishlist and transition them directly into cart.

### 3.5 Administrator Management Suite
- **FR15: Server-Side Role Protection**: Every administrative endpoint (`/api/v1/admin/*`) is strictly guarded on the backend using JWT role verification (TC15).
- **FR16: Database-Derived Dashboard Statistics**: Real-time calculation of gross revenue, total orders, completed deliveries, pending shipments, customer accounts, and low-stock warnings directly from PostgreSQL.
- **FR17: Product Lifecycle Management**: Administrators can create, edit metadata, configure variants and SKUs, toggle publication, and soft-delete/archive products.
- **FR18: Auditable Inventory Adjustments**: Every manual stock change requires a documented business reason, logs previous/new stock levels in `InventoryMovement`, and strictly prevents negative inventory (TC09).
- **FR19: Order Status State Machine**: Order transitions are strictly governed:
  - `PENDING_PAYMENT` → `CONFIRMED` or `CANCELLED`
  - `CONFIRMED` → `PROCESSING` or `CANCELLED`
  - `PROCESSING` → `SHIPPED` or `CANCELLED`
  - `SHIPPED` → `DELIVERED`
  - `DELIVERED` → `REFUNDED`
  - `CANCELLED` restocks inventory transactionally.
- **FR20: Coupon Campaign Deployment**: Administrators can deploy and toggle active coupon codes.

---

## 4. Non-Functional Requirements (NFR)

- **NFR01: Security & Cryptography**: Passwords hashed using bcrypt/argon2 with salt. Auth sessions secured via signed JWT tokens. Helmet security headers and CORS whitelisting enforced.
- **NFR02: Database Integrity & Normalization**: Native PostgreSQL relational schema with foreign key constraints, cascading rules, unique indexes, and decimal precision for currency.
- **NFR03: Performance**: Database queries leverage targeted composite indexes (`idx_product_category_published`, `idx_product_variant_price`, etc.). Client uses TanStack Query caching for instant navigation.
- **NFR04: Responsive Design & Viewport Support**: Flawless responsive layout across mobile (<640px), tablet (640px–1024px), and desktop (>1024px) without horizontal scrolling or layout shifts (TC10).
- **NFR05: Accessibility (a11y)**: Semantic HTML5 landmarks, visible focus rings, ARIA labels on icon buttons, contrast compliant typography.
