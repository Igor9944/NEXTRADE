import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/userRepository';
import { User } from '../types/auth';
import { AuthRequest } from '../middlewares/authMiddleware';
import { hashPassword, validatePassword } from '../utils/password';

/**
 * Client controller for managing client-specific operations
 */
export class ClientController {
  constructor(private userRepository: UserRepository) {}

  /**
   * Create a new client
   * Note: This is typically done via auth/register with role: 'CLIENT'
   * This endpoint is provided for completeness
   */
  createClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is admin (only admins can create clients directly)
      const authReq = req as AuthRequest;
      if (authReq.user?.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Only admins can create clients directly'
        });
      }

      const { password, ...clientDataWithoutPassword } = req.body;

      // Validate password strength
      if (!password || !validatePassword(password)) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one digit, and one special character'
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Ensure role is set to CLIENT
      const userData = {
        ...clientDataWithoutPassword,
        role: 'CLIENT' as const,
        password_hash: passwordHash
      };

      const client = await this.userRepository.create(userData);

      // Return client data without sensitive information
      const { password_hash, ...clientDataSafe } = client;
      res.status(201).json({
        status: 'success',
        data: clientDataSafe
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * List clients with pagination and search
   */
  listClients = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is admin
      const authReq = req as AuthRequest;
      if (authReq.user?.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Only admins can list clients'
        });
      }

      const page = parseInt(Array.isArray(req.query.page) ? String(req.query.page[0]) : String(req.query.page)) || 1;
      const limit = parseInt(Array.isArray(req.query.limit) ? String(req.query.limit[0]) : String(req.query.limit)) || 10;
      const search = Array.isArray(req.query.search) ? String(req.query.search[0]) : String(req.query.search) ?? '';

      const result = await this.userRepository.findByRole('CLIENT', page, limit, search);
      
      // Remove sensitive data from response
      const clientsSafe = result.users.map(user => {
        const { password_hash, ...safe } = user;
        return safe;
      });

      res.status(200).json({
        status: 'success',
        data: clientsSafe,
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
   * Get client by ID
   */
  getClientById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is admin or the client themselves
      const authReq = req as AuthRequest;
      const { id } = req.params;

      // Ensure id is a string (not an array)
      const userId = Array.isArray(id) ? id[0] : id;

      const client = await this.userRepository.findById(userId);
      
      if (!client) {
        return res.status(404).json({
          status: 'error',
          message: 'Client not found'
        });
      }

      // Check authorization: admin can view any client, client can view own profile
      if (authReq.user?.role !== 'ADMIN' && authReq.user?.id !== id) {
        return res.status(403).json({
          status: 'error',
          message: 'Insufficient permissions to view this client'
        });
      }

      // Return client data without sensitive information
      const { password_hash, ...clientDataSafe } = client;
      res.status(200).json({
        status: 'success',
        data: clientDataSafe
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update client by ID
   */
  updateClientById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is admin or the client themselves
      const authReq = req as AuthRequest;
      const { id } = req.params;

      // Ensure id is a string (not an array)
      const userId = Array.isArray(id) ? id[0] : id;

      // Check if client exists
      const existingClient = await this.userRepository.findById(userId);
      if (!existingClient) {
        return res.status(404).json({
          status: 'error',
          message: 'Client not found'
        });
      }

      // Check authorization: admin can update any client, client can update own profile
      if (authReq.user?.role !== 'ADMIN' && authReq.user?.id !== id) {
        return res.status(403).json({
          status: 'error',
          message: 'Insufficient permissions to update this client'
        });
      }

      // Prevent non-admins from changing role
      const updateData: Partial<Omit<User, 'id_user' | 'created_at' | 'updated_at'>> = { ...req.body };
      if (authReq.user?.role !== 'ADMIN' && updateData.role !== undefined) {
        delete updateData.role; // Non-admins cannot change role
      }

      // Update the client
      const updatedClient = await this.userRepository.updateById(userId, updateData);
      
      if (!updatedClient) {
        return res.status(404).json({
          status: 'error',
          message: 'Client not found'
        });
      }

      // Return client data without sensitive information
      const { password_hash, ...clientDataSafe } = updatedClient;
      res.status(200).json({
        status: 'success',
        data: clientDataSafe
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete client by ID
   */
  deleteClientById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is admin
      const authReq = req as AuthRequest;
      if (authReq.user?.role !== 'ADMIN') {
        return res.status(403).json({
          status: 'error',
          message: 'Only admins can delete clients'
        });
      }

      const { id } = req.params;

      // Ensure id is a string (not an array)
      const userId = Array.isArray(id) ? id[0] : id;

      // Check if client exists
      const existingClient = await this.userRepository.findById(userId);
      if (!existingClient) {
        return res.status(404).json({
          status: 'error',
          message: 'Client not found'
        });
      }

      // Prevent self-deletion (optional safety measure)
      if (authReq.user?.id === id) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot delete your own account'
        });
      }

      // Delete the client
      const deleted = await this.userRepository.deleteById(userId);
      
      if (!deleted) {
        return res.status(404).json({
          status: 'error',
          message: 'Client not found'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Client deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
