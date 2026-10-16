# Vastra E-Commerce Platform — User Stories & Acceptance Criteria

This document outlines the agile user stories and concrete Given-When-Then acceptance criteria governing the Vastra e-commerce application.

---

## Story 1: Catalogue Browsing & Faceted Filtering
**As a** customer seeking organic handloom apparel,  
**I want to** filter products by category, size, colour, price range, and in-stock status,  
**So that** I can effortlessly find garments tailored to my aesthetic and size preferences without loading unnecessary items.

### Acceptance Criteria
- **Scenario 1: Applying multi-facet filters**
  - **Given** I am on the `/products` catalogue page,
  - **When** I select category "Kurtas", size "L", and in-stock only,
  - **Then** the URL query string updates to reflect these parameters,
  - **And** the server executes a parameterized query returning only matching published garments,
  - **And** pagination counts accurately reflect matching records.
- **Scenario 2: Empty search results**
  - **Given** I search for a keyword that does not exist in the catalogue,
  - **When** the query returns 0 results,
  - **Then** a graceful Empty State is displayed offering a "Reset Filters" action (TC11).

---

## Story 2: Product Variant Selection & Real-Time Stock
**As a** customer viewing a specific clothing item,  
**I want to** choose my size and colour variant,  
**So that** I see the exact SKU, price, discount percentage, and stock quantity before purchasing.

### Acceptance Criteria
- **Scenario 1: Selecting an available variant**
  - **Given** I am on a product page `/products/:slug`,
  - **When** I choose size "M" and colour "Natural Off-White",
  - **Then** the stock status updates to display "In Stock (15 available)",
  - **And** the unit price and sale price adjust to the variant's pricing.
- **Scenario 2: Out of stock prevention**
  - **Given** a variant has `stockQuantity: 0`,
  - **When** I select this variant,
  - **Then** the Add to Cart button becomes disabled displaying "Sold Out",
  - **And** the customer cannot submit the item to the cart (TC06).

---

## Story 3: Cart Management & Guest Cart Merging
**As a** guest shopper who subsequently registers or signs in,  
**I want** items placed in my cart before login to automatically transfer to my account,  
**So that** I do not lose my selected items during the checkout flow.

### Acceptance Criteria
- **Scenario 1: Guest cart addition**
  - **Given** I am not logged in,
  - **When** I add a product variant to my cart,
  - **Then** a guest cart is created in PostgreSQL mapped to my `X-Guest-Session-Id` header.
- **Scenario 2: Cart merge upon authentication**
  - **Given** I have 2 items in my guest cart,
  - **When** I log in at `/login`,
  - **Then** the server merges the guest cart lines into my user cart,
  - **And** duplicate lines for identical variants combine their quantities up to available stock.

---

## Story 4: Promotional Coupon Application
**As a** customer with a promotional coupon code,  
**I want to** enter the code in the shopping cart,  
**So that** I receive the promised percentage or fixed discount on my purchase.

### Acceptance Criteria
- **Scenario 1: Valid coupon application**
  - **Given** my cart subtotal meets the coupon's minimum spend,
  - **When** I enter code `VASTRA10`,
  - **Then** the server calculates a 10% discount subject to the coupon's cap,
  - **And** the grand total reflects the discount immediately.
- **Scenario 2: Expired or sub-threshold coupon**
  - **Given** code `EXPIRED20` has an expiry date in the past,
  - **When** I attempt to apply it,
  - **Then** the server returns HTTP 400 with "This coupon has expired",
  - **And** no discount is applied (TC18).

---

## Story 5: ACID Transactional Checkout
**As a** customer ready to complete my purchase,  
**I want to** submit my delivery details and simulated payment in a secure transaction,  
**So that** my order is reliably placed, stock is decremented, and I receive a verified confirmation number.

### Acceptance Criteria
- **Scenario 1: Successful purchase**
  - **Given** all items in my cart are available in authoritative stock,
  - **When** I submit the checkout form with shipping address,
  - **Then** the server executes an ACID database transaction:
    1. Verifies prices and stock,
    2. Decrements `stockQuantity` on each purchased variant,
    3. Increments coupon usage count if applied,
    4. Records the order with immutable snapshot lines,
    5. Clears the cart,
  - **And** redirects to `/order-confirmation/:orderNumber` displaying the order breakdown (TC08).
- **Scenario 2: Concurrency & overselling protection**
  - **Given** only 1 unit remains in stock for variant SKU `KRT-01-M`,
  - **When** two shoppers submit orders concurrently,
  - **Then** only one transaction commits successfully,
  - **And** the second shopper receives an out-of-stock notification with 0 units sold past zero (TC16).

---

## Story 6: Customer Private Order History & Isolation
**As a** registered customer,  
**I want to** view my past orders and delivery statuses in my account,  
**So that** I can track fulfillment and retain my receipts.

### Acceptance Criteria
- **Scenario 1: Viewing private orders**
  - **Given** I am logged in,
  - **When** I navigate to `/account/orders`,
  - **Then** only orders placed under my `userId` are retrieved.
- **Scenario 2: Customer resource ownership check**
  - **Given** Customer A attempts to view `/api/v1/orders/VAS-CUSTOMER-B`,
  - **When** the server processes the request,
  - **Then** the backend returns HTTP 404/403 preventing data leakage (TC14).

---

## Story 7: Administrator Live Performance Dashboard
**As a** store administrator,  
**I want to** inspect live sales totals, pending fulfillment counts, and low-stock alerts,  
**So that** I have operational awareness of store performance.

### Acceptance Criteria
- **Scenario 1: Authoritative KPI rendering**
  - **Given** I am authenticated with `ADMIN` role,
  - **When** I open `/admin`,
  - **Then** the dashboard renders gross sales, total orders, completed deliveries, and top products derived directly from PostgreSQL.
- **Scenario 2: Low-stock warnings**
  - **Given** 3 variants have stock $\le 5$,
  - **When** I view the dashboard,
  - **Then** a prominent warning banner lists each low-stock SKU with quick links to restock.

---

## Story 8: Administrator Auditable Inventory Adjustments
**As a** warehouse or store administrator,  
**I want to** adjust variant stock levels with a documented reason,  
**So that** every inventory movement is logged and traceable.

### Acceptance Criteria
- **Scenario 1: Positive restock**
  - **Given** a new shipment has arrived,
  - **When** I adjust variant stock by +20 units with reason "RESTOCK_SHIPMENT_VARA_02",
  - **Then** variant `stockQuantity` increases by 20,
  - **And** an entry is logged in `InventoryMovement` recording previous, change, and new stock (TC09).
- **Scenario 2: Negative stock prohibition**
  - **Given** current stock is 5,
  - **When** I attempt an adjustment of -10,
  - **Then** the server rejects the request with HTTP 400 preventing negative inventory.

---

## Story 9: Administrator Order Lifecycle Management
**As a** store administrator processing orders,  
**I want to** advance order statuses according to compliant transition rules,  
**So that** orders flow logically from confirmation through delivery or cancellation.

### Acceptance Criteria
- **Scenario 1: Valid status progression**
  - **Given** an order is currently `CONFIRMED`,
  - **When** I update status to `PROCESSING` with dispatch notes,
  - **Then** the status updates successfully and audit logs the change.
- **Scenario 2: Restock on cancellation**
  - **Given** an order with 2 units is `PROCESSING`,
  - **When** the administrator cancels the order (`CANCELLED`),
  - **Then** the server transactionally restores the 2 units to variant inventory and logs the restock movement.
