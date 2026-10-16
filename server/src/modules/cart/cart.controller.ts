import { Request, Response, NextFunction } from 'express';
import { CartService } from './cart.service.js';

export class CartController {
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const couponCode = req.query.coupon as string | undefined;
      const cart = await CartService.getCart(
        req.user?.id,
        req.guestSessionId,
        couponCode
      );
      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { variantId, quantity } = req.body;
      const cart = await CartService.addItem(
        variantId,
        quantity,
        req.user?.id,
        req.guestSessionId
      );
      res.status(200).json({
        success: true,
        message: 'Item added to cart',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { quantity } = req.body;
      const cart = await CartService.updateItemQuantity(
        req.params.id as string,
        quantity,
        req.user?.id,
        req.guestSessionId
      );
      res.status(200).json({
        success: true,
        message: 'Cart updated',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await CartService.removeItem(
        req.params.id as string,
        req.user?.id,
        req.guestSessionId
      );
      res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  static async mergeCart(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const cart = await CartService.mergeCart(req.user.id, req.body.guestSessionId);
      res.status(200).json({
        success: true,
        message: 'Guest cart merged successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }
}
