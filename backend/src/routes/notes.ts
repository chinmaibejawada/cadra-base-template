import { Router } from 'express';
import { noteController } from '../controllers/noteController';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateRequest } from '../middleware/validateRequest';
import { createNoteSchema } from '../validators/noteSchema';

const router = Router();

router.get('/', asyncHandler(noteController.list));
router.post('/', validateRequest(createNoteSchema), asyncHandler(noteController.create));
router.delete('/:id', asyncHandler(noteController.remove));

export default router;