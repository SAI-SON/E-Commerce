import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export class AddressService {
  static async getAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefaultShipping: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static async createAddress(
    userId: string,
    data: {
      fullName: string;
      phone: string;
      streetAddress: string;
      apartment?: string;
      city: string;
      state: string;
      postalCode: string;
      country?: string;
      isDefaultShipping?: boolean;
      isDefaultBilling?: boolean;
    }
  ) {
    if (data.isDefaultShipping) {
      await prisma.address.updateMany({
        where: { userId, isDefaultShipping: true },
        data: { isDefaultShipping: false },
      });
    }

    if (data.isDefaultBilling) {
      await prisma.address.updateMany({
        where: { userId, isDefaultBilling: true },
        data: { isDefaultBilling: false },
      });
    }

    return prisma.address.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  static async updateAddress(
    addressId: string,
    userId: string,
    data: Partial<{
      fullName: string;
      phone: string;
      streetAddress: string;
      apartment: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefaultShipping: boolean;
      isDefaultBilling: boolean;
    }>
  ) {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new AppError('Address not found', 404);
    }

    if (address.userId !== userId) {
      throw new AppError('Forbidden: Not authorized to modify this address', 403);
    }

    if (data.isDefaultShipping) {
      await prisma.address.updateMany({
        where: { userId, isDefaultShipping: true },
        data: { isDefaultShipping: false },
      });
    }

    if (data.isDefaultBilling) {
      await prisma.address.updateMany({
        where: { userId, isDefaultBilling: true },
        data: { isDefaultBilling: false },
      });
    }

    return prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  static async deleteAddress(addressId: string, userId: string) {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new AppError('Address not found', 404);
    }

    if (address.userId !== userId) {
      throw new AppError('Forbidden: Not authorized to delete this address', 403);
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    return { message: 'Address deleted successfully' };
  }
}
