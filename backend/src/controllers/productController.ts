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

      const requestedSupplierId = typeof req.body?.supplier_id === 'string' ? req.body.supplier_id : undefined;
      const effectiveUserId = req.user?.role === 'ADMIN' && requestedSupplierId ? requestedSupplierId : userId;

      const normalizedBody = {
        ...req.body,
        nom: req.body?.nom ?? req.body?.name,
        name: req.body?.name ?? req.body?.nom,
        categorie: req.body?.categorie ?? req.body?.category ?? req.body?.category_name ?? null,
        category: req.body?.category ?? req.body?.categorie ?? req.body?.category_name ?? null,
        categoryIds: Array.isArray(req.body?.categoryIds)
          ? req.body.categoryIds
          : Array.isArray(req.body?.category_id)
            ? req.body.category_id
            : typeof req.body?.category_id === 'string'
              ? [req.body.category_id]
              : undefined,
        prix_detail: req.body?.prix_detail ?? req.body?.price ?? req.body?.unit_price,
        prix_gros: req.body?.prix_gros ?? req.body?.wholesale_price ?? req.body?.wholesalePrice ?? req.body?.price,
        description: req.body?.description ?? req.body?.details ?? null
      };

      const product = await this.productService.createProduct(effectiveUserId, normalizedBody || {});
      res.status(201).json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const authRole = (req as AuthRequest).user?.role;
      const queryProfile = getQueryString(req.query.profile)?.toUpperCase();
      const profileValue =
        authRole === 'COMMERCANT' ? 'COMMERCANT' : authRole === 'CLIENT' ? 'CLIENT' : queryProfile ?? 'CLIENT';
      const product = await this.productService.getProductById(id, profileValue);

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
      const authRole = (req as AuthRequest).user?.role;
      const queryProfile = getQueryString(req.query.profile)?.toUpperCase();
      const profileValue =
        authRole === 'COMMERCANT' ? 'COMMERCANT' : authRole === 'CLIENT' ? 'CLIENT' : queryProfile ?? 'CLIENT';
      const result = await this.productService.getCatalog(profileValue, {
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
