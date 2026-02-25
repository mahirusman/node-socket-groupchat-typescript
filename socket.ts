import { Server } from 'socket.io';
import { isValidToken } from './utils/chat-helper';

const io = new Server();

const extractSocketToken = (socket: any) => {
  const token =
    socket.handshake?.auth?.token ||
    socket.handshake?.headers?.authorization ||
    socket.handshake?.query?.token;

  if (Array.isArray(token)) {
    return token[0];
  }

  return token;
};

io.use((socket, next) => {
  const token = extractSocketToken(socket);
  const payload = isValidToken(token);
  const userId = payload && typeof payload === 'object' ? payload.userId || payload.id : null;

  if (!userId) {
    return next(new Error('Unauthorized'));
  }

  (socket as any).user = {
    userId,
  };

  next();
});

export default {
  io,
};
