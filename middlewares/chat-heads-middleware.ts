import { NextFunction, Request, Response } from 'express';
import { sendApiResponse } from '../utils/chat-helper';

export const validateCreateChatHead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { propertyId, propertyOwnerId } = req.body || {};

  if (!propertyId || !propertyOwnerId) {
    return sendApiResponse(res, {
      status: 400,
      success: false,
      message: 'propertyId and propertyOwnerId are required',
      data: {},
    });
  }

  return next();
};

export const validateGetChatHeadMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return next();
};
