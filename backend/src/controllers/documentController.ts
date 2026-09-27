import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { DocumentService } from '../services/documentService';
import { Actor } from '../types/document';
import { AppError } from '../utils/appError';

export class DocumentController {
  constructor(private documentService: DocumentService) {}

  private actor(req: AuthRequest): Actor {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    return req.user;
  }

  private param(req: AuthRequest, name: string): string {
    const value = req.params[name];
    return Array.isArray(value) ? value[0] : value;
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

  private sendFile(res: Response, payload: { buffer: Buffer; mime_type: string; file_name: string }) {
    res.setHeader('Content-Type', payload.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${payload.file_name.replace(/"/g, '')}"`);
    return res.status(200).send(payload.buffer);
  }

  uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      if (!file) {
        throw new AppError('File is required', 400);
      }
      const document = await this.documentService.uploadDocument(this.actor(req), file, {
        type_document: String(req.body.type_document || ''),
        id_order: req.body.id_order || undefined,
        id_operation: req.body.id_operation || undefined,
        id_shipment: req.body.id_shipment || undefined
      });
      return res.status(201).json({ status: 'success', data: document });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  listDocuments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.documentService.listDocuments(this.actor(req), {
        id_order: req.query.id_order as string | undefined,
        id_operation: req.query.id_operation as string | undefined,
        id_shipment: req.query.id_shipment as string | undefined,
        type_document: req.query.type_document as string | undefined,
        page: req.query.page as string | undefined,
        limit: req.query.limit as string | undefined
      });
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  getDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.documentService.getDocument(this.actor(req), this.param(req, 'id'));
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  downloadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const payload = await this.documentService.downloadDocument(this.actor(req), this.param(req, 'id'));
      return this.sendFile(res, payload);
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  deleteDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const document = await this.documentService.deleteDocument(this.actor(req), this.param(req, 'id'));
      return res.status(200).json({ status: 'success', data: document });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  generateInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.documentService.generateInvoice(this.actor(req), this.param(req, 'id'));
      return res.status(201).json({ status: 'success', data: result });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  generatePackingList = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const document = await this.documentService.generatePackingList(this.actor(req), this.param(req, 'id'));
      return res.status(201).json({ status: 'success', data: document });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  listOrderDocuments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.documentService.getOrderDossier(this.actor(req), this.param(req, 'id'));
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  getInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.documentService.getInvoice(this.actor(req), this.param(req, 'id'));
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  downloadInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const payload = await this.documentService.downloadInvoice(this.actor(req), this.param(req, 'id'));
      return this.sendFile(res, payload);
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  listOperationDocuments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.documentService.listDocuments(this.actor(req), {
        id_operation: this.param(req, 'id')
      });
      return res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  listFormalities = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const formalities = await this.documentService.listFormalities(this.actor(req), this.param(req, 'id'));
      return res.status(200).json({ status: 'success', data: { formalities } });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  updateFormalityStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const formality = await this.documentService.updateFormalityStatus(
        this.actor(req),
        this.param(req, 'id'),
        String(req.body.statut || ''),
        req.body.comment
      );
      return res.status(200).json({ status: 'success', data: formality });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };

  getFormalityHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const history = await this.documentService.getFormalityHistory(this.actor(req), this.param(req, 'id'));
      return res.status(200).json({ status: 'success', data: { history } });
    } catch (error) {
      return this.handle(error, res, next);
    }
  };
}
