import { Roles } from '../../models/types/user-model';

export interface InputDataCreate {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: Roles;
}

export interface InputDataUpdatePhone {
  phone: string;
}
