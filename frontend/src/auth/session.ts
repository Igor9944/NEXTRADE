const TOKEN_KEY = 'nextrade_token';
const USER_KEY = 'nextrade_user';

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
};

export type UserRole = 'ADMIN' | 'CLIENT' | 'FOURNISSEUR' | 'COMMERCANT' | 'TRANSPORTEUR';
const USER_ROLES = new Set<UserRole>(['ADMIN', 'CLIENT', 'FOURNISSEUR', 'COMMERCANT', 'TRANSPORTEUR']);

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getSessionUser(): SessionUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    const user: unknown = JSON.parse(raw);
    if (
      typeof user !== 'object' ||
      user === null ||
      !('id' in user) ||
      typeof user.id !== 'string' ||
      !('email' in user) ||
      typeof user.email !== 'string' ||
      !('role' in user) ||
      typeof user.role !== 'string' ||
      !USER_ROLES.has(user.role as UserRole)
    ) {
      return null;
    }
    return { id: user.id, email: user.email, role: user.role as UserRole };
  } catch {
    return null;
  }
}

export function setSession(token: string, user: SessionUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
