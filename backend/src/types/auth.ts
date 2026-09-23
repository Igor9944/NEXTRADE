/**
 * User type
 */
export interface User {
  id_user: string;
  email: string;
  password_hash: string;
  role: 'ADMIN' | 'FOURNISSEUR' | 'CLIENT' | 'COMMERCANT' | 'TRANSPORTEUR';
  nom_entreprise: string | null;
  telephone: string | null;
  nom: string | null;
  prenom: string | null;
  adresse: string | null;
  ville: string | null;
  pays: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Supplier profile type
 */
export interface SupplierProfile {
  id_supplier_profile: string;
  user_id: string;
  description: string | null;
  identifiant_professionnel: string | null;
  statut_verification: 'NON_VERIFIE' | 'EN_ATTENTE' | 'VERIFIE' | 'REJETE';
  date_verification: Date | null;
  email_professionnel: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * User registration data
 */
export interface RegisterUserDto {
  email: string;
  password: string;
  role: 'ADMIN' | 'FOURNISSEUR' | 'CLIENT' | 'COMMERCANT' | 'TRANSPORTEUR';
  nom_entreprise: string;
  telephone: string;
  nom: string;
  prenom: string;
  adresse: string;
  ville: string;
  pays: string;
}

/**
 * User login data
 */
export interface LoginUserDto {
  email: string;
  password: string;
}

/**
 * Auth response data
 */
export interface AuthResponse {
  message: string;
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Supplier profile data for creation/update
 */
export interface SupplierProfileDto {
  description: string;
  identifiant_professionnel: string;
  statut_verification: 'NON_VERIFIE' | 'EN_ATTENTE' | 'VERIFIE' | 'REJETE';
  date_verification: Date | null;
  email_professionnel: string;
}
