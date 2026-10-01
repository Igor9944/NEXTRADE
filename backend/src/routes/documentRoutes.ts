import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';
import { requireRole } from '../middlewares/roleMiddleware';
import { documentUpload } from '../middlewares/uploadMiddleware';

export const createDocumentRoutes = (controller: DocumentController) => {
  const router = Router();
  router.post('/', requireRole('ADMIN'), documentUpload.single('file'), controller.uploadDocument);
  router.get('/', controller.listDocuments);
  router.get('/:id/download', controller.downloadDocument);
  router.get('/:id', controller.getDocument);
  router.delete('/:id', requireRole('ADMIN'), controller.deleteDocument);
  return router;
};

export const createInvoiceRoutes = (controller: DocumentController) => {
  const router = Router();
  router.get('/:id/download', controller.downloadInvoice);
  router.get('/:id/pdf', controller.downloadInvoice);
  router.get('/:id', controller.getInvoice);
  return router;
};

export const createFormalityRoutes = (controller: DocumentController) => {
  const router = Router();
  router.patch('/:id/status', requireRole('ADMIN'), controller.updateFormalityStatus);
  router.get('/:id/history', controller.getFormalityHistory);
  return router;
};

export const createImportExportDocumentRoutes = (controller: DocumentController) => {
  const router = Router();
  router.get('/:id/documents', controller.listOperationDocuments);
  router.get('/:id/formalities', controller.listFormalities);
  return router;
};
