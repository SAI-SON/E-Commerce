import { Router } from 'express';
import { CartController } from './cart.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { addToCartSchema, updateCartItemSchema, mergeCartSchema } from './cart.schema.js';

const router = Router();

router.get('/', CartController.getCart);
router.post('/items', validateRequest({ body: addToCartSchema }), CartController.addItem);
router.patch('/items/:id', validateRequest({ body: updateCartItemSchema }), CartController.updateItem);
router.delete('/items/:id', CartController.removeItem);
router.post('/merge', validateRequest({ body: mergeCartSchema }), CartController.mergeCart);

export default router;
