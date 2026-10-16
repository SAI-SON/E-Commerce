import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { requireAdmin } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createProductSchema,
  updateProductSchema,
  adjustStockSchema,
  updateOrderStatusSchema,
  createCouponSchema,
} from './admin.schema.js';

const router = Router();

// Strict server-side role-based authorization guard
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', AdminController.getDashboard);

// Products
router.get('/products', AdminController.getProducts);
router.get('/products/:id', AdminController.getProductById);
router.post('/products', validateRequest({ body: createProductSchema }), AdminController.createProduct);
router.patch('/products/:id', validateRequest({ body: updateProductSchema }), AdminController.updateProduct);
router.delete('/products/:id', AdminController.deleteProduct);

// Inventory & Stock
router.patch('/variants/:variantId/stock', validateRequest({ body: adjustStockSchema }), AdminController.adjustStock);
router.get('/inventory/movements', AdminController.getInventoryMovements);

// Orders
router.get('/orders', AdminController.getOrders);
router.patch('/orders/:id/status', validateRequest({ body: updateOrderStatusSchema }), AdminController.updateOrderStatus);

// Coupons
router.post('/coupons', validateRequest({ body: createCouponSchema }), AdminController.createCoupon);
router.patch('/coupons/:id/toggle', AdminController.toggleCoupon);

export default router;
