import dotenv from 'dotenv';

dotenv.config();

const {
  MONGOURL,
  JWT_SERCTET,
  SECRETKEY,
  JWT_EXPIRE_IN,
  PORT,
  CORS_WHITELIST,
  MAIL_EMAIL,
  MAIL_PASSWORD,
} = process.env;

export const ENV_CONFIG = {
  mongoUrl: MONGOURL || '',
  jwtSecret: SECRETKEY || JWT_SERCTET || '',
  jwtExpireIn: JWT_EXPIRE_IN || '7d',
  port: Number(PORT || 5000),
  corsWhitelist: CORS_WHITELIST || '',
  mailEmail: MAIL_EMAIL || '',
  mailPassword: MAIL_PASSWORD || '',
} as const;
