import { SupplierRepository } from '../repositories/supplierRepository';
import { SupplierProfile } from '../types/auth';

/**
 * Supplier profile service
 */
export class SupplierService {
  constructor(private supplierRepository: SupplierRepository) {}

  /**
   * Get supplier profile by user ID
   * @param userId - User ID
   * @returns Supplier profile or null if not found
   */
  async getSupplierProfile(userId: string): Promise<SupplierProfile | null> {
    return await this.supplierRepository.findByUserId(userId);
  }

  /**
   * Get supplier profile by ID
   * @param id - Supplier profile ID
   * @returns Supplier profile or null if not found
   */
  async getSupplierProfileById(id: string): Promise<SupplierProfile | null> {
    return await this.supplierRepository.findById(id);
  }

  /**
   * Create supplier profile
   * @param supplierData - Supplier profile data
   * @returns Created supplier profile
   */
  async createSupplierProfile(supplierData: Omit<SupplierProfile, 'id_supplier_profile' | 'created_at' | 'updated_at'>): Promise<SupplierProfile> {
    return await this.supplierRepository.create(supplierData);
  }

  /**
   * Update supplier profile by user ID
   * @param userId - User ID
   * @param supplierData - Supplier profile data to update
   * @returns Updated supplier profile or null if not found
   */
  async updateSupplierProfile(userId: string, supplierData: Partial<Omit<SupplierProfile, 'id_supplier_profile' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<SupplierProfile | null> {
    return await this.supplierRepository.updateByUserId(userId, supplierData);
  }

  /**
   * Find supplier profiles with pagination and search
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @param search - Search term for identifiant_professionnel, description, email_professionnel
   * @returns Paginated list of supplier profiles
   */
  async findAll(page: number = 1, limit: number = 10, search: string = ''): Promise<{ profiles: SupplierProfile[]; total: number; page: number; limit: number; totalPages: number }> {
    return await this.supplierRepository.findAll(page, limit, search);
  }
}
