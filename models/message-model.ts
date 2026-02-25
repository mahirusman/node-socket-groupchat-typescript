import { model, Schema } from 'mongoose';
import { IMessage, MessageModelType } from './types/message-model';

const messageSchema = new Schema<IMessage, MessageModelType>(
  {
    chatHead: {
      type: Schema.Types.ObjectId,
      ref: 'ChatHead',
      required: true,
    },
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medias: [
      {
        name: { type: String },
        ext: { type: String },
        size: { type: Number },
        url: { type: String },
      },
    ],
    body: {
      type: String,
    },
    deletedByUsers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    seenBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  },
  {
    timestamps: true,
    collection: 'messages',
  }
);

const MessageModel = model<IMessage, MessageModelType>('Message', messageSchema);
export default MessageModel;
