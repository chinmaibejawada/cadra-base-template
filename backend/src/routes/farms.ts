import { Router } from 'express';
import { farmController } from '../controllers/farmController';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateRequest } from '../middleware/validateRequest';
import { createFarmSchema, updateFarmSchema } from '../validators/farmSchema';

const router = Router();

router.get('/', asyncHandler(farmController.list));
router.get('/:id', asyncHandler(farmController.getById));
router.post('/', validateRequest(createFarmSchema), asyncHandler(farmController.create));
router.put('/:id', validateRequest(updateFarmSchema), asyncHandler(farmController.update));
router.delete('/:id', asyncHandler(farmController.remove));

export default router;