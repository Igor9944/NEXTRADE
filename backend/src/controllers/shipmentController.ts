import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ShipmentService } from '../services/shipmentService';
import { Actor, ShipmentStatus } from '../types/shipment';
import { AppError } from '../utils/appError';

export class ShipmentController {
  constructor(private shipmentService: ShipmentService) {}

  private actor(req: AuthRequest): Actor {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    return req.user;
  }

  private handle(error: unknown, res: Response, next: NextFunction) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message
      });
    }
    return next(error);
  }

  createShipment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const shipment = await this.shipmentService.createShipment(this.actor(req), req.body || {});
      return res.status(201).json({ status: 'success', data: shipment });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  listShipments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.shipmentService.listShipments(this.actor(req), {
        statut: req.query.statut as ShipmentStatus | undefined,
        transporteur_id: req.query.transporteur_id as string | undefined,
        reference_shipment: req.query.reference_shipment as string | undefined,
        id_order: req.query.id_order as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined
      });
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  listMyShipments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.shipmentService.listMyShipments(this.actor(req), {
        statut: req.query.statut as ShipmentStatus | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined
      });
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  listAssignedShipments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.shipmentService.listAssignedShipments(this.actor(req), {
        statut: req.query.statut as ShipmentStatus | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined
      });
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  getShipmentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.shipmentService.getShipmentById(this.actor(req), id);
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  assignTransporter = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.shipmentService.assignTransporter(
        this.actor(req),
        id,
        req.body?.transporteur_id
      );
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const statut = req.body?.statut ?? req.body?.status;
      const result = await this.shipmentService.updateStatus(
        this.actor(req),
        id,
        statut,
        req.body?.comment
      );
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  confirmDelivery = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.shipmentService.confirmDelivery(this.actor(req), id, req.body || {});
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };
}
