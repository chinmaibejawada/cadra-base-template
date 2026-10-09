import { Router } from 'express';
import { productController } from '../controllers/productController';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateRequest } from '../middleware/validateRequest';
import { createProductSchema, updateProductSchema } from '../validators/productSchema';

const router = Router();

router.get('/low-stock', asyncHandler(productController.lowStock));
router.get('/', asyncHandler(productController.list));
router.get('/:id', asyncHandler(productController.getById));
router.post('/', validateRequest(createProductSchema), asyncHandler(productController.create));
router.put('/:id', validateRequest(updateProductSchema), asyncHandler(productController.update));
router.delete('/:id', asyncHandler(productController.remove));

export default router;