import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';

const router = Router();

/**
 * Protected route - accessible to any authenticated user
 */
router.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Access granted to protected route',
    user: (req as any).user
  });
});

/**
 * Admin-only route
 */
router.get('/admin', authMiddleware, requireRole('ADMIN'), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Access granted to admin route',
    user: (req as any).user
  });
});

/**
 * Commercant-only route
 */
router.get('/commercant', authMiddleware, requireRole('COMMERCANT'), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Access granted to commercant route',
    user: (req as any).user
  });
});

/**
 * Transporteur-only route
 */
router.get('/transporteur', authMiddleware, requireRole('TRANSPORTEUR'), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Access granted to transporteur route',
    user: (req as any).user
  });
});

export default router;
