import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { RegisterUserDto, LoginUserDto } from '../types/auth';

/**
 * Authentication controller
 */
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Register user endpoint
   */
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: RegisterUserDto = req.body;
      const result = await this.authService.register(userData);

      // Set JWT as HTTPOnly cookie
      res.cookie('nextrade_session', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000 // 1 hour, matching JWT expiration
      });

      // Return the user payload in the legacy top-level shape expected by tests and clients,
      // while also keeping the cookie-based session for browser use.
      // Note: accessToken is NOT returned in JSON for security - it's set as HTTPOnly cookie only
      res.status(201).json({
        status: 'success',
        message: result.message,
        user: result.user,
        data: {
          user: result.user
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login user endpoint
   */
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData: LoginUserDto = req.body;
      const result = await this.authService.login(loginData);

      // Set JWT as HTTPOnly cookie
      res.cookie('nextrade_session', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000 // 1 hour, matching JWT expiration
      });

      // Return the user payload in the legacy top-level shape expected by tests and clients,
      // while also keeping the cookie-based session for browser use.
      // Note: accessToken is NOT returned in JSON for security - it's set as HTTPOnly cookie only
      res.status(200).json({
        status: 'success',
        message: result.message,
        user: result.user,
        data: {
          user: result.user
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout user endpoint
   */
  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Clear the session cookie
      res.clearCookie('nextrade_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      res.status(200).json({
        status: 'success',
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  };
}
