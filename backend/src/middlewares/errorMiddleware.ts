import { Request, Response, NextFunction } from 'express';

/**
 * Error handling middleware
 */
export const errorMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error.message); // Only log the message, not the full error object for security

  // Handle specific error types
  if (error.message === 'Email already exists') {
    return res.status(409).json({
      status: 'error',
      message: 'Email already exists'
    });
  }

  if (error.message === 'Invalid credentials') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }

  // Handle password validation errors
  if (error.message.includes('Password must be at least 8 characters long')) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid password'
    });
  }

  // Default error response
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
};