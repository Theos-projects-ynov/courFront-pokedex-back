import express from 'express';
import cors from 'cors';
import trainerRouter from './router/trainer.router';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/trainer', trainerRouter);

export default app;
