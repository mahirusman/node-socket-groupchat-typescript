import { Document } from 'mongoose';

export interface IUserDocument extends Document {
  email: string;
  email_verified: boolean;
  first_name: string;
  last_name: string;
  phone?: string;
  phone_verified: boolean;
  password: string;
  role?: Roles;
}

export enum Roles {
  Provider = 'therapist',
  Customer = 'customer',
  StudioAdmin = 'studio_admin',
  Admin = 'admin',
  SuperAdmin = 'super_admin',
}
