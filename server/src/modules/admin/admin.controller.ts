import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service.js';
import { OrderStatus } from '@prisma/client';

export class AdminController {
  static async getDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const search = req.query.search as string | undefined;

      const result = await AdminService.getProducts(page, limit, search);
      res.status(200).json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await AdminService.getProductById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await AdminService.createProduct(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await AdminService.updateProduct(
        req.params.id as string,
        req.body,
        req.user!.id
      );
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await AdminService.deleteProduct(req.params.id as string, req.user!.id);
      res.status(200).json({
        success: true,
        message: 'Product unpublished successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  static async adjustStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { adjustment, reason } = req.body;
      const variant = await AdminService.adjustStock(
        req.params.variantId as string,
        adjustment,
        reason,
        req.user!.id
      );
      res.status(200).json({
        success: true,
        message: 'Stock adjusted successfully and audit logged',
        data: variant,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInventoryMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
      const result = await AdminService.getInventoryMovements(page, limit);
      res.status(200).json({
        success: true,
        data: result.movements,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as OrderStatus | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const search = req.query.search as string | undefined;

      const result = await AdminService.getOrders(status, page, limit, search);
      res.status(200).json({
        success: true,
        data: result.orders,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, notes } = req.body;
      const order = await AdminService.updateOrderStatus(
        req.params.id as string,
        status,
        req.user!.id,
        notes
      );
      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await AdminService.createCoupon(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon,
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { isActive } = req.body;
      const coupon = await AdminService.toggleCoupon(
        req.params.id as string,
        Boolean(isActive),
        req.user!.id
      );
      res.status(200).json({
        success: true,
        message: 'Coupon status updated successfully',
        data: coupon,
      });
    } catch (error) {
      next(error);
    }
  }
}
