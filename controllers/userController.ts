import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import constants from '../config/constants';

import { ResponseStatusCodes } from '../utils/types/response_handler.utils';

import AuthService from '../services/Userservice';
import { sendResponse } from '../utils/response_handler';

import {
  filterParameters,
  requiredParametersProvided,
} from '../utils/request_handler';
import { Roles } from '../models/types/user.model';

const log = console.log;

const signToken = (id: string) => {
  const token = jwt.sign({ id }, constants.jwt_secrit, {
    expiresIn: constants.jwt_expire_in,
  });
  return token;
};

const singup = async (req: Request, res: Response) => {
  const userService = new AuthService();

  const allowedParameters = [
    'first_name',
    'last_name',
    'email',
    'password',
    'role',
  ];

  const userData = filterParameters(req.body, allowedParameters);

  console.log('userData ', userData);

  const optionalParameters = ['role'];

  if (
    !requiredParametersProvided(userData, allowedParameters, optionalParameters)
  ) {
    return sendResponse(
      {
        status_code: ResponseStatusCodes.BAD_REQUEST,
        errors: ['Please provide all the required parameters'],
      },
      res
    );
  }
  const email = (userData.email as string).toLowerCase();

  //  check if email already exists
  const registeredUser = await userService.getOne({
    email,
  });

  if (registeredUser) {
    return sendResponse(
      {
        status_code: ResponseStatusCodes.FORBIDDEN,
        errors: ['This email is already registered. Please log in.'],
      },
      res
    );
  }

  const parameters = {
    first_name: userData.first_name,
    last_name: userData.last_name as string,
    email,
    password: userData.password as string,
    role: userData.role as Roles,
  };

  const result = await userService.create(parameters);
  if (result.status) {
    const user = await userService.getOne({ _id: result.id });
    return sendResponse(
      {
        status_code: ResponseStatusCodes.OK,
        data: { user },
        messages: ['user register successfully'],
      },
      res
    );
  }
};

const login = async (req: Request, res: Response) => {
  const allowedParameters = ['password', 'email'];
  const userData = filterParameters(req.body, allowedParameters);
  if (!requiredParametersProvided(userData, allowedParameters, [])) {
    return sendResponse(
      {
        status_code: ResponseStatusCodes.BAD_REQUEST,
        errors: ['Please provide all the required parameters.'],
      },
      res
    );
  }
  const userService = new AuthService();
  const user = await userService.getOne({
    email: (userData.email ?? '').toLowerCase(),
  });

  const passwordMatched = await bcrypt.compare(
    userData.password,
    user?.password ?? ''
  );

  if (!user || !passwordMatched) {
    return sendResponse(
      {
        status_code: ResponseStatusCodes.BAD_REQUEST,
        errors: ['incorrect email or password'],
      },
      res
    );
  } else {
    return sendResponse(
      {
        status_code: ResponseStatusCodes.OK,
        data: { user },
      },
      res
    );
  }
};

export default {
  singup,
  login,
};
