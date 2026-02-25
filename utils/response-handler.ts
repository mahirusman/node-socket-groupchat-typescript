import { Response } from 'express';
import {
  CreateResponseOptions,
  ResponseStatusCodes,
} from './types/response-handler-utils';

export function sendResponse(options: CreateResponseOptions, res: Response): void {
  const { id, statusCode, data, errors, messages } = options;

  if (statusCode === ResponseStatusCodes.OK || statusCode === ResponseStatusCodes.CREATED) {
    if (typeof data !== 'object' && !messages?.length) {
      res.status(ResponseStatusCodes.INTERNAL_ERROR).json({
        success: false,
        errors: errors || ['Unknown error occurred while processing.'],
      });
      return;
    }

    res.status(statusCode).json({
      success: true,
      id: id ?? undefined,
      data: data ?? undefined,
      messages: messages ?? undefined,
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    errors: errors || [],
  });
}
