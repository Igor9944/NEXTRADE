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
      
      res.status(201).json(result);
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
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
