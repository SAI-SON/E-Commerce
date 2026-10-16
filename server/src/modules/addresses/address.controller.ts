import { Request, Response, NextFunction } from 'express';
import { AddressService } from './address.service.js';

export class AddressController {
  static async getAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      const addresses = await AddressService.getAddresses(req.user!.id);
      res.status(200).json({
        success: true,
        data: addresses,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const address = await AddressService.createAddress(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: address,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const address = await AddressService.updateAddress(
        req.params.id as string,
        req.user!.id,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        data: address,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AddressService.deleteAddress(
        req.params.id as string,
        req.user!.id
      );
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
