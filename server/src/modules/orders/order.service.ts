import { DiscountType, OrderStatus, PaymentStatus, Role } from '@prisma/client';
import crypto from 'crypto';
import { prisma } from '../../config/prisma.js';
import { CreateOrderInput } from './order.schema.js';
import { AppError } from '../../middleware/errorHandler.js';

export class OrderService {
  private static generateOrderNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `VAS-${dateStr}-${randomHex}`;
  }

  static async createOrder(data: CreateOrderInput, userId?: string, guestSessionId?: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch all requested variants with authoritative database state
      const variantIds = data.items.map((i) => i.variantId);
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true },
      });

      if (variants.length !== variantIds.length) {
        throw new AppError('One or more selected items no longer exist', 400);
      }

      const variantMap = new Map(variants.map((v) => [v.id, v]));

      // 2. Validate stock and calculate authoritative prices
      let subtotal = 0;
      const orderItemsToCreate: Array<{
        variantId: string;
        productName: string;
        sku: string;
        size: string;
        colour: string;
        unitPrice: number;
        quantity: number;
        subtotal: number;
      }> = [];

      for (const item of data.items) {
        const v = variantMap.get(item.variantId);
        if (!v || !v.isActive || !v.product.isPublished) {
          throw new AppError(`Item "${v?.product.name || item.variantId}" is unavailable`, 400);
        }

        // TC06 & TC16: Prevent overselling and verify stock inside transaction
        if (v.stockQuantity < item.quantity) {
          throw new AppError(
            `Insufficient stock for "${v.product.name} (${v.size}, ${v.colour})". Available: ${v.stockQuantity}, Requested: ${item.quantity}`,
            400
          );
        }

        const effectivePrice = Number(v.salePrice || v.price);
        const lineSubtotal = effectivePrice * item.quantity;
        subtotal += lineSubtotal;

        orderItemsToCreate.push({
          variantId: v.id,
          productName: v.product.name,
          sku: v.sku,
          size: v.size,
          colour: v.colour,
          unitPrice: effectivePrice,
          quantity: item.quantity,
          subtotal: lineSubtotal,
        });
      }

      // 3. Calculate Shipping charges
      const shippingTotal = subtotal >= 1999 ? 0 : 150;

      // 4. Validate and apply coupon if provided
      let discountTotal = 0;
      let validCoupon = null;

      if (data.couponCode && data.couponCode.trim() !== '') {
        const code = data.couponCode.trim().toUpperCase();
        const coupon = await tx.coupon.findUnique({
          where: { code },
        });

        if (!coupon || !coupon.isActive) {
          throw new AppError('Coupon is invalid or inactive', 400);
        }

        const now = new Date();
        if (coupon.expiryDate && coupon.expiryDate < now) {
          throw new AppError('Coupon has expired', 400);
        }

        if (coupon.minPurchaseAmount && subtotal < Number(coupon.minPurchaseAmount)) {
          throw new AppError(
            `Coupon requires a minimum order amount of ₹${coupon.minPurchaseAmount}`,
            400
          );
        }

        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          throw new AppError('Coupon usage limit reached', 400);
        }

        if (coupon.discountType === DiscountType.PERCENTAGE) {
          let disc = (subtotal * Number(coupon.discountValue)) / 100;
          if (coupon.maxDiscountAmount && disc > Number(coupon.maxDiscountAmount)) {
            disc = Number(coupon.maxDiscountAmount);
          }
          discountTotal = Math.round(disc * 100) / 100;
        } else {
          discountTotal = Math.min(Number(coupon.discountValue), subtotal);
        }

        validCoupon = coupon;
      }

      // 5. Final Authoritative Total (Never trust client-provided total!)
      const grandTotal = Math.max(0, subtotal - discountTotal + shippingTotal);

      // 6. Generate unique order number
      const orderNumber = this.generateOrderNumber();

      // 7. Deduct inventory & record movement logs inside transaction
      for (const item of data.items) {
        const v = variantMap.get(item.variantId)!;
        const newStock = v.stockQuantity - item.quantity;

        await tx.productVariant.update({
          where: { id: v.id },
          data: { stockQuantity: newStock },
        });

        await tx.inventoryMovement.create({
          data: {
            variantId: v.id,
            changeQuantity: -item.quantity,
            previousStock: v.stockQuantity,
            newStock,
            reason: `ORDER_PURCHASE: ${orderNumber}`,
            orderId: undefined, // updated after order creation if needed
            adminUserId: userId,
          },
        });
      }

      // 8. Create Order & OrderItem snapshots
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: userId || null,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          shippingAddressSnapshot: data.shippingAddress as object,
          billingAddressSnapshot: (data.billingAddress || data.shippingAddress) as object,
          status: OrderStatus.CONFIRMED,
          subtotal,
          discountTotal,
          shippingTotal,
          grandTotal,
          couponCode: validCoupon ? validCoupon.code : null,
          notes: data.notes,
          items: {
            create: orderItemsToCreate,
          },
          payment: {
            create: {
              provider: 'SIMULATED_GATEWAY',
              status: PaymentStatus.COMPLETED,
              transactionId: `TXN_SIM_${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
              amount: grandTotal,
              paymentMethod: data.paymentMethod,
            },
          },
          shipment: {
            create: {
              carrier: 'Vastra Express Logistics',
              trackingNumber: `TRK-VAS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
              status: 'PREPARING',
            },
          },
        },
        include: {
          items: true,
          payment: true,
          shipment: true,
        },
      });

      // 9. Record coupon redemption if applied
      if (validCoupon) {
        await tx.coupon.update({
          where: { id: validCoupon.id },
          data: { usageCount: { increment: 1 } },
        });

        await tx.couponRedemption.create({
          data: {
            couponId: validCoupon.id,
            orderId: order.id,
            userId: userId || null,
            discountApplied: discountTotal,
          },
        });
      }

      // 10. Clear customer's or guest's cart
      if (userId) {
        const userCart = await tx.cart.findUnique({ where: { userId } });
        if (userCart) {
          await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
        }
      } else if (guestSessionId) {
        const guestCart = await tx.cart.findUnique({ where: { guestSessionId } });
        if (guestCart) {
          await tx.cartItem.deleteMany({ where: { cartId: guestCart.id } });
        }
      }

      return order;
    });
  }

  static async getCustomerOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        payment: true,
        shipment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getOrderByNumber(orderNumber: string, user?: { id: string; role: Role }) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        payment: true,
        shipment: true,
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // TC14: Ensure customer can only access their own order unless admin
    if (order.userId && (!user || (user.id !== order.userId && user.role !== Role.ADMIN))) {
      throw new AppError('Forbidden: Access denied to this order', 403);
    }

    return order;
  }

  static async cancelOrder(orderNumber: string, userId: string, role?: Role) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { orderNumber },
        include: { items: true },
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      // Check ownership
      if (order.userId !== userId && role !== Role.ADMIN) {
        throw new AppError('Forbidden: Not authorized to cancel this order', 403);
      }

      // Only PENDING_PAYMENT and CONFIRMED orders can be cancelled by customers
      if (order.status !== OrderStatus.PENDING_PAYMENT && order.status !== OrderStatus.CONFIRMED) {
        throw new AppError(
          `Cannot cancel order in "${order.status}" status. Please contact customer support.`,
          400
        );
      }

      // Restock inventory for each order item
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
                reason: `ORDER_CANCELLED_RESTOCK: ${orderNumber}`,
                adminUserId: userId,
              },
            });
          }
        }
      }

      const updated = await tx.order.update({
        where: { orderNumber },
        data: { status: OrderStatus.CANCELLED },
        include: { items: true, payment: true, shipment: true },
      });

      return updated;
    });
  }
}
