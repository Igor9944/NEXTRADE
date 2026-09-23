import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { ClientController } from '../controllers/clientController';
import { UserRepository } from '../repositories/userRepository';

/**
 * Create client routes
 * @param clientController - Client controller instance
 * @returns Express router
 */
export const createClientRoutes = (clientController: ClientController) => {
  const router = Router();

  // Client management (admin only for most operations)
  router.post('/', authMiddleware, requireRole('ADMIN'), clientController.createClient);
  router.get('/', authMiddleware, requireRole('ADMIN'), clientController.listClients);
  router.get('/:id', authMiddleware, clientController.getClientById); // Admin or self
  router.patch('/:id', authMiddleware, clientController.updateClientById); // Admin or self
  router.delete('/:id', authMiddleware, requireRole('ADMIN'), clientController.deleteClientById);

  return router;
};

export default createClientRoutes;
