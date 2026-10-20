import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { config } from '../../config/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export class AuthService {
  static generateToken(user: { id: string; email: string; role: Role }) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
    );
  }

  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Public registration ALWAYS creates Role.CUSTOMER
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: Role.CUSTOMER,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user);

    const safeUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    return { user: safeUser, token };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        createdAt: true,
        addresses: {
          orderBy: { isDefaultShipping: 'desc' },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; phone?: string }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        updatedAt: true,
      },
    });
    return user;
  }

  static async supabaseAuth(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    provider?: string;
  }) {
    if (!data.email) {
      throw new AppError('Email is required for authentication', 400);
    }

    const normalizedEmail = data.email.toLowerCase().trim();

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // First-time Supabase user: Create in database with secure random password hash
      const randomPassword = `sb_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const firstName = data.firstName?.trim() || normalizedEmail.split('@')[0];
      const lastName = data.lastName?.trim() || '';

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName,
          lastName,
          role: Role.CUSTOMER,
        },
      });
    }

    const token = this.generateToken(user);
    const safeUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    return { user: safeUser, token };
  }
}

