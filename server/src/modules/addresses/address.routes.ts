import { Router } from 'express';
import { AddressController } from './address.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { addressSchema, updateAddressSchema } from './address.schema.js';

const router = Router();

router.use(requireAuth);

router.get('/', AddressController.getAddresses);
router.post('/', validateRequest({ body: addressSchema }), AddressController.createAddress);
router.patch('/:id', validateRequest({ body: updateAddressSchema }), AddressController.updateAddress);
router.delete('/:id', AddressController.deleteAddress);

export default router;
