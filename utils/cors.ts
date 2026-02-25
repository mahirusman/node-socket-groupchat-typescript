import { ENV_CONFIG } from '../config/env-config';

const parseEnvList = (value: string): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const whitelist = parseEnvList(ENV_CONFIG.corsWhitelist);
const WHITELIST_PATTERNS = [/^https?:\/\/([a-z0-9-]+\.)?hutfin\.com$/i];

export const isOriginAllowed = (origin?: string): boolean => {
  if (!origin) {
    return true;
  }

  if (whitelist.includes(origin)) {
    return true;
  }

  return WHITELIST_PATTERNS.some((pattern) => pattern.test(origin));
};

export const corsOriginValidator = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => {
  if (isOriginAllowed(origin)) {
    return callback(null, true);
  }

  return callback(new Error('Not allowed by CORS'));
};
