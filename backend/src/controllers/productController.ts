import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { ProductService } from '../services/productService';

const getQueryString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
};

const getQueryNumber = (value: unknown): number | undefined => {
  const normalized = getQueryString(value);
  if (normalized === undefined) return undefined;
  const number = Number(normalized);
  return Number.isNaN(number) ? undefined : number;
};

export class ProductController {
  constructor(private productService: ProductService) {}

  createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'User not authenticated' });
      }

      if (req.user?.role !== 'FOURNISSEUR' && req.user?.role !== 'ADMIN') {
        return res.status(403).json({ status: 'error', message: 'Only suppliers can create products' });
      }

      const product = await this.productService.createProduct(userId, req.body || {});
      res.status(201).json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const profileValue = getQueryString(req.query.profile) ?? 'CLIENT';
      const product = await this.productService.getProductById(id, profileValue.toUpperCase());

      if (!product) {
        return res.status(404).json({ status: 'error', message: 'Product not found' });
      }

      res.status(200).json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  };

  getCatalog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profileValue = getQueryString(req.query.profile) ?? 'CLIENT';
      const result = await this.productService.getCatalog(profileValue.toUpperCase(), {
        search: getQueryString(req.query.search),
        category: getQueryString(req.query.category),
        minPrice: getQueryNumber(req.query.minPrice),
        maxPrice: getQueryNumber(req.query.maxPrice),
        page: getQueryNumber(req.query.page) ?? 1,
        limit: getQueryNumber(req.query.limit) ?? 10
      });

      res.status(200).json({
        status: 'success',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };
}
