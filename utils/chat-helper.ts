import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ENV_CONFIG } from '../config/env-config';

export const sendApiResponse = (
  res: Response,
  obj: {
    status: number;
    success: boolean;
    message?: string;
    errors?: unknown;
    data: unknown;
  }
) => {
  return res.status(obj.status).send({
    status: obj.status,
    success: obj.success,
    message: obj.message,
    errors: obj.errors,
    data: obj.data,
  });
};

export const clearErrorMsg = (msg: string): string => {
  let normalized = msg.split('/').join('');
  normalized = normalized.split('"').join('');

  return normalized.includes('password')
    ? 'Must contain 8 characters, one uppercase, one lowercase, one number, and one special character'
    : normalized;
};

export const verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    return res.status(404).send({
      status: 404,
      success: false,
      message: 'Token not found',
      data: {},
    });
  }

  const token = req.headers.authorization;
  const normalizedToken = token.startsWith('Bearer ') ? token.split('Bearer ')[1] : token;

  if (!normalizedToken) {
    return res.status(401).send({
      status: 401,
      success: false,
      message: 'Verification failed',
      data: {},
    });
  }

  jwt.verify(normalizedToken, ENV_CONFIG.jwtSecret, (err, payload) => {
    if (err) {
      return res.status(401).send({
        status: 401,
        success: false,
        message: 'Verification failed',
        data: {},
      });
    }

    (req as Request & { payload?: jwt.JwtPayload | string }).payload = payload;
    next();
  });
};

export const isValidToken = (token: string | string[] | undefined) => {
  if (!token) {
    return false;
  }

  const rawToken = Array.isArray(token) ? token[0] : token;
  if (!rawToken || typeof rawToken !== 'string') {
    return false;
  }

  const normalizedToken = rawToken.startsWith('Bearer ')
    ? rawToken.split('Bearer ')[1]
    : rawToken;

  if (!normalizedToken) {
    return false;
  }

  try {
    return jwt.verify(normalizedToken, ENV_CONFIG.jwtSecret) as jwt.JwtPayload;
  } catch (error) {
    return false;
  }
};
