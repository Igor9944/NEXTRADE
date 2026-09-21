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
