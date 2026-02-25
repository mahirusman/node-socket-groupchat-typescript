import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { sendApiResponse } from '../utils/chat-helper';
import MessageModel from '../models/message-model';
import ChatHeadModel from '../models/chat-head-model';
import socketApi from '../socket';
import { MESSAGE_MESSAGES } from '../constants/message-messages';

const getUserIdFromRequest = (req: Request): string | null => {
  const payload = (req as Request & { payload?: any }).payload;

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  return payload.userId || payload.id || null;
};

class MessageController {
  async createMessage(req: Request, res: Response) {
    try {
      const { chatHead, medias, body } = req.body;
      const userId = getUserIdFromRequest(req);

      if (!userId) {
        return sendApiResponse(res, {
          status: 401,
          success: false,
          message: 'Verification failed',
          data: {},
        });
      }

      const records = await ChatHeadModel.findById(chatHead).populate({
        path: 'participant',
        model: 'User',
      });

      if (!records) {
        return sendApiResponse(res, {
          status: 404,
          success: false,
          message: 'Chat head not found',
          data: {},
        });
      }

      const receiverDoc = records.participant.find(
        (participant: any) => String(participant._id) !== String(userId)
      ) as any;

      if (!receiverDoc?._id) {
        return sendApiResponse(res, {
          status: 400,
          success: false,
          message: 'Unable to resolve receiver',
          data: {},
        });
      }

      const receiver = receiverDoc._id;
      const createdResult = (
        await MessageModel.create({
          chatHead,
          sentBy: userId,
          receivedBy: receiver,
          medias,
          seenBy: [userId],
          body,
        })
      ).toObject();

      socketApi.io.emit(`${receiver}-message`, {
        ...createdResult,
        userData: records,
      });

      return sendApiResponse(res, {
        status: 200,
        success: true,
        message: MESSAGE_MESSAGES.SUCCESS,
        data: { ...createdResult, userData: records },
      });
    } catch (error) {
      return sendApiResponse(res, {
        status: 500,
        success: false,
        message: MESSAGE_MESSAGES.SERVER_ERROR,
        data: {},
      });
    }
  }

  async getMessages(req: Request, res: Response) {
    try {
      const { chatHead } = req.params;
      const userId = getUserIdFromRequest(req);

      if (!userId) {
        return sendApiResponse(res, {
          status: 401,
          success: false,
          message: 'Verification failed',
          data: {},
        });
      }

      const records = await MessageModel.aggregate([
        {
          $match: {
            chatHead: new Types.ObjectId(chatHead),
            deletedByUsers: { $nin: [new Types.ObjectId(userId)] },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
        {
          $lookup: {
            from: 'users',
            let: {
              sentBy: '$sentBy',
              receivedBy: '$receivedBy',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ['$_id', '$$sentBy'] },
                      { $eq: ['$_id', '$$receivedBy'] },
                    ],
                  },
                },
              },
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  email: 1,
                  avatar: 1,
                  _id: 1,
                  role: 1,
                },
              },
            ],
            as: 'userData',
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
              },
            },
            chat: {
              $push: '$$ROOT',
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]);

      await MessageModel.updateMany(
        {
          chatHead,
        },
        {
          $addToSet: {
            seenBy: userId,
          },
        }
      );

      return sendApiResponse(res, {
        status: 200,
        success: true,
        message: MESSAGE_MESSAGES.SUCCESS,
        data: records,
      });
    } catch (error) {
      return sendApiResponse(res, {
        status: 500,
        success: false,
        message: MESSAGE_MESSAGES.SERVER_ERROR,
        data: {},
      });
    }
  }

  async deleteMessage(req: Request, res: Response) {
    try {
      const userId = getUserIdFromRequest(req);

      if (!userId) {
        return sendApiResponse(res, {
          status: 401,
          success: false,
          message: 'Verification failed',
          data: {},
        });
      }

      const result = await MessageModel.findOneAndUpdate(
        {
          _id: req.params.chatId,
          deletedByUsers: { $nin: [userId] },
          sentBy: userId,
        },
        { $push: { deletedByUsers: userId } },
        { new: true }
      );

      return sendApiResponse(res, {
        status: 200,
        success: true,
        message: MESSAGE_MESSAGES.SUCCESS,
        data: result,
      });
    } catch (error) {
      return sendApiResponse(res, {
        status: 500,
        success: false,
        message: MESSAGE_MESSAGES.TYPE_ERROR,
        data: {},
      });
    }
  }

  async markMessageSeen(req: Request, res: Response) {
    try {
      const userId = getUserIdFromRequest(req);

      if (!userId) {
        return sendApiResponse(res, {
          status: 401,
          success: false,
          message: 'Verification failed',
          data: {},
        });
      }

      await MessageModel.updateMany(
        { _id: req.params.message },
        { $addToSet: { seenBy: userId } }
      );

      return sendApiResponse(res, {
        status: 200,
        success: true,
        message: MESSAGE_MESSAGES.SUCCESS,
        data: {},
      });
    } catch (error) {
      return sendApiResponse(res, {
        status: 500,
        success: false,
        message: MESSAGE_MESSAGES.TYPE_ERROR,
        data: {},
      });
    }
  }

  async getUnreadMessageCount(req: Request, res: Response) {
    try {
      const userId = getUserIdFromRequest(req);

      if (!userId) {
        return sendApiResponse(res, {
          status: 401,
          success: false,
          message: 'Verification failed',
          data: {},
        });
      }

      const unreadMessagesCount = await MessageModel.find({
        receivedBy: userId,
        sentBy: { $ne: userId },
        deletedByUsers: { $nin: [userId] },
        seenBy: { $nin: [userId] },
      }).countDocuments();

      return sendApiResponse(res, {
        status: 200,
        success: true,
        message: MESSAGE_MESSAGES.SUCCESS,
        data: unreadMessagesCount,
      });
    } catch (error) {
      return sendApiResponse(res, {
        status: 500,
        success: false,
        message: MESSAGE_MESSAGES.TYPE_ERROR,
        data: {},
      });
    }
  }
}

export default new MessageController();
