import { DiscountType } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export class CartService {
  private static async getOrCreateCart(userId?: string, guestSessionId?: string) {
    if (!userId && !guestSessionId) {
      throw new AppError('Either user ID or guest session ID is required', 400);
    }

    if (userId) {
      let cart = await prisma.cart.findUnique({
        where: { userId },
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
        });
      }
      return cart;
    } else {
      let cart = await prisma.cart.findUnique({
        where: { guestSessionId },
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: { guestSessionId },
        });
      }
      return cart;
    }
  }

  static async getCart(userId?: string, guestSessionId?: string, couponCode?: string) {
    const cart = await this.getOrCreateCart(userId, guestSessionId);

    const cartWithItems = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { where: { isPrimary: true }, take: 1 },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cartWithItems) {
      throw new AppError('Cart not found', 404);
    }

    let subtotal = 0;
    const formattedItems = cartWithItems.items.map((item) => {
      const v = item.variant;
      const unitPrice = Number(v.salePrice || v.price);
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      const isAvailable = v.isActive && v.stockQuantity >= item.quantity;

      return {
        id: item.id,
        variantId: v.id,
        productId: v.productId,
        productName: v.product.name,
        productSlug: v.product.slug,
        primaryImage: v.product.images[0]?.url || '',
        sku: v.sku,
        size: v.size,
        colour: v.colour,
        colourHex: v.colourHex,
        unitPrice,
        regularPrice: Number(v.price),
        salePrice: v.salePrice ? Number(v.salePrice) : null,
        quantity: item.quantity,
        stockQuantity: v.stockQuantity,
        isAvailable,
        subtotal: itemSubtotal,
      };
    });

    // Shipping estimate: free above ₹1999, else ₹150
    const shippingTotal = subtotal >= 1999 || subtotal === 0 ? 0 : 150;

    // Calculate coupon discount if provided
    let discountTotal = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        const isNotExpired = !coupon.expiryDate || coupon.expiryDate > now;
        const meetsMinPurchase = !coupon.minPurchaseAmount || subtotal >= Number(coupon.minPurchaseAmount);
        const withinUsage = !coupon.usageLimit || coupon.usageCount < coupon.usageLimit;

        if (isNotExpired && meetsMinPurchase && withinUsage) {
          if (coupon.discountType === DiscountType.PERCENTAGE) {
            let disc = (subtotal * Number(coupon.discountValue)) / 100;
            if (coupon.maxDiscountAmount && disc > Number(coupon.maxDiscountAmount)) {
              disc = Number(coupon.maxDiscountAmount);
            }
            discountTotal = Math.round(disc * 100) / 100;
          } else {
            discountTotal = Math.min(Number(coupon.discountValue), subtotal);
          }

          appliedCoupon = {
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: Number(coupon.discountValue),
            discountApplied: discountTotal,
          };
        }
      }
    }

    const grandTotal = Math.max(0, subtotal - discountTotal + shippingTotal);

    return {
      id: cartWithItems.id,
      items: formattedItems,
      itemCount: formattedItems.reduce((acc, curr) => acc + curr.quantity, 0),
      subtotal,
      shippingTotal,
      discountTotal,
      grandTotal,
      appliedCoupon,
      freeShippingThreshold: 1999,
      amountNeededForFreeShipping: subtotal < 1999 ? Math.max(0, 1999 - subtotal) : 0,
    };
  }

  static async addItem(
    variantId: string,
    quantity: number,
    userId?: string,
    guestSessionId?: string
  ) {
    if (quantity <= 0) {
      throw new AppError('Quantity must be greater than zero', 400);
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || !variant.isActive || !variant.product.isPublished) {
      throw new AppError('Product variant is not available', 404);
    }

    if (variant.stockQuantity < quantity) {
      throw new AppError(
        `Insufficient stock available. Only ${variant.stockQuantity} unit(s) left.`,
        400
      );
    }

    const cart = await this.getOrCreateCart(userId, guestSessionId);

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (variant.stockQuantity < newQuantity) {
        throw new AppError(
          `Cannot add more items. You already have ${existingItem.quantity} in cart and only ${variant.stockQuantity} are available.`,
          400
        );
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
        },
      });
    }

    return this.getCart(userId, guestSessionId);
  }

  static async updateItemQuantity(
    cartItemId: string,
    quantity: number,
    userId?: string,
    guestSessionId?: string
  ) {
    if (quantity <= 0) {
      throw new AppError('Quantity must be greater than zero', 400);
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { variant: true, cart: true },
    });

    if (!cartItem) {
      throw new AppError('Cart item not found', 404);
    }

    // Verify ownership
    if (userId && cartItem.cart.userId !== userId) {
      throw new AppError('Forbidden: Not your cart item', 403);
    }
    if (!userId && guestSessionId && cartItem.cart.guestSessionId !== guestSessionId) {
      throw new AppError('Forbidden: Not your cart item', 403);
    }

    if (cartItem.variant.stockQuantity < quantity) {
      throw new AppError(
        `Only ${cartItem.variant.stockQuantity} unit(s) available in stock`,
        400
      );
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return this.getCart(userId, guestSessionId);
  }

  static async removeItem(
    cartItemId: string,
    userId?: string,
    guestSessionId?: string
  ) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem) {
      throw new AppError('Cart item not found', 404);
    }

    if (userId && cartItem.cart.userId !== userId) {
      throw new AppError('Forbidden: Not your cart item', 403);
    }
    if (!userId && guestSessionId && cartItem.cart.guestSessionId !== guestSessionId) {
      throw new AppError('Forbidden: Not your cart item', 403);
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return this.getCart(userId, guestSessionId);
  }

  static async clearCart(cartId: string) {
    await prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }

  static async mergeCart(userId: string, guestSessionId: string) {
    const guestCart = await prisma.cart.findUnique({
      where: { guestSessionId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.getCart(userId);
    }

    const userCart = await this.getOrCreateCart(userId);

    for (const item of guestCart.items) {
      const existing = await prisma.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: userCart.id,
            variantId: item.variantId,
          },
        },
      });

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            variantId: item.variantId,
            quantity: item.quantity,
          },
        });
      }
    }

    // Clean up guest cart
    await prisma.cart.delete({
      where: { id: guestCart.id },
    });

    return this.getCart(userId);
  }
}
