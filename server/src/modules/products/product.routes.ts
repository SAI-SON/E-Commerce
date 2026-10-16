import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { productQuerySchema } from './product.schema.js';

const router = Router();

router.get('/', validateRequest({ query: productQuerySchema }), ProductController.getProducts);
router.get('/filters', ProductController.getFilterOptions);
router.get('/:slug', ProductController.getProductBySlug);

export default router;
