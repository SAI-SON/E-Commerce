import { Request, Response, NextFunction } from 'express';
import { CouponService } from './coupon.service.js';

export class CouponController {
  static async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, subtotal } = req.body;
      const result = await CouponService.validateCoupon(
        code,
        subtotal ? parseFloat(subtotal) : 0
      );
      res.status(200).json({
        success: true,
        message: 'Coupon code applied successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const coupons = await CouponService.getAllCoupons();
      res.status(200).json({
        success: true,
        data: coupons,
      });
    } catch (error) {
      next(error);
    }
  }
}
