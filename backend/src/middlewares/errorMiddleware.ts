import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

export const errorMiddleware = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Unhandled error:', error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message
    });
  }

  if (error && error.name === 'MulterError') {
    return res.status(400).json({
      status: 'error',
      message: error.code === 'LIMIT_FILE_SIZE' ? 'File too large' : 'Upload failed'
    });
  }

  if (error?.type === 'entity.too.large') {
    return res.status(413).json({
      status: 'error',
      message: 'Request body too large'
    });
  }

  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON payload'
    });
  }

  if (error?.message === 'Email already exists') {
    return res.status(409).json({
      status: 'error',
      message: 'Email already exists'
    });
  }

  if (error?.message === 'Invalid email') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid email'
    });
  }

  if (error?.message === 'Invalid credentials') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }

  if (typeof error?.message === 'string' && error.message.startsWith('Password must be at least')) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid password'
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};
