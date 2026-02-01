import { IUserDocument, Roles } from './types/user.model';
import { Model, Schema, model } from 'mongoose';
import validator from 'validator';
import { enumToArray } from '../utils';
import { EnumTypes } from '../utils/types';
import { Props } from './types/model';
import { encrypt } from '../utils/general_functions';

const allowedRoles = enumToArray(Roles, EnumTypes.String);

const schema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      unique: true,
      validate: {
        validator: (email: string) => {
          return validator.isEmail(email);
        },
        message: (props: Props) => `${props.value} is not a valid email!`,
      },
      required: true,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: (phone: string) => {
          return validator.isMobilePhone(phone);
        },
        message: (props: Props) =>
          `${props.value} is not a valid phone number!`,
      },
    },
    phone_verified: {
      type: Boolean,
      default: false,
    },

    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: allowedRoles,
      default: allowedRoles[0],
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
class UserClass extends Model {
  //* virtual function: e.g. John D. */
  get nickName() {
    if (this.full_name) {
      const splittedNames = this.full_name.split(' ');
      return `${splittedNames[0]} ${
        splittedNames.length > 1 ? splittedNames[1][0] : ''
      }`;
    }
    return null;
  }
}

schema.loadClass(UserClass);

schema.pre('save', async function (this: IUserDocument, next) {
  //  ignore for update
  if (!this.isModified('password')) return next();
  this.password = await encrypt(this.password);

  next();
});
export default model<IUserDocument>('User', schema);
