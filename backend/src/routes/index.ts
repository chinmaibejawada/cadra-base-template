import { Router } from 'express';
import farmRoutes from './farms';
import productRoutes from './products';
import orderRoutes from './orders';
import noteRoutes from './notes';

const router = Router();

router.use('/farms', farmRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/notes', noteRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;