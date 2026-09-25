import { Request, Response } from 'express';
import { ImportExportService } from '../services/importExportService';
import {
  ImportExportOperationRecord,
  ImportExportItemRecord,
  ImportExportOperationType,
  ImportExportOperationStatus,
} from '../types/importExport';

export class ImportExportController {
  constructor(private importExportService: ImportExportService) {}

  // POST /api/v1/import-export
  async createOperation(req: Request, res: Response): Promise<void> {
    try {
      const {
        type_operation,
        id_order,
        id_purchase,
        reference_operation,
        pays_origine,
        pays_destination,
        statut,
        date_depart,
        date_arrivee_prevue,
        mode_transport,
        items,
      } = req.body;

      const result = await this.importExportService.createImportExportOperation({
        type_operation,
        id_order,
        id_purchase,
        reference_operation,
        pays_origine,
        pays_destination,
        statut,
        date_depart,
        date_arrivee_prevue,
        mode_transport,
        items,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Unknown error',
      });
    }
  }

  // GET /api/v1/import-export/:id
  async getOperationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const operationId = Array.isArray(id) ? id[0] : id;
      const result = await this.importExportService.getOperationById(operationId);

      if (!result.operation) {
        res.status(404).json({
          success: false,
          error: 'Operation not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Unknown error',
      });
    }
  }

  // GET /api/v1/import-export
  async listOperations(req: Request, res: Response): Promise<void> {
    try {
      const filters: {
        type_operation?: ImportExportOperationType;
        statut?: ImportExportOperationStatus;
        pays_origine?: string;
        pays_destination?: string;
        reference_operation?: string;
        page?: number;
        limit?: number;
      } = {};

      if (req.query.type_operation) {
        filters.type_operation = req.query.type_operation as ImportExportOperationType;
      }

      if (req.query.statut) {
        filters.statut = req.query.statut as ImportExportOperationStatus;
      }

      if (req.query.pays_origine) {
        filters.pays_origine = req.query.pays_origine as string;
      }

      if (req.query.pays_destination) {
        filters.pays_destination = req.query.pays_destination as string;
      }

      if (req.query.reference_operation) {
        filters.reference_operation = req.query.reference_operation as string;
      }

      if (req.query.page) {
        filters.page = parseInt(req.query.page as string);
      }

      if (req.query.limit) {
        filters.limit = parseInt(req.query.limit as string);
      }

      // Remove undefined filters
      Object.keys(filters).forEach((key) => {
        if (filters[key as keyof typeof filters] === undefined) {
          delete filters[key as keyof typeof filters];
        }
      });

      const result = await this.importExportService.listOperations(filters);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Unknown error',
      });
    }
  }

  // PATCH /api/v1/import-export/:id/status
  async updateOperationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const operationId = Array.isArray(id) ? id[0] : id;
      const { statut } = req.body;

      if (!statut) {
        res.status(400).json({
          success: false,
          error: 'Status is required',
        });
        return;
      }

      const updatedOperation = await this.importExportService.updateOperationStatus(
        operationId,
        statut
      );

      if (!updatedOperation) {
        res.status(404).json({
          success: false,
          error: 'Operation not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedOperation,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Unknown error',
      });
    }
  }

  // DELETE /api/v1/import-export/:id
  async deleteOperation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const operationId = Array.isArray(id) ? id[0] : id;
      const deleted = await this.importExportService.deleteOperation(operationId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Operation not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Operation deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Unknown error',
      });
    }
  }
}
