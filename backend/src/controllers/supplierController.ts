import { Request, Response, NextFunction } from 'express';
import { SupplierService } from '../services/supplierService';
import { SupplierProfileDto } from '../types/auth';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * Supplier controller
 */
export class SupplierController {
  constructor(private supplierService: SupplierService) {}

  /**
   * Get current user's supplier profile
   */
  getMyProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
      }

      const profile = await this.supplierService.getSupplierProfile(userId);
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Supplier profile not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create supplier profile
   */
  createProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
      }

      // Check if user is a supplier
      if (req.user?.role !== 'FOURNISSEUR') {
        return res.status(403).json({
          status: 'error',
          message: 'Only suppliers can create supplier profiles'
        });
      }

      // Check if profile already exists
      const existingProfile = await this.supplierService.getSupplierProfile(userId);
      if (existingProfile) {
        return res.status(409).json({
          status: 'error',
          message: 'Supplier profile already exists'
        });
      }

      const supplierData: SupplierProfileDto = req.body;
      const profile = await this.supplierService.createSupplierProfile({
        ...supplierData,
        user_id: userId
      });

      res.status(201).json({
        status: 'success',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update supplier profile
   */
  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
      }

      // Check if user is a supplier
      if (req.user?.role !== 'FOURNISSEUR') {
        return res.status(403).json({
          status: 'error',
          message: 'Only suppliers can update supplier profiles'
        });
      }

      const supplierData: Partial<SupplierProfileDto> = req.body;
      const profile = await this.supplierService.updateSupplierProfile(userId, supplierData);
      
      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Supplier profile not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get supplier profile by ID (for admin or public viewing)
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Ensure id is a string (not an array)
      const supplierProfileId = Array.isArray(id) ? id[0] : id;

      const profile = await this.supplierService.getSupplierProfileById(supplierProfileId);

      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Supplier profile not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * List suppliers with pagination and search
   */
  listSuppliers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(Array.isArray(req.query.page) ? String(req.query.page[0]) : String(req.query.page)) || 1;
      const limit = parseInt(Array.isArray(req.query.limit) ? String(req.query.limit[0]) : String(req.query.limit)) || 10;
      const search = Array.isArray(req.query.search) ? String(req.query.search[0]) : String(req.query.search) ?? '';

      const result = await this.supplierService.findAll(page, limit, search);

      res.status(200).json({
        status: 'success',
        data: result.profiles,
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

  /**
   * Get supplier verification status
   */
  getVerificationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Ensure id is a string (not an array)
      const supplierProfileId = Array.isArray(id) ? id[0] : id;

      const profile = await this.supplierService.getSupplierProfileById(supplierProfileId);

      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Supplier profile not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          user_id: profile.user_id,
          statut_verification: profile.statut_verification,
          date_verification: profile.date_verification
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update supplier verification status (Admin only)
   */
  updateVerificationStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Check if user is admin
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Only admins can update verification status'
        });
      }

      const { id } = req.params; // This is supplier profile ID

      // Ensure id is a string (not an array)
      const supplierProfileId = Array.isArray(id) ? id[0] : id;

      const { statut_verification } = req.body;

      // Validate statut_verification
      const validStatuses = ['NON_VERIFIE', 'EN_ATTENTE', 'VERIFIE', 'REJETE'];
      if (!statut_verification || !validStatuses.includes(statut_verification)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid verification status. Must be one of: NON_VERIFIE, EN_ATTENTE, VERIFIE, REJETE'
        });
      }

      // First get the profile to get the user_id
      const profile = await this.supplierService.getSupplierProfileById(supplierProfileId);

      if (!profile) {
        return res.status(404).json({
          status: 'error',
          message: 'Supplier profile not found'
        });
      }

      const updatedProfile = await this.supplierService.updateSupplierProfile(profile.user_id, {
        statut_verification,
        date_verification: statut_verification === 'VERIFIE' || statut_verification === 'REJETE' ? new Date() : null
      });

      if (!updatedProfile) {
        return res.status(404).json({
          status: 'error',
          message: 'Supplier profile not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: updatedProfile
      });
    } catch (error) {
      next(error);
    }
  };
}
