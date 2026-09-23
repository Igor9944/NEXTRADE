import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { CategoryService } from '../services/categoryService';

export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ status: 'error', message: 'Only admins can create categories' });
      }

      const category = await this.categoryService.createCategory(req.body || {});
      res.status(201).json({ status: 'success', data: category });
    } catch (error) {
      next(error);
    }
  };

  listCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);
      const search = String(req.query.search || '');

      const result = await this.categoryService.findAll(page, limit, search);
      res.status(200).json({
        status: 'success',
        data: result.categories,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
