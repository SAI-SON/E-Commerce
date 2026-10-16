import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export class CategoryService {
  static async getAll() {
    return prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { products: { where: { isPublished: true } } },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  static async getBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { products: { where: { isPublished: true } } },
        },
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return category;
  }
}
