import { IUserDocument } from '../models/types/user-model';
import { Update } from './types/service';
import BaseService from './base-service';
import { InputDataCreate } from './types/user-service';

import UserModel from '../models/user-model';

class UserService extends BaseService<IUserDocument> {
  constructor() {
    super(UserModel);
  }

  async create(inputData: InputDataCreate): Promise<Update> {
    try {
      const { firstName, lastName, email, password, role } = inputData;
      const result = await UserModel.create({
        firstName,
        lastName,
        email,
        password,
        role,
      });

      return {
        status: !!result?._id,
        id: result?._id ? String(result._id) : '',
      };
    } catch (error) {
      return {
        status: false,
        errors: [(error as Error).message],
      };
    }
  }
}

export default UserService;
