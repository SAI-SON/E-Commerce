# Vastra E-Commerce Platform — Store Administrator Guide

This guide details the administrative control panel for managing products, inventory, customer orders, promotional campaigns, and store telemetry on **Vastra**.

---

## 1. Accessing the Admin Control Panel

Administrative privileges require an authenticated user with role `ADMIN`. Public registration exclusively creates `CUSTOMER` accounts; administrative accounts must be provisioned through server seed scripts or secure database operations.

- **Default Seed Admin Credentials**:
  - **Email**: `admin@vastrastore.com`
  - **Password**: `Admin@12345`
- **Admin Entry Route**: Navigate to `/admin`. Unauthenticated or customer accounts attempting access are immediately redirected to `/login` with an unauthorized response.

---

## 2. Store Performance Dashboard (`/admin`)

The Overview dashboard displays authoritative, database-calculated metrics directly from PostgreSQL:
- **Gross Store Sales**: Total value of confirmed, processed, and delivered customer orders.
- **Total Orders**: All orders placed through the platform, with a breakdown of orders awaiting fulfillment.
- **Completed Orders**: Orders successfully delivered to customers.
- **Customer Accounts**: Number of registered buyers.
- **Low-Stock Alert Banner**: Prominently highlights all variants where current `stockQuantity` $\le 5$, allowing warehouse staff to initiate restocks before items sell out.
- **Recent Orders Table**: Real-time log of incoming orders with customer details and status badges.
- **Top Performing Products**: Leaderboard ranking products by units sold and generated revenue.

---

## 3. Product Catalogue Management (`/admin/products`)

### 3.1 Browsing & Searching Products
- Search by product title or slug.
- View primary image, assigned category, base price, total units in stock across all variants, and published status.

### 3.2 Creating a New Product (`/admin/products/new`)
1. **Core Details**: Enter Product Title, URL Slug (auto-derived), Category, Search Tags, Short Summary, Full Description, Material & Weave composition, and Care Instructions.
2. **Flags**: Toggle "Published on Storefront", "Featured Showcase", or "New Arrival Ribbon".
3. **Imagery**: Add one or more high-resolution image URLs, specify Alt Text, and designate the Primary image.
4. **Initial Variants**: Configure individual sizes (S, M, L, XL), colours, SKUs (e.g. `KRT-01-M`), regular price, optional sale price, and starting stock.

### 3.3 Editing & Archiving Products
- **Edit Details** (`/admin/products/:id/edit`): Update product descriptions, care instructions, or tags.
- **Publish / Unpublish Toggle**: Click the Eye icon to immediately toggle public visibility on the customer storefront.
- **Archive Product**: Clicking the Trash icon unpublishes the piece and logs the administrative action in `AdminAuditLog`.

---

## 4. Inventory Tracking & Auditing (`/admin/inventory`)

Vastra enforces strict stock governance to prevent overselling and maintain audit trails.

### 4.1 Stock Levels Monitor
- View variant-level stock categorized by SKU, size, and colour.
- Variants with $\le 5$ units display a yellow "Low Stock" badge; 0 units display a red "Out of Stock" badge.

### 4.2 Executing a Stock Adjustment
1. Click **Adjust Stock** next to any variant.
2. Enter the **Adjustment Units**: Positive numbers (+15) for new stock arrivals; negative numbers (-2) for damaged or inspected items.
3. Enter a **Mandatory Audit Reason**: e.g., `RESTOCK_SHIPMENT_VARA_02` or `SAMPLE_INSPECTION`.
4. The system calculates the projected new stock:
   - **Negative Stock Prohibition**: If an adjustment would cause stock to drop below 0, the operation is blocked with an error.
5. Click **Confirm Adjustment**: The transaction writes the new stock level and creates a permanent entry in `InventoryMovement`.

### 4.3 Movement Audit Log Tab
Inspect the immutable historical timeline showing timestamp, SKU, previous stock, quantity change (+/-), new stock, audit reason, and admin user.

---

## 5. Order Management & State Machine (`/admin/orders`)

### 5.1 Order Oversight
- Filter orders by status (`PENDING_PAYMENT`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- Search by order number, customer name, or customer email.

### 5.2 Status Transitions
Click **Update Status** to execute permitted state transitions:
```
PENDING_PAYMENT ──> CONFIRMED ──> PROCESSING ──> SHIPPED ──> DELIVERED ──> REFUNDED
       │                  │             │
       └──> CANCELLED <───┴─────────────┘
```

> [!IMPORTANT]
> **Cancellation Restock Rule**: Transitioning an order to `CANCELLED` automatically restores the purchased quantities to their respective variant inventories and logs an `ADMIN_CANCELLED_RESTOCK` entry in `InventoryMovement`.

### 5.3 Order Inspection Drawer
Click **Details** to review immutable snapshots of purchased garments, sizes, unit prices, applied coupons, delivery addresses, and payment transaction IDs.

---

## 6. Promotional Coupons (`/admin/coupons`)

Deploy promotional discounts to drive seasonal campaigns:
1. Click **New Coupon Campaign**.
2. Set **Coupon Code** (e.g., `DIWALI20` — automatically capitalized).
3. Select **Discount Type**: `PERCENTAGE` (%) or `FIXED_AMOUNT` (₹).
4. Set **Discount Value**, optional **Max Discount Cap**, **Min Subtotal Required**, and **Usage Cap Limit**.
5. Set an optional **Expiry Date & Time**.
6. Toggle campaigns active or inactive with a single click.
