import { OrderStatus, Prisma, DiscountType } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export class AdminService {
  // 1. Overview Dashboard Statistics
  static async getDashboardStats() {
    const totalOrders = await prisma.order.count();

    const pendingOrders = await prisma.order.count({
      where: { status: { in: [OrderStatus.PENDING_PAYMENT, OrderStatus.PROCESSING] } },
    });

    const completedOrders = await prisma.order.count({
      where: { status: OrderStatus.DELIVERED },
    });

    const totalCustomers = await prisma.user.count({
      where: { role: 'CUSTOMER' },
    });

    // Real sum of sales from non-cancelled/refunded orders
    const salesAgg = await prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: {
        status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
      },
    });

    const totalSales = Number(salesAgg._sum.grandTotal || 0);

    // Low stock variants (stock < 5)
    const lowStockVariants = await prisma.productVariant.findMany({
      where: { stockQuantity: { lte: 5 }, isActive: true },
      include: {
        product: { select: { name: true, slug: true } },
      },
      orderBy: { stockQuantity: 'asc' },
      take: 10,
    });

    // Recent 5 orders
    const recentOrders = await prisma.order.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Best-selling products (grouped by product name from OrderItems)
    const topItems = await prisma.orderItem.groupBy({
      by: ['productName'],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    return {
      totalSales,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalCustomers,
      lowStockVariants: lowStockVariants.map((v) => ({
        id: v.id,
        productId: v.productId,
        productName: v.product.name,
        productSlug: v.product.slug,
        sku: v.sku,
        size: v.size,
        colour: v.colour,
        stockQuantity: v.stockQuantity,
      })),
      recentOrders,
      topProducts: topItems.map((item) => ({
        name: item.productName,
        totalSold: item._sum.quantity || 0,
        revenue: Number(item._sum.subtotal || 0),
      })),
    };
  }

  // 2. Products Management
  static async getProducts(page = 1, limit = 20, search?: string) {
    const where: Prisma.ProductWhereInput = {};
    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: { orderBy: { price: 'asc' } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: { orderBy: { price: 'asc' } },
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  static async createProduct(
    data: {
      name: string;
      slug: string;
      shortDescription?: string;
      description: string;
      material?: string;
      careInstructions?: string;
      categoryId: string;
      isPublished?: boolean;
      isFeatured?: boolean;
      isNewArrival?: boolean;
      tags?: string[];
      images: Array<{ url: string; altText?: string; isPrimary?: boolean }>;
      variants: Array<{
        sku: string;
        size: string;
        colour: string;
        colourHex?: string;
        price: number;
        salePrice?: number | null;
        stockQuantity: number;
      }>;
    },
    adminId: string
  ) {
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new AppError('A product with this slug already exists', 409);
    }

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          shortDescription: data.shortDescription,
          description: data.description,
          material: data.material,
          careInstructions: data.careInstructions,
          categoryId: data.categoryId,
          isPublished: data.isPublished ?? true,
          isFeatured: data.isFeatured ?? false,
          isNewArrival: data.isNewArrival ?? false,
          tags: data.tags || [],
          images: {
            create: data.images.map((img, idx) => ({
              url: img.url,
              altText: img.altText,
              isPrimary: img.isPrimary ?? idx === 0,
              sortOrder: idx,
            })),
          },
        },
      });

      for (const v of data.variants) {
        const variant = await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: v.sku,
            size: v.size,
            colour: v.colour,
            colourHex: v.colourHex,
            price: v.price,
            salePrice: v.salePrice,
            stockQuantity: v.stockQuantity,
          },
        });

        await tx.inventoryMovement.create({
          data: {
            variantId: variant.id,
            changeQuantity: v.stockQuantity,
            previousStock: 0,
            newStock: v.stockQuantity,
            reason: 'INITIAL_PRODUCT_CREATION',
            adminUserId: adminId,
          },
        });
      }

      await tx.adminAuditLog.create({
        data: {
          adminUserId: adminId,
          action: 'CREATE_PRODUCT',
          entityType: 'Product',
          entityId: product.id,
          details: { name: product.name, slug: product.slug },
        },
      });

      return product;
    });
  }

  static async updateProduct(
    id: string,
    data: Prisma.ProductUpdateInput,
    adminId: string
  ) {
    const product = await prisma.product.update({
      where: { id },
      data,
    });

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: adminId,
        action: 'UPDATE_PRODUCT',
        entityType: 'Product',
        entityId: id,
        details: data as object,
      },
    });

    return product;
  }

  static async deleteProduct(id: string, adminId: string) {
    // Soft unpublish or delete
    const product = await prisma.product.update({
      where: { id },
      data: { isPublished: false },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: adminId,
        action: 'UNPUBLISH_PRODUCT',
        entityType: 'Product',
        entityId: id,
      },
    });

    return product;
  }

  // 3. Inventory Management & Stock Adjustment
  static async adjustStock(
    variantId: string,
    adjustment: number,
    reason: string,
    adminId: string
  ) {
    return prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
        include: { product: true },
      });

      if (!variant) {
        throw new AppError('Variant not found', 404);
      }

      const newStock = variant.stockQuantity + adjustment;
      if (newStock < 0) {
        throw new AppError(
          `Adjustment would result in negative stock (${newStock}). Negative stock is strictly disallowed.`,
          400
        );
      }

      const updated = await tx.productVariant.update({
        where: { id: variantId },
        data: { stockQuantity: newStock },
      });

      await tx.inventoryMovement.create({
        data: {
          variantId,
          changeQuantity: adjustment,
          previousStock: variant.stockQuantity,
          newStock,
          reason,
          adminUserId: adminId,
        },
      });

      await tx.adminAuditLog.create({
        data: {
          adminUserId: adminId,
          action: 'ADJUST_STOCK',
          entityType: 'ProductVariant',
          entityId: variantId,
          details: {
            productName: variant.product.name,
            sku: variant.sku,
            adjustment,
            previousStock: variant.stockQuantity,
            newStock,
            reason,
          },
        },
      });

      return updated;
    });
  }

  static async getInventoryMovements(page = 1, limit = 30) {
    const total = await prisma.inventoryMovement.count();
    const movements = await prisma.inventoryMovement.findMany({
      include: {
        variant: {
          include: {
            product: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      movements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 4. Order Management & Status Transitions
  static async getOrders(status?: OrderStatus, page = 1, limit = 20, search?: string) {
    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status;
    if (search && search.trim() !== '') {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.order.count({ where });
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: true,
        payment: true,
        shipment: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminId: string,
    notes?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      // Explicit status transition state machine
      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PENDING_PAYMENT]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
        [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
        [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
        [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
        [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
        [OrderStatus.CANCELLED]: [],
        [OrderStatus.REFUNDED]: [],
      };

      if (!validTransitions[order.status]?.includes(newStatus)) {
        throw new AppError(
          `Invalid status transition from "${order.status}" to "${newStatus}"`,
          400
        );
      }

      // If transitioning to CANCELLED, restock inventory!
      if (newStatus === OrderStatus.CANCELLED) {
        for (const item of order.items) {
          if (item.variantId) {
            const v = await tx.productVariant.findUnique({
              where: { id: item.variantId },
            });
            if (v) {
              const restoredStock = v.stockQuantity + item.quantity;
              await tx.productVariant.update({
                where: { id: v.id },
                data: { stockQuantity: restoredStock },
              });
              await tx.inventoryMovement.create({
                data: {
                  variantId: v.id,
                  changeQuantity: item.quantity,
                  previousStock: v.stockQuantity,
                  newStock: restoredStock,
                  reason: `ADMIN_CANCELLED_RESTOCK: ${order.orderNumber}`,
                  adminUserId: adminId,
                },
              });
            }
          }
        }
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          notes: notes ? `${order.notes || ''}\n[Admin]: ${notes}`.trim() : order.notes,
        },
        include: {
          items: true,
          payment: true,
          shipment: true,
        },
      });

      await tx.adminAuditLog.create({
        data: {
          adminUserId: adminId,
          action: 'UPDATE_ORDER_STATUS',
          entityType: 'Order',
          entityId: orderId,
          details: { previousStatus: order.status, newStatus, notes },
        },
      });

      return updatedOrder;
    });
  }

  static async createCoupon(
    data: {
      code: string;
      description?: string;
      discountType: DiscountType;
      discountValue: number;
      minPurchaseAmount?: number | null;
      maxDiscountAmount?: number | null;
      usageLimit?: number | null;
      expiryDate?: string | null;
      isActive?: boolean;
    },
    adminId: string
  ) {
    const existing = await prisma.coupon.findUnique({
      where: { code: data.code.toUpperCase() },
    });
    if (existing) {
      throw new AppError('Coupon with this code already exists', 409);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minPurchaseAmount: data.minPurchaseAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        usageLimit: data.usageLimit,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        isActive: data.isActive ?? true,
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: adminId,
        action: 'CREATE_COUPON',
        entityType: 'Coupon',
        entityId: coupon.id,
        details: { code: coupon.code, discountValue: coupon.discountValue },
      },
    });

    return coupon;
  }

  static async toggleCoupon(id: string, isActive: boolean, adminId: string) {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: adminId,
        action: 'TOGGLE_COUPON',
        entityType: 'Coupon',
        entityId: id,
        details: { isActive },
      },
    });

    return coupon;
  }
}
