export enum ResponseStatusCodes {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
}

export interface CreateResponseOptions {
  id?: string;
  status_code: ResponseStatusCodes;
  data?: {
    [key: string]: unknown;
  };
  errors?: Array<string>;
  messages?: Array<string>;
}
