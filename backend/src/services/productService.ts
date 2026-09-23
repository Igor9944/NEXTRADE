import { CategoryRepository } from '../repositories/categoryRepository';
import { ProductRepository } from '../repositories/productRepository';
import { ProductWithCategories } from '../types/catalog';

export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private categoryRepository: CategoryRepository
  ) {}

  async createProduct(userId: string, productData: {
    nom: string;
    description?: string | null;
    categorie?: string | null;
    categoryIds?: string[];
    prix_detail: number;
    prix_gros: number;
  }): Promise<ProductWithCategories> {
    const normalizedName = productData.nom?.trim();
    if (!normalizedName) {
      throw new Error('Product name is required');
    }

    if (Number(productData.prix_detail) < 0 || Number(productData.prix_gros) < 0) {
      throw new Error('Prices must be positive or zero');
    }

    const created = await this.productRepository.create({
      id_fournisseur: userId,
      nom: normalizedName,
      description: productData.description?.trim() || null,
      categorie: productData.categorie?.trim() || null,
      prix_detail: Number(productData.prix_detail),
      prix_gros: Number(productData.prix_gros)
    });

    const categoryIds = productData.categoryIds || [];
    if (categoryIds.length > 0) {
      const categories = await this.categoryRepository.findByIds(categoryIds);
      if (categories.length !== categoryIds.length) {
        throw new Error('One or more categories do not exist');
      }
      await this.productRepository.attachCategories(created.id_product, categoryIds);
    }

    const finalProduct = await this.productRepository.findById(created.id_product);
    if (!finalProduct) {
      throw new Error('Failed to load created product');
    }

    return {
      ...finalProduct,
      effective_price: finalProduct.prix_detail
    };
  }

  async getProductById(id: string, profile: string = 'CLIENT'): Promise<ProductWithCategories | null> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      return null;
    }

    const effectivePrice = profile.toUpperCase() === 'CLIENT'
      ? Number(product.prix_detail).toFixed(2)
      : Number(product.prix_gros).toFixed(2);

    return {
      ...product,
      effective_price: effectivePrice
    };
  }

  async getCatalog(profile: string = 'CLIENT', filters: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  } = {}) {
    const catalog = await this.productRepository.findCatalog({
      profile,
      search: filters.search,
      category: filters.category,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      page: filters.page,
      limit: filters.limit
    });

    return {
      data: catalog.products.map((product) => ({
        ...product,
        effective_price: profile.toUpperCase() === 'CLIENT'
          ? Number(product.prix_detail).toFixed(2)
          : Number(product.prix_gros).toFixed(2)
      })),
      pagination: {
        page: catalog.page,
        limit: catalog.limit,
        total: catalog.total,
        totalPages: catalog.totalPages
      }
    };
  }
}
