import { Request, Response, NextFunction } from 'express';
import { OrderService } from './order.service.js';

export class OrderController {
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.createOrder(
        req.body,
        req.user?.id,
        req.guestSessionId
      );

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerOrders(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      const orders = await OrderService.getCustomerOrders(req.user.id);
      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderByNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.getOrderByNumber(
        req.params.orderNumber as string,
        req.user ? { id: req.user.id, role: req.user.role } : undefined
      );
      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      const order = await OrderService.cancelOrder(
        req.params.orderNumber as string,
        req.user.id,
        req.user.role
      );
      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully and inventory restored',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}
