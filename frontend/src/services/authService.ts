import { setSession, SessionUser } from '../auth/session';
import { apiRequest } from './http';

export async function login(email: string, password: string): Promise<SessionUser> {
  const result = await apiRequest<{ accessToken: string; user: SessionUser }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setSession(result.accessToken, result.user);
  return result.user;
}

export async function register(userData: {
  email: string;
  password: string;
  nomEntreprise: string;
  telephone: string;
}): Promise<SessionUser> {
  const result = await apiRequest<{ accessToken: string; user: SessionUser }>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  setSession(result.accessToken, result.user);
  return result.user;
}
