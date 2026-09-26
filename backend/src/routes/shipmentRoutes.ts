import { Router } from 'express';
import { ShipmentController } from '../controllers/shipmentController';
import { requireRole } from '../middlewares/roleMiddleware';

export const createShipmentRoutes = (controller: ShipmentController) => {
  const router = Router();

  router.post('/', requireRole('ADMIN'), controller.createShipment);
  router.get('/', requireRole('ADMIN'), controller.listShipments);
  router.get('/my', requireRole('CLIENT', 'COMMERCANT'), controller.listMyShipments);
  router.get('/my-assigned', requireRole('TRANSPORTEUR'), controller.listAssignedShipments);
  router.get('/:id', controller.getShipmentById);
  router.patch('/:id/assign', requireRole('ADMIN'), controller.assignTransporter);
  router.patch('/:id/status', controller.updateStatus);
  router.patch('/:id/delivery', controller.confirmDelivery);

  return router;
};

export default createShipmentRoutes;
