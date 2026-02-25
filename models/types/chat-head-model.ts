import { HydratedDocument, Model, Types } from 'mongoose';

export interface IChatHead {
  propertyId: Types.ObjectId;
  participant: Types.ObjectId[];
  deletedByUsers: Types.ObjectId[];
  lastMessage?: string;
  userPin: Types.ObjectId[];
  userMute: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type ChatHeadDocument = HydratedDocument<IChatHead>;
export type ChatHeadModelType = Model<IChatHead>;

export interface CreateChatHeadInput {
  propertyId: Types.ObjectId | string;
  participant: Array<Types.ObjectId | string>;
}
