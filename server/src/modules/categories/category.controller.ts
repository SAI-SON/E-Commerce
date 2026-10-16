import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service.js';

export class CategoryController {
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getAll();
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.getBySlug(req.params.slug as string);
      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
}
