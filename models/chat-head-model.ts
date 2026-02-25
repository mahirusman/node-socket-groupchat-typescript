import { model, Schema } from 'mongoose';
import { ChatHeadModelType, IChatHead } from './types/chat-head-model';

const chatHeadSchema = new Schema<IChatHead, ChatHeadModelType>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'listings',
      required: true,
    },
    participant: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    deletedByUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: String },
    userPin: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    userMute: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
    collection: 'chat_heads',
  }
);

const ChatHeadModel = model<IChatHead, ChatHeadModelType>('ChatHead', chatHeadSchema);
export default ChatHeadModel;
