import express, { Request, Response } from 'express';
var cors = require('cors');
import morgan from 'morgan';

import customerRouter from './routes/userRoutes';

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

app.use('/api/v1/auth', customerRouter);

app.all('*', (req: Request, res: Response) => {
  return res
    .status(404)
    .json({ msg: `can not find ${req.originalUrl} on this server!` });
});

export default app;
