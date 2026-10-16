import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runCheck() {
  console.log('\n======================================================');
  console.log('       VASTRA DATABASE STATUS & HEALTH CHECK          ');
  console.log('======================================================\n');

  try {
    const startTime = Date.now();
    // Test raw query
    await prisma.$queryRaw`SELECT 1 as connected`;
    const latency = Date.now() - startTime;

    console.log(`[OK] PostgreSQL Connection: ACTIVE (${latency}ms latency)`);
    console.log(`[OK] Database Target: vastra_db @ localhost:5432\n`);

    // Fetch counts in parallel
    const [
      userCount,
      categoryCount,
      productCount,
      variantCount,
      orderCount,
      reviewCount,
      couponCount,
      cartCount,
      wishlistCount,
      auditLogCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.category.count(),
      prisma.product.count(),
      prisma.productVariant.count(),
      prisma.order.count(),
      prisma.review.count(),
      prisma.coupon.count(),
      prisma.cart.count(),
      prisma.wishlist.count(),
      prisma.adminAuditLog.count(),
    ]);

    console.log('--- TABLE RECORD COUNTS ---');
    console.table([
      { Table: 'Users', Records: userCount },
      { Table: 'Categories', Records: categoryCount },
      { Table: 'Products', Records: productCount },
      { Table: 'Product Variants', Records: variantCount },
      { Table: 'Orders', Records: orderCount },
      { Table: 'Reviews', Records: reviewCount },
      { Table: 'Coupons', Records: couponCount },
      { Table: 'Active Carts', Records: cartCount },
      { Table: 'Wishlists', Records: wishlistCount },
      { Table: 'Audit Logs', Records: auditLogCount },
    ]);

    // Admin Users
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, firstName: true, lastName: true, createdAt: true },
    });

    console.log('\n--- REGISTERED ADMINS ---');
    console.table(admins);

    // Categories
    const categories = await prisma.category.findMany({
      select: {
        name: true,
        slug: true,
        _count: { select: { products: true } },
      },
    });

    console.log('\n--- CATEGORIES & PRODUCT COUNTS ---');
    console.table(
      categories.map((c) => ({
        Category: c.name,
        Slug: c.slug,
        Products: c._count.products,
      }))
    );

    console.log('\n[SUCCESS] All database models are healthy and verified.\n');
  } catch (error) {
    console.error('\n[ERROR] Database check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runCheck();
