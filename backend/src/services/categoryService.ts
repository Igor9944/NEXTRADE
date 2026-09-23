import { CategoryRepository } from '../repositories/categoryRepository';
import { Category } from '../types/catalog';

export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async createCategory(data: { nom: string; description?: string | null }): Promise<Category> {
    const normalizedName = data.nom?.trim();
    if (!normalizedName) {
      throw new Error('Category name is required');
    }

    const existing = await this.categoryRepository.findByName(normalizedName);
    if (existing) {
      throw new Error('Category already exists');
    }

    return this.categoryRepository.create({
      nom: normalizedName,
      description: data.description?.trim() || null
    });
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return this.categoryRepository.findById(id);
  }

  async findAll(page = 1, limit = 10, search = ''): Promise<{ categories: Category[]; total: number; page: number; limit: number; totalPages: number }> {
    return this.categoryRepository.findAll(page, limit, search);
  }
}
