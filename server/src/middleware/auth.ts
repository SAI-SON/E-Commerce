import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { config } from '../config/index.js';
import { prisma } from '../config/prisma.js';
import { AppError } from './errorHandler.js';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      guestSessionId?: string;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // 1. Check authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Check signed or unsigned cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Also extract guest session id from header or cookie
    const guestHeader = req.headers['x-guest-session-id'] as string;
    req.guestSessionId = guestHeader || req.cookies?.guestSessionId;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: Role;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (_err) {
    // If token invalid, proceed as unauthenticated
    next();
  }
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required to access this resource', 401));
  }
  next();
};

export const requireRole = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: Insufficient privileges', 403));
    }
    next();
  };
};

export const requireAdmin = requireRole(Role.ADMIN);
