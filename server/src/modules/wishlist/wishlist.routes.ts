import { Router } from 'express';
import { WishlistController } from './wishlist.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', WishlistController.getWishlist);
router.post('/toggle/:productId', WishlistController.toggleItem);

export default router;
