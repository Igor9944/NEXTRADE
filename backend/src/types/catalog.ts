export type ProductRoleProfile = 'CLIENT' | 'COMMERCANT' | 'FOURNISSEUR' | 'ADMIN' | 'TRANSPORTEUR';

export interface Category {
  id_category: string;
  nom: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id_product: string;
  id_fournisseur: string;
  nom: string;
  description: string | null;
  categorie: string | null;
  prix_detail: number;
  prix_gros: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProductWithCategories extends Product {
  categories: string[];
  effective_price: number | string;
}

export interface CreateCategoryDto {
  nom: string;
  description?: string | null;
}

export interface CreateProductDto {
  nom: string;
  description?: string | null;
  categorie?: string | null;
  categoryIds?: string[];
  prix_detail: number;
  prix_gros: number;
}
