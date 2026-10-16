import { Request, Response, NextFunction } from 'express';
import { WishlistService } from './wishlist.service.js';

export class WishlistController {
  static async getWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await WishlistService.getWishlist(req.user!.id);
      res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleItem(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WishlistService.toggleItem(
        req.user!.id,
        req.params.productId as string
      );
      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
