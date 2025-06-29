import express from 'express';
import cors from 'cors';
import trainerRouter from './router/trainer.router';
import pokemonRouter from './router/pokemon.router';
import captureRouter from './router/capture.router';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/trainer', trainerRouter);
app.use('/api/pokemon', pokemonRouter);
app.use('/api/capture', captureRouter);

export default app;
