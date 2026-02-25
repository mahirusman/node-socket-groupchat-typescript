import { NextFunction, Request, Response } from 'express';
import { sendApiResponse } from '../utils/chat-helper';

export const validateCreateMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { chatHead, medias, body } = req.body || {};

  if (!chatHead) {
    return sendApiResponse(res, {
      status: 400,
      success: false,
      message: 'chatHead is required',
      data: {},
    });
  }

  if (typeof body !== 'undefined' && typeof body !== 'string') {
    return sendApiResponse(res, {
      status: 400,
      success: false,
      message: 'body must be a string',
      data: {},
    });
  }

  if (typeof medias !== 'undefined' && !Array.isArray(medias)) {
    return sendApiResponse(res, {
      status: 400,
      success: false,
      message: 'medias must be an array',
      data: {},
    });
  }

  return next();
};

export const validateGetMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return next();
};
