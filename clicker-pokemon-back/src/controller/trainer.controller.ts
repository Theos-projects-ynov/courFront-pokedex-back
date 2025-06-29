import { Request, Response } from 'express';
import * as trainerService from '../services/trainer.service';

export async function register(req: Request, res: Response) {
  try {
    const data = await trainerService.registerTrainer(req.body);
    return res.status(201).json(data);
  } catch (e: any) {
    return res.status(e.status || 500).json({ message: e.message || 'Erreur serveur' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const data = await trainerService.loginTrainer(req.body);
    return res.json(data);
  } catch (e: any) {
    return res.status(e.status || 500).json({ message: e.message || 'Erreur serveur' });
  }
}

// Pour obtenir le profil du trainer connecté (JWT)
export async function me(req: Request, res: Response) {
  try {
    const trainerId = (req as any).trainer.id; // récupéré via JWT, donc déjà un UUID
    const data = await trainerService.getTrainerProfile(trainerId);
    return res.json(data);
  } catch (e: any) {
    console.log("[me] - error : ", e);
    return res.status(e.status || 500).json({ message: e.message || 'Erreur serveur' });
  }
}

