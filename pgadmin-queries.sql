-- =====================================================================
-- Vastra E-Commerce Platform — pgAdmin Scripting & Query Suite
-- Database: vastra_db
-- User: postgres
-- Description: Ready-to-run queries for administration, reporting & analytics
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. SYSTEM & STORAGE HEALTH
-- ---------------------------------------------------------------------

-- View all tables, row estimates, and disk size in vastra_db
SELECT 
    relname AS table_name,
    n_live_tup AS estimated_rows,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- View current active database connections
SELECT pid, usename, client_addr, state, query_start, query 
FROM pg_stat_activity 
WHERE datname = 'vastra_db';


-- ---------------------------------------------------------------------
-- 2. USER & AUTHENTICATION MANAGEMENT
-- ---------------------------------------------------------------------

-- List all registered accounts with role and registration timestamp
SELECT 
    id,
    email,
    "firstName",
    "lastName",
    role,
    phone,
    "createdAt"
FROM "User"
ORDER BY "createdAt" DESC;

-- List all addresses linked to users
SELECT 
    u.email,
    a."fullName",
    a."phone",
    a."streetAddress",
    a.city,
    a.state,
    a."postalCode",
    a."isDefaultShipping"
FROM "Address" a
JOIN "User" u ON u.id = a."userId"
ORDER BY u.email;

-- Recent admin audit logs
SELECT 
    l.id,
    u.email AS admin_email,
    l.action,
    l."entityType",
    l."entityId",
    l."ipAddress",
    l."createdAt"
FROM "AdminAuditLog" l
JOIN "User" u ON u.id = l."adminId"
ORDER BY l."createdAt" DESC
LIMIT 50;


-- ---------------------------------------------------------------------
-- 3. PRODUCT CATALOG & INVENTORY ANALYTICS
-- ---------------------------------------------------------------------

-- Product overview with category, price range, and total stock
SELECT 
    p.id,
    p.title,
    p.slug,
    c.name AS category_name,
    p."basePrice",
    p."isFeatured",
    p."isActive",
    COALESCE(SUM(v.stock), 0) AS total_stock_available,
    COUNT(v.id) AS variant_count
FROM "Product" p
JOIN "Category" c ON c.id = p."categoryId"
LEFT JOIN "ProductVariant" v ON v."productId" = p.id
GROUP BY p.id, p.title, p.slug, c.name, p."basePrice", p."isFeatured", p."isActive"
ORDER BY total_stock_available ASC;

-- Low stock alert (Variants with less than 15 items remaining)
SELECT 
    p.title AS product_name,
    v.sku,
    v.size,
    v.color,
    v.stock,
    v."priceOffset"
FROM "ProductVariant" v
JOIN "Product" p ON p.id = v."productId"
WHERE v.stock < 15
ORDER BY v.stock ASC;

-- Category distribution
SELECT 
    c.name AS category,
    c.slug,
    COUNT(p.id) AS total_products,
    ROUND(AVG(p."basePrice"), 2) AS avg_product_price
FROM "Category" c
LEFT JOIN "Product" p ON p."categoryId" = c.id
GROUP BY c.id, c.name, c.slug
ORDER BY total_products DESC;


-- ---------------------------------------------------------------------
-- 4. ORDERS & SALES PERFORMANCE
-- ---------------------------------------------------------------------

-- Sales summary by Order Status
SELECT 
    status,
    COUNT(id) AS total_orders,
    SUM("grandTotal") AS total_revenue
FROM "Order"
GROUP BY status
ORDER BY total_revenue DESC NULLS LAST;

-- Recent 20 Orders with customer name, items count, and grand total
SELECT 
    o."orderNumber",
    u.email AS customer_email,
    o.status,
    o."paymentStatus",
    o."grandTotal",
    COUNT(i.id) AS distinct_items_ordered,
    SUM(i.quantity) AS total_units,
    o."createdAt"
FROM "Order" o
JOIN "User" u ON u.id = o."userId"
JOIN "OrderItem" i ON i."orderId" = o.id
GROUP BY o.id, o."orderNumber", u.email, o.status, o."paymentStatus", o."grandTotal", o."createdAt"
ORDER BY o."createdAt" DESC
LIMIT 20;


-- ---------------------------------------------------------------------
-- 5. MARKETING, CARTS & COUPONS
-- ---------------------------------------------------------------------

-- Active discount coupons and usage counts
SELECT 
    c.code,
    c.type,
    c.value,
    c."minOrderAmount",
    c."usageCount",
    c."usageLimit",
    c."isActive",
    c."expiresAt"
FROM "Coupon" c
ORDER BY c."usageCount" DESC;

-- Active abandoned carts summary
SELECT 
    c.id AS cart_id,
    u.email AS user_email,
    COUNT(ci.id) AS items_in_cart,
    SUM(ci.quantity) AS total_items,
    c."updatedAt" AS last_active
FROM "Cart" c
LEFT JOIN "User" u ON u.id = c."userId"
JOIN "CartItem" ci ON ci."cartId" = c.id
GROUP BY c.id, u.email, c."updatedAt"
ORDER BY c."updatedAt" DESC;
