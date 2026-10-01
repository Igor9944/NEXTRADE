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
  ui_language?: 'fr' | 'en' | 'ar';
  assistant_language?: 'fr' | 'en' | 'ar';
  created_at: Date;
  updated_at: Date;
}

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
 * Public registration only creates CLIENT accounts.
 * Privileged roles must be provisioned by an administrator/seed.
 */
export interface RegisterUserDto {
  email: string;
  password: string;
  nom_entreprise: string;
  telephone: string;
  nom: string;
  prenom: string;
  adresse: string;
  ville: string;
  pays: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface SupplierProfileDto {
  description: string;
  identifiant_professionnel: string;
  statut_verification: 'NON_VERIFIE' | 'EN_ATTENTE' | 'VERIFIE' | 'REJETE';
  date_verification: Date | null;
  email_professionnel: string;
}
