import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { ProductQueryInput } from './product.schema.js';
import { AppError } from '../../middleware/errorHandler.js';

export class ProductService {
  static async getProducts(query: ProductQueryInput) {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      size,
      colour,
      inStock,
      isFeatured,
      isNewArrival,
      sort,
      page,
      limit,
    } = query;

    const where: Prisma.ProductWhereInput = {
      isPublished: true,
    };

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (isNewArrival !== undefined) {
      where.isNewArrival = isNewArrival;
    }

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { shortDescription: { contains: searchTerm, mode: 'insensitive' } },
        { material: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { has: searchTerm.toLowerCase() } },
      ];
    }

    if (category) {
      where.category = {
        OR: [
          { slug: category },
          { id: category },
          { parent: { slug: category } },
        ],
      };
    }

    // Variant conditions
    const variantWhere: Prisma.ProductVariantWhereInput = {
      isActive: true,
    };

    if (size) {
      variantWhere.size = size;
    }

    if (colour) {
      variantWhere.colour = colour;
    }

    if (inStock) {
      variantWhere.stockQuantity = { gt: 0 };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Prisma.DecimalFilter = {};
      if (minPrice !== undefined) priceFilter.gte = new Prisma.Decimal(minPrice);
      if (maxPrice !== undefined) priceFilter.lte = new Prisma.Decimal(maxPrice);
      variantWhere.price = priceFilter;
    }

    if (Object.keys(variantWhere).length > 1) {
      where.variants = {
        some: variantWhere,
      };
    }

    // Determine sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'name_asc') {
      orderBy = { name: 'asc' };
    } else if (sort === 'name_desc') {
      orderBy = { name: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const total = await prisma.product.count({ where });

    let products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    // If sorting by price, sort products based on their lowest variant price
    if (sort === 'price_asc' || sort === 'price_desc') {
      products.sort((a, b) => {
        const aMin = Math.min(
          ...a.variants.map((v) => Number(v.salePrice || v.price))
        );
        const bMin = Math.min(
          ...b.variants.map((v) => Number(v.salePrice || v.price))
        );
        return sort === 'price_asc' ? aMin - bMin : bMin - aMin;
      });
    }

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          include: { parent: true },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          where: { isActive: true },
          orderBy: [{ size: 'asc' }, { colour: 'asc' }],
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product || !product.isPublished) {
      throw new AppError('Product not found', 404);
    }

    // Fetch related products from same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isPublished: true,
      },
      include: {
        images: { where: { isPrimary: true } },
        variants: { where: { isActive: true }, take: 1 },
      },
      take: 4,
    });

    return {
      product,
      relatedProducts,
    };
  }

  static async getFilterOptions() {
    // Get unique sizes, colours, and price range for filters
    const variants = await prisma.productVariant.findMany({
      where: { isActive: true, product: { isPublished: true } },
      select: {
        size: true,
        colour: true,
        colourHex: true,
        price: true,
        salePrice: true,
      },
    });

    const sizes = Array.from(new Set(variants.map((v) => v.size))).sort();
    const coloursMap = new Map<string, string | null>();
    let minPrice = Infinity;
    let maxPrice = 0;

    variants.forEach((v) => {
      coloursMap.set(v.colour, v.colourHex);
      const effPrice = Number(v.salePrice || v.price);
      if (effPrice < minPrice) minPrice = effPrice;
      if (effPrice > maxPrice) maxPrice = effPrice;
    });

    const colours = Array.from(coloursMap.entries()).map(([name, hex]) => ({
      name,
      hex,
    }));

    return {
      sizes,
      colours,
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice,
      },
    };
  }
}
