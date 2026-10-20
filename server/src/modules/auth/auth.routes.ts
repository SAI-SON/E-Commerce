import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { registerSchema, loginSchema, updateProfileSchema } from './auth.schema.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.post('/register', validateRequest({ body: registerSchema }), AuthController.register);
router.post('/login', validateRequest({ body: loginSchema }), AuthController.login);
router.post('/supabase', AuthController.supabaseAuth);
router.post('/logout', AuthController.logout);
router.get('/me', requireAuth, AuthController.getMe);
router.patch('/profile', requireAuth, validateRequest({ body: updateProfileSchema }), AuthController.updateProfile);

export default router;
