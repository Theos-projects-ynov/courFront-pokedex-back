import { Request, Response } from 'express';
import * as trainerService from '../services/trainer.service';

export async function register(req: Request, res: Response) {
  try {
    const data = await trainerService.registerTrainer(req.body);
    res.status(201).json(data);
  } catch (e: any) {
    res.status(e.status || 500).json({ message: e.message || 'Erreur serveur' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const data = await trainerService.loginTrainer(req.body);
    res.json(data);
  } catch (e: any) {
    res.status(e.status || 500).json({ message: e.message || 'Erreur serveur' });
  }
}
