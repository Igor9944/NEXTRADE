import { setSession, clearSession, SessionUser } from '../auth/session';
import { apiRequest } from './http';

type AuthSuccessResponse = {
  status: string;
  data: {
    user: SessionUser;
  };
};

export async function login(email: string, password: string): Promise<SessionUser> {
  const result = await apiRequest<AuthSuccessResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  // The JWT is stored in the HTTPOnly cookie by the backend.
  setSession('', result.data.user);
  return result.data.user;
}

export async function register(userData: {
  email: string;
  password: string;
  nomEntreprise: string;
  telephone: string;
}): Promise<SessionUser> {
  const result = await apiRequest<AuthSuccessResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });

  // The JWT is stored in the HTTPOnly cookie by the backend.
  setSession('', result.data.user);
  return result.data.user;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<{ status: string; message: string }>('/api/v1/auth/logout', {
      method: 'POST'
    });
  } finally {
    // Always clear frontend session even if logout request fails
    clearSession();
  }
}