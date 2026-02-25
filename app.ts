import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';

import authRoutes from './routes/user-routes';
import chatHeadsRoutes from './routes/chat-heads-routes';
import messageRoutes from './routes/message-routes';
import { AppError } from './utils/app-error';
import { corsOriginValidator } from './utils/cors';
import { globalErrorHandler } from './utils/error-controller';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(
  cors({
    origin: corsOriginValidator,
    credentials: true,
  })
);

app.use('/api/v1/auth', authRoutes);
app.use('/chat-heads', chatHeadsRoutes);
app.use('/messages', messageRoutes);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
