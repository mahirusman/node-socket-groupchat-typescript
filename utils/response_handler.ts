import {
  CreateResponseOptions,
  ResponseStatusCodes,
} from './types/response_handler.utils';
import { Response } from 'express';

export function sendResponse(
  options: CreateResponseOptions,
  res: Response
): void {
  const { id, status_code, data, errors, messages } = options;
  if (
    status_code === ResponseStatusCodes.OK ||
    status_code === ResponseStatusCodes.CREATED
  ) {
    if (typeof data !== 'object' && !messages?.length) {
      res.status(ResponseStatusCodes.INTERNAL_ERROR).json({
        success: false,
        errors: errors || ['Unknown error occurred while processing.'],
      });
    } else {
      res.status(status_code).json({
        success: true,
        id: id ?? undefined,
        data: data ?? undefined,
        messages: messages ?? undefined,
      });
    }
  } else {
    res.status(status_code).json({
      success: false,
      errors: errors || [],
    });
  }
}
