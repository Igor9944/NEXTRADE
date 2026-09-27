import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

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

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message
    });
  }

  if (error && error.name === 'MulterError') {
    const status = error.code === 'LIMIT_FILE_SIZE' ? 400 : 400;
    return res.status(status).json({
      status: 'error',
      message: error.code === 'LIMIT_FILE_SIZE' ? 'File too large' : 'Upload failed'
    });
  }

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
  console.error('Unhandled error in errorMiddleware:', error); // TEMPORARY DEBUG
  // Return more specific error info for debugging
  const errorMessage = error && error.message ? error.message : 'Unknown error';
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: errorMessage // TEMPORARY: include error message in response
  });
};