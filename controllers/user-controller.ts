import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import { ResponseStatusCodes } from '../utils/types/response-handler-utils';
import UserService from '../services/user-service';
import { sendResponse } from '../utils/response-handler';
import {
  filterParameters,
  requiredParametersProvided,
} from '../utils/request-handler';
import { Roles } from '../models/types/user-model';

const signup = async (req: Request, res: Response) => {
  const userService = new UserService();

  const allowedParameters = ['firstName', 'lastName', 'email', 'password', 'role'];
  const userData = filterParameters(req.body, allowedParameters);
  const optionalParameters = ['role'];

  if (!requiredParametersProvided(userData, allowedParameters, optionalParameters)) {
    return sendResponse(
      {
        statusCode: ResponseStatusCodes.BAD_REQUEST,
        errors: ['Please provide all required parameters'],
      },
      res
    );
  }

  const email = String(userData.email).toLowerCase();

  const registeredUser = await userService.getOne({ email });
  if (registeredUser) {
    return sendResponse(
      {
        statusCode: ResponseStatusCodes.FORBIDDEN,
        errors: ['This email is already registered. Please log in.'],
      },
      res
    );
  }

  const result = await userService.create({
    firstName: String(userData.firstName),
    lastName: String(userData.lastName),
    email,
    password: String(userData.password),
    role: userData.role as Roles,
  });

  if (!result.status || !result.id) {
    return sendResponse(
      {
        statusCode: ResponseStatusCodes.INTERNAL_ERROR,
        errors: result.errors || ['Unable to create user'],
      },
      res
    );
  }

  const user = await userService.getOne({ _id: result.id });
  return sendResponse(
    {
      statusCode: ResponseStatusCodes.OK,
      data: { user },
      messages: ['User registered successfully'],
    },
    res
  );
};

const login = async (req: Request, res: Response) => {
  const allowedParameters = ['password', 'email'];
  const userData = filterParameters(req.body, allowedParameters);

  if (!requiredParametersProvided(userData, allowedParameters)) {
    return sendResponse(
      {
        statusCode: ResponseStatusCodes.BAD_REQUEST,
        errors: ['Please provide all required parameters.'],
      },
      res
    );
  }

  const userService = new UserService();
  const user = await userService.getOne({
    email: String(userData.email || '').toLowerCase(),
  });

  const passwordMatched = await bcrypt.compare(String(userData.password), user?.password ?? '');

  if (!user || !passwordMatched) {
    return sendResponse(
      {
        statusCode: ResponseStatusCodes.BAD_REQUEST,
        errors: ['Incorrect email or password'],
      },
      res
    );
  }

  return sendResponse(
    {
      statusCode: ResponseStatusCodes.OK,
      data: { user },
    },
    res
  );
};

export default {
  signup,
  login,
};
