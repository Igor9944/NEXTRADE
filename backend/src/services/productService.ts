import { CategoryRepository } from '../repositories/categoryRepository';
import { ProductRepository } from '../repositories/productRepository';
import { ProductWithCategories } from '../types/catalog';

export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private categoryRepository: CategoryRepository
  ) {}

  async createProduct(userId: string, productData: {
    nom?: string;
    name?: string;
    description?: string | null;
    categorie?: string | null;
    category?: string | null;
    categoryIds?: string[];
    category_id?: string | string[] | number | null;
    prix_detail?: number | string;
    price?: number | string;
    prix_gros?: number | string;
    wholesale_price?: number | string;
    wholesalePrice?: number | string;
    supplier_id?: string;
  }): Promise<ProductWithCategories> {
    const normalizedName = (productData.nom ?? productData.name ?? '').toString().trim();
    if (!normalizedName) {
      throw new Error('Product name is required');
    }

    const normalizedCategory = (productData.categorie ?? productData.category ?? '').toString().trim() || null;
    const rawCategoryIds = productData.categoryIds && productData.categoryIds.length > 0
      ? productData.categoryIds
      : productData.category_id !== undefined && productData.category_id !== null
        ? (Array.isArray(productData.category_id) ? productData.category_id : [productData.category_id])
        : [];
    const categoryIds = rawCategoryIds
      .map((value) => String(value).trim())
      .filter(Boolean);
    const detailPrice = Number(productData.prix_detail ?? productData.price ?? 0);
    const grosPrice = Number(productData.prix_gros ?? productData.wholesale_price ?? productData.wholesalePrice ?? productData.price ?? detailPrice);

    if (Number.isNaN(detailPrice) || Number.isNaN(grosPrice) || detailPrice < 0 || grosPrice < 0) {
      throw new Error('Prices must be positive or zero');
    }

    const created = await this.productRepository.create({
      id_fournisseur: userId,
      nom: normalizedName,
      description: (productData.description ?? '').toString().trim() || null,
      categorie: normalizedCategory,
      prix_detail: detailPrice,
      prix_gros: grosPrice
    });

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
    const stockQuantity = await this.productRepository.getAvailableStock(id);
    const stockStatus = stockQuantity <= 0 ? 'OUT' : stockQuantity <= 10 ? 'LOW' : 'OK';

    return {
      ...product,
      effective_price: effectivePrice,
      stock_quantity: stockQuantity,
      stock_status: stockStatus
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
