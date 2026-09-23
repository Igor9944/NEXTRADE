import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { ProfileController } from '../controllers/profileController';
import { UserRepository } from '../repositories/userRepository';

/**
 * Create profile routes
 * @param profileController - Profile controller instance
 * @returns Express router
 */
export const createProfileRoutes = (profileController: ProfileController) => {
  const router = Router();

  // Personal profile management (for authenticated users)
  router.get('/me', authMiddleware, profileController.getMyProfile);
  router.patch('/me', authMiddleware, profileController.updateMyProfile);

  // Profile management (for admins)
  router.get('/', authMiddleware, requireRole('ADMIN'), profileController.listUsers);
  router.get('/:id', authMiddleware, requireRole('ADMIN'), profileController.getById);

  return router;
};

export default createProfileRoutes;
