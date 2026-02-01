import dotenv from 'dotenv';
import mongoose, { ConnectOptions } from 'mongoose';
dotenv.config();
import app from './app';

import constants from './config/constants';

mongoose.connect(
  constants.mongourl,
  {
    useNewUrlParser: true,

    useUnifiedTopology: true,
  } as ConnectOptions,
  (error) => {
    if (error) {
      console.info('Error while connecting with database ', error);
    } else {
      console.info('DB connected successfulyy');
    }
  }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.info(`server is running on port ${PORT}`);
});
