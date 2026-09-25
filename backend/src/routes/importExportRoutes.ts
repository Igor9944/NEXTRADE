import { Router } from 'express';
import { ImportExportController } from '../controllers/importExportController';
import { ImportExportService } from '../services/importExportService';
import { ImportExportRepository } from '../repositories/importExportRepository';
import { Pool } from 'pg';

export function createImportExportRoutes(pool: Pool): Router {
  const router = Router();
  const repository = new ImportExportRepository(pool);
  const service = new ImportExportService(repository);
  const controller = new ImportExportController(service);

  // POST /api/v1/import-export
  router.post('/', controller.createOperation.bind(controller));

  // GET /api/v1/import-export
  router.get('/', controller.listOperations.bind(controller));

  // GET /api/v1/import-export/:id
  router.get('/:id', controller.getOperationById.bind(controller));

  // PATCH /api/v1/import-export/:id/status
  router.patch('/:id/status', controller.updateOperationStatus.bind(controller));

  // DELETE /api/v1/import-export/:id
  router.delete('/:id', controller.deleteOperation.bind(controller));

  return router;
}
