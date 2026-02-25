import { NextFunction, Request, Response } from 'express';
import { AppError } from './app-error';

interface AppErrorType extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  errors?: Record<string, any>;
  code?: number;
  errmsg?: string;
  path?: string;
  value?: any;
}

const handleCastErrorDb = (err: AppErrorType): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDb = (err: AppErrorType): AppError => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0] || 'unknown value';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDb = (err: AppErrorType): AppError => {
  const validationErrors = Object.values(err.errors || {}).map((el: any) => el.message);
  const message = `Invalid input data. ${validationErrors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err: AppErrorType, res: Response): void => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    error: {
      code: err.name || 'ERROR',
      message: err.message,
    },
    debug: {
      status: err.status || 'error',
      raw: err,
      stack: err.stack,
    },
  });
};

const sendErrorProd = (err: AppErrorType, res: Response): void => {
  if (err.isOperational) {
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
      success: false,
      status: statusCode,
      error: {
        code: err.name || 'ERROR',
        message: err.message,
      },
    });
    return;
  }

  console.error('ERROR', err);

  res.status(500).json({
    success: false,
    status: 500,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went very wrong!',
    },
  });
};

export const globalErrorHandler = (
  err: AppErrorType,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
    return;
  }

  let error: AppErrorType = {
    ...err,
    name: err.name,
    message: err.message,
  };

  if (error.name === 'CastError') {
    error = handleCastErrorDb(error);
  }

  if (error.code === 11000) {
    error = handleDuplicateFieldsDb(error);
  }

  if (error.name === 'ValidationError') {
    error = handleValidationErrorDb(error);
  }

  sendErrorProd(error, res);
};
