import http from 'http';
import mongoose, { ConnectOptions } from 'mongoose';
import app from './app';
import { ENV_CONFIG } from './config/env-config';
import socketApi from './socket';
import { corsOriginValidator } from './utils/cors';

mongoose.connect(
  ENV_CONFIG.mongoUrl,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions,
  (error) => {
    if (error) {
      console.info('Error while connecting with database', error);
    } else {
      console.info('Database connected successfully');
    }
  }
);

const port = ENV_CONFIG.port;
const server = http.createServer(app);

socketApi.io.attach(server, {
  cors: {
    origin: corsOriginValidator,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

socketApi.io.on('connection', () => {
  console.info('Client socket connected');
});

server.listen(port, () => {
  console.info(`Server is running on port ${port}`);
});
