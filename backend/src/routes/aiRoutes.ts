import { Router } from 'express';
import { AiController } from '../controllers/aiController';

export const createAiRoutes = (controller: AiController) => {
  const router = Router();
  router.post('/chat', controller.chat);
  return router;
};
