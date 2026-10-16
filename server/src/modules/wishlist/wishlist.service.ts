import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export class WishlistService {
  private static async getOrCreateWishlist(userId: string) {
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
    });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId },
      });
    }
    return wishlist;
  }

  static async getWishlist(userId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);

    const items = await prisma.wishlistItem.findMany({
      where: { wishlistId: wishlist.id },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            variants: { where: { isActive: true }, orderBy: { price: 'asc' }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      productSlug: item.product.slug,
      primaryImage: item.product.images[0]?.url || '',
      price: item.product.variants[0] ? Number(item.product.variants[0].price) : 0,
      salePrice: item.product.variants[0]?.salePrice
        ? Number(item.product.variants[0].salePrice)
        : null,
      isPublished: item.product.isPublished,
      addedAt: item.createdAt,
    }));
  }

  static async toggleItem(userId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const wishlist = await this.getOrCreateWishlist(userId);

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });
      return { inWishlist: false, message: 'Removed from wishlist' };
    } else {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });
      return { inWishlist: true, message: 'Added to wishlist' };
    }
  }
}
