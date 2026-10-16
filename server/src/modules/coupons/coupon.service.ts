import { DiscountType } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export class CouponService {
  static async validateCoupon(code: string, subtotal: number) {
    if (!code || code.trim() === '') {
      throw new AppError('Coupon code is required', 400);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError('Invalid or inactive coupon code', 400);
    }

    const now = new Date();
    if (coupon.expiryDate && coupon.expiryDate < now) {
      throw new AppError('This coupon has expired', 400);
    }

    if (coupon.minPurchaseAmount && subtotal < Number(coupon.minPurchaseAmount)) {
      throw new AppError(
        `This coupon requires a minimum cart subtotal of ₹${coupon.minPurchaseAmount}`,
        400
      );
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError('This coupon has reached its maximum usage limit', 400);
    }

    let discountAmount = 0;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      let disc = (subtotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscountAmount && disc > Number(coupon.maxDiscountAmount)) {
        disc = Number(coupon.maxDiscountAmount);
      }
      discountAmount = Math.round(disc * 100) / 100;
    } else {
      discountAmount = Math.min(Number(coupon.discountValue), subtotal);
    }

    return {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      discountAmount,
      minPurchaseAmount: coupon.minPurchaseAmount ? Number(coupon.minPurchaseAmount) : null,
      maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
    };
  }

  static async getAllCoupons() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
