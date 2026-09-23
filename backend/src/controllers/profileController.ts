import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/userRepository';
import { User } from '../types/auth';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * Profile controller for managing personal profile information
 */
export class ProfileController {
  constructor(private userRepository: UserRepository) {}

  /**
   * Get current user's profile
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

      const user = await this.userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Return user data without sensitive information
      const { password_hash, ...userData } = user;
      res.status(200).json({
        status: 'success',
        data: userData
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update current user's profile
   */
  updateMyProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
      }

      // Get current user data
      const currentUser = await this.userRepository.findById(userId);
      if (!currentUser) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Update only the allowed profile fields
      const { nom, prenom, adresse, ville, pays } = req.body;
      
      // Build update object with only provided fields
      const updateData: Partial<Omit<User, 'id_user' | 'email' | 'password_hash' | 'role' | 'nom_entreprise' | 'telephone' | 'created_at' | 'updated_at'>> = {};
      
      if (nom !== undefined) updateData.nom = nom;
      if (prenom !== undefined) updateData.prenom = prenom;
      if (adresse !== undefined) updateData.adresse = adresse;
      if (ville !== undefined) updateData.ville = ville;
      if (pays !== undefined) updateData.pays = pays;

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'No valid fields provided for update'
        });
      }

      // Update the user profile
      const updatedUser = await this.userRepository.updateById(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Return user data without sensitive information
      const { password_hash, ...userData } = updatedUser;
      res.status(200).json({
        status: 'success',
        data: userData
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user profile by ID (for admin viewing)
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Ensure id is a string (not an array)
      const userId = Array.isArray(id) ? id[0] : id;

      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Return user data without sensitive information
      const { password_hash, ...userData } = user;
      res.status(200).json({
        status: 'success',
        data: userData
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * List users with pagination and search (admin only)
   */
  listUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(Array.isArray(req.query.page) ? String(req.query.page[0]) : String(req.query.page)) || 1;
      const limit = parseInt(Array.isArray(req.query.limit) ? String(req.query.limit[0]) : String(req.query.limit)) || 10;
      const search = Array.isArray(req.query.search) ? String(req.query.search[0]) : String(req.query.search) ?? '';

      // Get all users (no role filter)
      const result = await this.userRepository.findByRole(null, page, limit, search);

      // Remove sensitive data from response
      const usersSafe = result.users.map(user => {
        const { password_hash, ...safe } = user;
        return safe;
      });

      res.status(200).json({
        status: 'success',
        data: usersSafe,
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
