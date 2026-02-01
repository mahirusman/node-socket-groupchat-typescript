import { IUserDocument, Roles } from '../../models/types/user.model';

export interface InputDataCreate {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Roles;
}
export interface InputDataUpdatePhone {
  phone: string;
}
