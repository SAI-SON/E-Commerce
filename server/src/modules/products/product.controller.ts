import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service.js';
import { ProductQueryInput } from './product.schema.js';

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getProducts(req.query as unknown as ProductQueryInput);
      res.status(200).json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getProductBySlug(req.params.slug as string);
      res.status(200).json({
        success: true,
        data: result.product,
        relatedProducts: result.relatedProducts,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFilterOptions(_req: Request, res: Response, next: NextFunction) {
    try {
      const filters = await ProductService.getFilterOptions();
      res.status(200).json({
        success: true,
        data: filters,
      });
    } catch (error) {
      next(error);
    }
  }
}
