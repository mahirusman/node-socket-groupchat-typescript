import { HydratedDocument, Model, Types } from 'mongoose';

export interface IMedia {
  name?: string;
  ext?: string;
  size?: number;
  url?: string;
}

export interface IMessage {
  chatHead: Types.ObjectId;
  sentBy: Types.ObjectId;
  receivedBy: Types.ObjectId;
  medias: IMedia[];
  body?: string;
  deletedByUsers: Types.ObjectId[];
  seenBy: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type MessageDocument = HydratedDocument<IMessage>;
export type MessageModelType = Model<IMessage>;

export interface CreateMessageInput {
  chatHead: Types.ObjectId | string;
  sentBy: Types.ObjectId | string;
  receivedBy: Types.ObjectId | string;
  medias?: IMedia[];
  body?: string;
}
