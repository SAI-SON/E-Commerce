import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { prisma } from './config/prisma.js';
import { authenticate } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './modules/auth/auth.routes.js';
import categoryRoutes from './modules/categories/category.routes.js';
import productRoutes from './modules/products/product.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import addressRoutes from './modules/addresses/address.routes.js';
import orderRoutes from './modules/orders/order.routes.js';
import wishlistRoutes from './modules/wishlist/wishlist.routes.js';
import couponRoutes from './modules/coupons/coupon.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

export const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows cross-origin images for preview
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Guest-Session-Id'],
  })
);

// Rate Limiter
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    status: 429,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Request Parsing & Cookies
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(config.cookie.secret));

// HTTP Logging
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Global Authentication parser
app.use(authenticate);

// Health Check
app.get('/api/v1/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      environment: config.env,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'disconnected',
      error: (error as Error).message,
    });
  }
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Central Error Handler
app.use(errorHandler);
