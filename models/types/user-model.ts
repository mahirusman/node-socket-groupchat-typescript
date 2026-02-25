import { HydratedDocument, Model } from 'mongoose';

export enum Roles {
  Provider = 'therapist',
  Customer = 'customer',
  StudioAdmin = 'studio_admin',
  Admin = 'admin',
  SuperAdmin = 'super_admin',
}

export interface IUser {
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone?: string;
  phoneVerified: boolean;
  password: string;
  role?: Roles;
}

export interface IUserMethods {
  nickName: string | null;
}

export type IUserDocument = HydratedDocument<IUser, IUserMethods>;
export type UserModelType = Model<IUser, {}, IUserMethods>;

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: Roles;
  phone?: string;
}
