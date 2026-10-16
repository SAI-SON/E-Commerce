import { Router } from 'express';
import { CouponController } from './coupon.controller.js';

const router = Router();

router.post('/validate', CouponController.validate);
router.get('/', CouponController.getAll);

export default router;
