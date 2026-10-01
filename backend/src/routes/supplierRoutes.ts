import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { SupplierController } from '../controllers/supplierController';
import { SupplierService } from '../services/supplierService';
import { SupplierRepository } from '../repositories/supplierRepository';

/**
 * Create supplier routes
 * @param supplierController - Supplier controller instance
 * @returns Express router
 */
export const createSupplierRoutes = (supplierController: SupplierController) => {
  const router = Router();

  // Supplier profile management (for suppliers themselves)
  router.get('/me', authMiddleware, requireRole('FOURNISSEUR'), supplierController.getMyProfile);
  router.get('/profile/me', authMiddleware, requireRole('FOURNISSEUR'), supplierController.getMyProfile);
  router.post('/', authMiddleware, requireRole('FOURNISSEUR'), supplierController.createProfile);
  router.post('/profile', authMiddleware, requireRole('FOURNISSEUR'), supplierController.createProfile);
  router.put('/me', authMiddleware, requireRole('FOURNISSEUR'), supplierController.updateProfile);
  router.put('/profile', authMiddleware, requireRole('FOURNISSEUR'), supplierController.updateProfile);
  router.patch('/me', authMiddleware, requireRole('FOURNISSEUR'), supplierController.updateProfile);
  router.patch('/profile', authMiddleware, requireRole('FOURNISSEUR'), supplierController.updateProfile);

  // Supplier management (for admins and public viewing)
  router.get('/', authMiddleware, supplierController.listSuppliers);
  router.get('/:id', authMiddleware, supplierController.getById);

  // Verification endpoints (admin only for updates)
  router.get('/:id/verification', authMiddleware, supplierController.getVerificationStatus);
  router.patch('/:id/verification', authMiddleware, requireRole('ADMIN'), supplierController.updateVerificationStatus);

  return router;
};

export default createSupplierRoutes;
