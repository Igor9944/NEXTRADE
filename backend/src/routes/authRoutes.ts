import { Router } from 'express';
import { AuthController } from '../controllers/authController';

/**
 * Create auth routes
 * @param authController - Auth controller instance
 * @returns Express router
 */
export const createAuthRoutes = (authController: AuthController) => {
  const router = Router();
  
  router.post('/register', authController.register);
  router.post('/login', authController.login);
  
  return router;
};

export default createAuthRoutes;
