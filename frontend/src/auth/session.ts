import { apiRequest } from '../services/http';

let currentUserCache: SessionUser | null = null;
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
};

export type UserRole = 'ADMIN' | 'CLIENT' | 'FOURNISSEUR' | 'COMMERCANT' | 'TRANSPORTEUR';
const USER_ROLES = new Set<UserRole>(['ADMIN', 'CLIENT', 'FOURNISSEUR', 'COMMERCANT', 'TRANSPORTEUR']);

/**
 * Initialize session by checking authentication status with backend
 * Should be called once when app loads
 */
export async function initializeSession(): Promise<void> {
  if (isInitialized) {
    return;
  }

  if (initializationPromise) {
    await initializationPromise;
    return;
  }

  initializationPromise = (async () => {
    try {
      const data = await apiRequest<{
        status: string;
        data: {
          id?: string;
          id_user?: string;
          email: string;
          role: string;
        };
      }>('/api/v1/profile/me');

      if (data.status === 'success' && data.data) {
        const userData = data.data;
        const userId = userData.id ?? userData.id_user;
        // Validate user data
        if (
          typeof userData === 'object' &&
          userData !== null &&
          typeof userId === 'string' &&
          typeof userData.email === 'string' &&
          typeof userData.role === 'string' &&
          USER_ROLES.has(userData.role as UserRole)
        ) {
          currentUserCache = {
            id: userId,
            email: userData.email,
            role: userData.role as UserRole
          };
        }
      }
      // If not ok or invalid data, currentUserCache remains null
    } catch (error) {
      // On error, treat as not authenticated
      currentUserCache = null;
    } finally {
      isInitialized = true;
      initializationPromise = null;
    }
  })();

  await initializationPromise;
}

/**
 * Get session user from cache (synchronous)
 * Returns null if not initialized or not authenticated
 */
export function getSessionUser(): SessionUser | null {
  return currentUserCache;
}

/**
 * Clear session cache
 */
export function clearSession(): void {
  currentUserCache = null;
  isInitialized = false;
  initializationPromise = null;
}

/**
 * Set session user in cache (used after login/register)
 * Note: Token is handled via httpOnly cookie by backend
 */
export function setSession(token: string, user: SessionUser): void {
  currentUserCache = user;
  isInitialized = true; // Mark as initialized since we have user data
}

// Legacy function - tokens are now in cookies, not accessible to JS
export function getToken(): string | null {
  return null;
}