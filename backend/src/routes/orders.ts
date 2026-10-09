import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateRequest } from '../middleware/validateRequest';
import { createOrderSchema, updateOrderSchema, statusTransitionSchema } from '../validators/orderSchema';

const router = Router();

router.get('/', asyncHandler(orderController.list));
router.get('/:id', asyncHandler(orderController.getById));
router.post('/', validateRequest(createOrderSchema), asyncHandler(orderController.create));
router.put('/:id', validateRequest(updateOrderSchema), asyncHandler(orderController.update));
router.patch('/:id/status', validateRequest(statusTransitionSchema), asyncHandler(orderController.transitionStatus));
router.post('/:id/cancel', asyncHandler(orderController.cancel));
router.delete('/:id', asyncHandler(orderController.remove));

export default router;