import { Router } from 'express';
import { OrderController } from './order.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { createOrderSchema } from './order.schema.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

// Order creation can be completed by authenticated user or guest
router.post('/', validateRequest({ body: createOrderSchema }), OrderController.createOrder);

// Customer orders list requires authentication
router.get('/', requireAuth, OrderController.getCustomerOrders);

// Order confirmation / details by order number
router.get('/:orderNumber', OrderController.getOrderByNumber);

// Order cancellation by customer
router.post('/:orderNumber/cancel', requireAuth, OrderController.cancelOrder);

export default router;
