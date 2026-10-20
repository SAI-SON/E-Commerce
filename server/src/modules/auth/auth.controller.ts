import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { config } from '../../config/index.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await AuthService.register(req.body);

      res.cookie('token', token, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await AuthService.login(req.body);

      res.cookie('token', token, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response) {
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.updateProfile(req.user!.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async supabaseAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await AuthService.supabaseAuth(req.body);

      res.cookie('token', token, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Authenticated with Supabase successfully',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  }
}

