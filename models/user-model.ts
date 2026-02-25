import { Schema, model } from 'mongoose';
import validator from 'validator';
import { enumToArray } from '../utils';
import { EnumTypes } from '../utils/types';
import { Props } from './types/model';
import { encrypt } from '../utils/general-functions';
import {
  IUser,
  IUserDocument,
  IUserMethods,
  Roles,
  UserModelType,
} from './types/user-model';

const ALLOWED_ROLES = enumToArray(Roles, EnumTypes.String);

const userSchema = new Schema<IUser, UserModelType, IUserMethods>(
  {
    email: {
      type: String,
      unique: true,
      validate: {
        validator: (email: string) => validator.isEmail(email),
        message: (props: Props) => `${props.value} is not a valid email!`,
      },
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: (phone: string) => validator.isMobilePhone(phone),
        message: (props: Props) => `${props.value} is not a valid phone number!`,
      },
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ALLOWED_ROLES,
      default: ALLOWED_ROLES[0],
    },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

userSchema.virtual('nickName').get(function (this: IUserDocument) {
  const fullName = `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
  if (!fullName) {
    return null;
  }

  const splitNames = fullName.split(' ');
  return `${splitNames[0]} ${splitNames.length > 1 ? splitNames[1][0] : ''}`.trim();
});

userSchema.pre('save', async function (this: IUserDocument, next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await encrypt(this.password);
  next();
});

const UserModel = model<IUser, UserModelType>('User', userSchema);
export default UserModel;
