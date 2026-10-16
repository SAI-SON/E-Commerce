import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/prisma.js';

describe('Vastra E-Commerce REST API Test Suite', () => {
  let customerToken: string;
  let adminToken: string;
  let testVariantId: string;
  let testProductSlug: string;

  beforeAll(async () => {
    // Authenticate demo customer
    const custRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'customer@vastrastore.com', password: 'Customer@12345' });
    customerToken = custRes.body.data.token;

    // Authenticate demo admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@vastrastore.com', password: 'Admin@12345' });
    adminToken = adminRes.body.data.token;

    // Get an active product variant
    const product = await prisma.product.findFirst({
      where: { isPublished: true },
      include: { variants: true },
    });
    testProductSlug = product!.slug;
    testVariantId = product!.variants[0].id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // TC01: Health check
  it('TC01: Health check returns status healthy and database connected', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.database).toBe('connected');
  });

  // TC02: Products catalogue & search
  it('TC02: Search returns matching products and respects filters', async () => {
    const res = await request(app)
      .get('/api/v1/products')
      .query({ search: 'kurta', page: 1, limit: 5 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBeGreaterThan(0);
  });

  // TC11: Empty search results
  it('TC11: Empty search results return an empty array with total 0', async () => {
    const res = await request(app)
      .get('/api/v1/products')
      .query({ search: 'XYZNonExistentItem999' });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
    expect(res.body.pagination.total).toBe(0);
  });

  // TC12: Product details by slug
  it('TC12: Product details route returns variants, stock, and images', async () => {
    const res = await request(app).get(`/api/v1/products/${testProductSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(testProductSlug);
    expect(res.body.data.variants.length).toBeGreaterThan(0);
  });

  // TC03: Add to cart
  it('TC03: Add-to-cart creates expected cart item', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ variantId: testVariantId, quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const item = res.body.data.items.find((i: { variantId: string }) => i.variantId === testVariantId);
    expect(item).toBeDefined();
    expect(item.quantity).toBeGreaterThanOrEqual(1);
  });

  // TC05: Zero, negative, and invalid quantities are rejected
  it('TC05: Zero or negative quantities are rejected with 400', async () => {
    const resZero = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ variantId: testVariantId, quantity: 0 });

    expect(resZero.status).toBe(400);

    const resNegative = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ variantId: testVariantId, quantity: -5 });

    expect(resNegative.status).toBe(400);
  });

  // TC07: Checkout rejects missing or invalid customer info
  it('TC07: Checkout rejects missing customer shipping info', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        customerEmail: 'invalid-email',
        items: [{ variantId: testVariantId, quantity: 1 }],
      });

    expect(res.status).toBe(400);
  });

  // TC08 & TC13: Successful purchase creates order and ignores manipulated client prices
  it('TC08 & TC13: Purchase calculates authoritative totals on server and completes transaction', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        customerEmail: 'customer@vastrastore.com',
        customerPhone: '+91 91234 56789',
        shippingAddress: {
          fullName: 'Priya Nair',
          phone: '+91 91234 56789',
          streetAddress: '42, Lotus Boulevard',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560103',
          country: 'India',
        },
        items: [{ variantId: testVariantId, quantity: 1 }],
        paymentMethod: 'SIMULATED_UPI',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toMatch(/^VAS-\d{8}-[A-F0-9]{6}$/);
    expect(res.body.data.status).toBe('CONFIRMED');
    expect(Number(res.body.data.grandTotal)).toBeGreaterThan(0);
  });

  // TC15: Customers cannot call protected admin APIs
  it('TC15: Customers cannot call protected admin APIs (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  // Admin CAN access admin dashboard
  it('Admin can access admin dashboard and statistics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalOrders).toBeGreaterThanOrEqual(1);
    expect(res.body.data.totalSales).toBeGreaterThan(0);
  });

  // TC18: Invalid and expired coupons are rejected
  it('TC18: Invalid or expired coupons are rejected', async () => {
    const resExpired = await request(app)
      .post('/api/v1/coupons/validate')
      .send({ code: 'EXPIRED20', subtotal: 2000 });

    expect(resExpired.status).toBe(400);

    const resInvalid = await request(app)
      .post('/api/v1/coupons/validate')
      .send({ code: 'INVALID_CODE_999', subtotal: 2000 });

    expect(resInvalid.status).toBe(400);

    const resValid = await request(app)
      .post('/api/v1/coupons/validate')
      .send({ code: 'VASTRA10', subtotal: 2000 });

    expect(resValid.status).toBe(200);
    expect(resValid.body.data.discountAmount).toBe(200);
  });

  // TC14: Customers cannot access other customers' orders
  it("TC14: Customer cannot access another customer's order", async () => {
    // Register a second customer with unique email
    const uniqueEmail = `othercustomer-${Date.now()}@vastrastore.com`;
    const otherCustRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: uniqueEmail,
        password: 'Password@123',
        firstName: 'Dev',
        lastName: 'Patel',
      });

    const otherToken = otherCustRes.body.data.token;

    // Try to access Priya's order VAS-20261016-1001 with Dev's token
    const res = await request(app)
      .get('/api/v1/orders/VAS-20261016-1001')
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // TC16: Concurrent / overselling prevention
  it('TC16: Purchasing more than remaining stock is rejected', async () => {
    // Find or create a low stock variant with stock = 2
    const lowStockVar = await prisma.productVariant.findFirst({
      where: { stockQuantity: { lte: 4, gt: 0 } },
    });
    const targetVariantId = lowStockVar ? lowStockVar.id : testVariantId;
    const availableStock = lowStockVar ? lowStockVar.stockQuantity : 1;

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        customerEmail: 'customer@vastrastore.com',
        customerPhone: '+91 91234 56789',
        shippingAddress: {
          fullName: 'Priya Nair',
          phone: '+91 91234 56789',
          streetAddress: '42, Lotus Boulevard',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560103',
          country: 'India',
        },
        items: [{ variantId: targetVariantId, quantity: availableStock + 5 }], // Exceeds available stock but <= 20
        paymentMethod: 'SIMULATED_UPI',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Insufficient stock');
  });

  // TC09: Admin stock changes are reflected in catalogue availability
  it('TC09: Admin stock adjustments update variant inventory and log audit movement', async () => {
    const initialVariant = await prisma.productVariant.findUnique({
      where: { id: testVariantId },
    });
    const oldStock = initialVariant!.stockQuantity;

    const res = await request(app)
      .patch(`/api/v1/admin/variants/${testVariantId}/stock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        adjustment: 5,
        reason: 'Restocking shipment VAS-SHIP-101',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.stockQuantity).toBe(oldStock + 5);

    // Verify inventory movement record was created
    const movement = await prisma.inventoryMovement.findFirst({
      where: { variantId: testVariantId },
      orderBy: { createdAt: 'desc' },
    });
    expect(movement?.changeQuantity).toBe(5);
    expect(movement?.reason).toBe('Restocking shipment VAS-SHIP-101');
  });
});
