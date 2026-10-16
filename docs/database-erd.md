# Vastra E-Commerce Platform — Database Entity-Relationship Diagram (ERD)

## 1. Database Architecture Overview

The Vastra database is implemented in **PostgreSQL 18** and managed with **Prisma ORM**. It adheres to third normal form (3NF) relational design principles, with explicit foreign keys, composite unique constraints, indexes for query performance, and decimal-safe types for financial amounts.

### Key Architectural Tenets
1. **Decimal-Safe Financials**: All prices, subtotals, discounts, and payments are stored as `Decimal(10,2)` or integer cents to avoid floating-point inaccuracies.
2. **Historical Immutability**: Order lines (`OrderItem`) and address records on orders (`shippingAddressSnapshot`) store deep snapshots of historical state to preserve accounting integrity if product titles, prices, or customer addresses change later.
3. **Auditability**: Every manual inventory adjustment creates an entry in `InventoryMovement`, and every administrative action creates an `AdminAuditLog` record.
4. **ACID Transaction Boundary**: Checkout order creation, inventory decrements, and coupon redemptions occur inside a concurrency-safe PostgreSQL transaction.

---

## 2. Mermaid Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Address : "has saved"
    User ||--o| Cart : "owns"
    User ||--o| Wishlist : "curates"
    User ||--o{ Order : "places"
    User ||--o{ Review : "authors"
    User ||--o{ AdminAuditLog : "executes"
    User ||--o{ CouponRedemption : "redeems"

    Category ||--o{ Category : "has parent/children"
    Category ||--o{ Product : "classifies"

    Product ||--|{ ProductVariant : "has variants"
    Product ||--|{ ProductImage : "displays"
    Product ||--o{ WishlistItem : "saved in"
    Product ||--o{ Review : "receives"

    ProductVariant ||--o{ CartItem : "referenced in"
    ProductVariant ||--o{ OrderItem : "originates"
    ProductVariant ||--o{ InventoryMovement : "audited by"

    Cart ||--o{ CartItem : "contains"
    Wishlist ||--o{ WishlistItem : "contains"

    Order ||--|{ OrderItem : "consists of"
    Order ||--o| Payment : "settled by"
    Order ||--o| Shipment : "fulfilled by"
    Order ||--o{ CouponRedemption : "applied"

    Coupon ||--o{ CouponRedemption : "tracked by"

    User {
        string id PK "UUID"
        string email UK
        string passwordHash
        string firstName
        string lastName
        enum role "CUSTOMER | ADMIN"
        string phone
        datetime createdAt
        datetime updatedAt
    }

    Address {
        string id PK "UUID"
        string userId FK
        string fullName
        string phone
        string streetAddress
        string apartment
        string city
        string state
        string postalCode
        string country
        boolean isDefaultShipping
        boolean isDefaultBilling
    }

    Category {
        string id PK "UUID"
        string name
        string slug UK
        string description
        string parentId FK
        int sortOrder
        boolean isActive
    }

    Product {
        string id PK "UUID"
        string name
        string slug UK
        string description
        string material
        string careInstructions
        string categoryId FK
        boolean isPublished
        boolean isFeatured
        boolean isNewArrival
        string_array tags
    }

    ProductVariant {
        string id PK "UUID"
        string productId FK
        string sku UK
        string size
        string colour
        string colourHex
        decimal price
        decimal salePrice
        int stockQuantity
        boolean isActive
    }

    InventoryMovement {
        string id PK "UUID"
        string variantId FK
        int changeQuantity
        int previousStock
        int newStock
        string reason
        string adminUserId FK
        datetime createdAt
    }

    Cart {
        string id PK "UUID"
        string userId FK "nullable"
        string guestSessionId UK "nullable"
        string couponCode
    }

    CartItem {
        string id PK "UUID"
        string cartId FK
        string variantId FK
        int quantity
    }

    Order {
        string id PK "UUID"
        string orderNumber UK
        string userId FK "nullable"
        string customerEmail
        string customerPhone
        json shippingAddressSnapshot
        json billingAddressSnapshot
        enum status "PENDING_PAYMENT | CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED | REFUNDED"
        decimal subtotal
        decimal discountTotal
        decimal shippingTotal
        decimal grandTotal
        string couponCode
        string notes
    }

    OrderItem {
        string id PK "UUID"
        string orderId FK
        string variantId FK "nullable"
        string productName
        string sku
        string size
        string colour
        decimal unitPrice
        int quantity
        decimal subtotal
    }

    Payment {
        string id PK "UUID"
        string orderId FK UK
        string provider
        string transactionId UK
        decimal amount
        enum status "PENDING | COMPLETED | FAILED | REFUNDED"
        string paymentMethod
    }

    Coupon {
        string id PK "UUID"
        string code UK
        enum discountType "PERCENTAGE | FIXED_AMOUNT"
        decimal discountValue
        decimal minPurchaseAmount
        decimal maxDiscountAmount
        int usageLimit
        int usageCount
        datetime expiryDate
        boolean isActive
    }
```

---

## 3. Database Constraints & Indexing Strategy

| Index Name | Table | Columns | Type | Purpose |
|---|---|---|---|---|
| `users_email_key` | User | `email` | UNIQUE | Enforces unique email per user account |
| `products_slug_key` | Product | `slug` | UNIQUE | SEO-friendly URL lookup |
| `product_variants_sku_key` | ProductVariant | `sku` | UNIQUE | Authoritative physical barcode/SKU uniqueness |
| `orders_orderNumber_key` | Order | `orderNumber` | UNIQUE | Human-readable unique identifier (e.g. `VAS-20261016-1001`) |
| `coupons_code_key` | Coupon | `code` | UNIQUE | Case-insensitive coupon redemption lookup |
| `idx_product_category_published` | Product | `categoryId, isPublished` | COMPOSITE | Optimizes category navigation queries |
| `idx_variant_product_price` | ProductVariant | `productId, price` | COMPOSITE | Optimizes catalogue sorting and price filtering |
| `idx_orders_user_created` | Order | `userId, createdAt` | COMPOSITE | Optimizes customer order history queries |
| `idx_inventory_variant_created` | InventoryMovement | `variantId, createdAt` | COMPOSITE | Speeds up variant audit trail logs |

---

## 4. Transactional Integrity Guarantees

### Checkout Transaction (`POST /api/v1/orders`)
```ts
await prisma.$transaction(async (tx) => {
  // 1. Lock and retrieve authoritative variants
  // 2. Verify stock sufficiency inside transaction
  // 3. Decrement stockQuantity
  // 4. Log initial purchase movement
  // 5. Increment coupon usageCount
  // 6. Write Order & OrderItem snapshots
  // 7. Write Payment record
  // 8. Clear user Cart lines
});
```

### Cancellation Restock (`PATCH /api/v1/admin/orders/:id/status`)
```ts
if (newStatus === OrderStatus.CANCELLED) {
  for (const item of order.items) {
    if (item.variantId) {
      // Transactionally restores units back to variant stock
      // Logs RESTOCK movement with Order number reference
    }
  }
}
```
