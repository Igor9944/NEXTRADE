import jwt from 'jsonwebtoken';
import { Request } from 'express';

/**
 * JWT payload interface
 */
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Generate JWT token
 * @param payload - User data to include in token
 * @returns Signed JWT token
 */
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  } as jwt.SignOptions);
};

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param req - Express request object
 * @returns Token string or null if not found
 */
export const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};
