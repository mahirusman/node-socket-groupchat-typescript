import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { sendApiResponse } from '../utils/chat-helper';
import ChatHeadModel from '../models/chat-head-model';
import MessageModel from '../models/message-model';
import { CHAT_HEADS_MESSAGES } from '../constants/chat-heads-messages';

const getUserIdFromRequest = (req: Request): string | null => {
  const payload = (req as Request & { payload?: any }).payload;

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  return payload.userId || payload.id || null;
};

const toObjectId = (id: string) => new Types.ObjectId(id);

class ChatHeadsController {
  async createChatHead(req: Request, res: Response) {
    try {
      const { propertyId, propertyOwnerId } = req.body;
      const userId = getUserIdFromRequest(req);

      if (!userId) {
        return sendApiResponse(res, {
          status: 401,
          success: false,
          message: 'Verification failed',
          data: {},
        });
      }

      let result = await ChatHeadModel.findOne({
        propertyId: toObjectId(propertyId),
        participant: { $all: [toObjectId(userId), toObjectId(propertyOwnerId)] },
      }).populate({
        path: 'participant',
        model: 'User',
        select: 'firstName lastName email avatar userId _id defaultProfileRole creProfileRole role',
      });

      if (!result) {
        await ChatHeadModel.create({
          propertyId: toObjectId(propertyId),
          participant: [toObjectId(userId), toObjectId(propertyOwnerId)],
        });

        result = await ChatHeadModel.findOne({
          propertyId: toObjectId(propertyId),
          participant: { $all: [toObjectId(userId), toObjectId(propertyOwnerId)] },
        }).populate({
          path: 'participant',
          model: 'User',
          select: 'firstName lastName email avatar userId _id defaultProfileRole creProfileRole role',
        });
      }

      return sendApiResponse(res, {
        status: 200,
        success: true,
        message: CHAT_HEADS_MESSAGES.SUCCESS,
        data: result,
      });
    } catch (error) {
      return sendApiResponse(res, {
        status: 500,
        success: false,
        message: CHAT_HEADS_MESSAGES.SERVER_ERROR,
        data: {},
      });
    }
  }

  async getChatHeads(req: Request, res: Response) {
    try {
      const userId = getUserIdFromRequest(req);
      const { chatId, search } = req.query;

      if (!userId) {
        return sendApiResponse(res, {
          status: 401,
          success: false,
          message: 'Verification failed',
          data: {},
        });
      }

      const userObjectId = toObjectId(userId);
      const chatObjectId =
        typeof chatId === 'string' && Types.ObjectId.isValid(chatId)
          ? toObjectId(chatId)
          : null;

      const pinnedMatchQuery: any[] = [
        { participant: { $in: [userObjectId] } },
        { deletedByUsers: { $nin: [userObjectId] } },
        { userPin: { $in: [userObjectId] } },
      ];

      const unpinnedMatchQuery: any[] = [
        { participant: { $in: [userObjectId] } },
        { deletedByUsers: { $nin: [userObjectId] } },
        { userPin: { $nin: [userObjectId] } },
      ];

      if (typeof search === 'string' && search.trim() !== '') {
        const userSearch = {
          $or: [
            {
              'participants.firstName': {
                $regex: search,
                $options: 'i',
              },
            },
            {
              'participants.lastName': {
                $regex: search,
                $options: 'i',
              },
            },
          ],
        };

        pinnedMatchQuery.push(userSearch);
        unpinnedMatchQuery.push(userSearch);
      }

      const buildPipeline = (matchQuery: any[]) => {
        const mustHaveMessageMatch = chatObjectId
          ? {
              $or: [
                { messages: { $exists: true, $ne: [] } },
                { _id: chatObjectId },
              ],
            }
          : {
              messages: { $exists: true, $ne: [] },
            };

        return [
          {
            $lookup: {
              from: 'users',
              localField: 'participant',
              foreignField: '_id',
              as: 'participants',
            },
          },
          {
            $lookup: {
              from: 'listings',
              localField: 'propertyId',
              foreignField: '_id',
              as: 'propertyId',
            },
          },
          {
            $match: {
              $and: matchQuery,
            },
          },
          {
            $lookup: {
              from: 'messages',
              let: { chatId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $and: [
                      {
                        $expr: {
                          $and: [
                            { $eq: ['$chatHead', '$$chatId'] },
                            { $eq: ['$receivedBy', userObjectId] },
                          ],
                        },
                      },
                      { deletedByUsers: { $nin: [userObjectId] } },
                      { seenBy: { $nin: [userObjectId] } },
                    ],
                  },
                },
              ],
              as: 'unreadMessageCount',
            },
          },
          {
            $lookup: {
              from: 'messages',
              let: { chatId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$chatHead', '$$chatId'] },
                  },
                },
                { $limit: 1 },
              ],
              as: 'messages',
            },
          },
          {
            $match: mustHaveMessageMatch,
          },
          {
            $addFields: {
              unreadMessageCount: { $size: '$unreadMessageCount' },
              messagesCount: { $size: '$messages' },
            },
          },
          {
            $sort: {
              _id: -1,
            },
          },
          {
            $project: {
              _id: 1,
              deletedByUsers: 1,
              lastMessage: 1,
              userPin: 1,
              createdAt: 1,
              updatedAt: 1,
              'participants._id': 1,
              'participants.firstName': 1,
              'participants.lastName': 1,
              'participants.email': 1,
              'participants.role': 1,
              'propertyId._id': 1,
              'propertyId.propertyType': 1,
              'propertyId.listingType': 1,
              'propertyId.propertySubCategory': 1,
              'propertyId.propertyName': 1,
              'propertyId.businessModel': 1,
              'propertyId.businessName': 1,
              unreadMessageCount: 1,
            },
          },
        ];
      };

      const [pinHeads, chatHeads] = await Promise.all([
        ChatHeadModel.aggregate(buildPipeline(pinnedMatchQuery) as any),
        ChatHeadModel.aggregate(buildPipeline(unpinnedMatchQuery) as any),
      ]);

      return sendApiResponse(res, {
        status: 200,
        success: true,
        message: CHAT_HEADS_MESSAGES.SUCCESS,
        data: {
          pinHeads,
          chatHeads,
        },
      });
    } catch (error) {
      return sendApiResponse(res, {
        status: 500,
        success: false,
        message: CHAT_HEADS_MESSAGES.SERVER_ERROR,
        data: {},
      });
    }
  }

  async deleteChatHead(req: Request, res: Response) {
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

      const [deleteHeads] = await Promise.allSettled([
        ChatHeadModel.findOneAndUpdate(
          { _id: req.params.chatHead, deletedByUsers: { $nin: [userId] } },
          { $push: { deletedByUsers: userId } },
          { new: true }
        ),
        MessageModel.updateMany(
          { chatHead: req.params.chatHead, deletedByUsers: { $nin: [userId] } },
          { $push: { deletedByUsers: userId } }
        ),
      ]);

      return sendApiResponse(res, {
        status: 200,
        success: true,
        message: CHAT_HEADS_MESSAGES.SUCCESS,
        data: { deleteHeads },
      });
    } catch (error) {
      return sendApiResponse(res, {
        status: 500,
        success: false,
        message: CHAT_HEADS_MESSAGES.TYPE_ERROR,
        data: {},
      });
    }
  }

  async togglePinChatHead(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const userId = getUserIdFromRequest(req);

      if (!userId) {
        return sendApiResponse(res, {
          status: 401,
          success: false,
          message: 'Verification failed',
          data: {},
        });
      }

      const response = status
        ? await ChatHeadModel.updateOne(
            { _id: req.params.chatHead },
            { $addToSet: { userPin: userId } }
          )
        : await ChatHeadModel.updateOne(
            { _id: req.params.chatHead },
            { $pull: { userPin: userId } }
          );

      return sendApiResponse(res, {
        status: 200,
        success: true,
        message: CHAT_HEADS_MESSAGES.SUCCESS,
        data: response,
      });
    } catch (error) {
      return sendApiResponse(res, {
        status: 500,
        success: false,
        message: CHAT_HEADS_MESSAGES.TYPE_ERROR,
        data: {},
      });
    }
  }
}

export default new ChatHeadsController();
