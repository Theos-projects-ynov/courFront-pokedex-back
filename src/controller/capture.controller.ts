import { Request, Response } from 'express';
import * as captureService from '../services/capture.service';

export async function getOrCreateCapture(req: Request, res: Response) {
  try {
    const trainerId = (req as any).trainer.id;
    const zone = Number(req.params.zoneId);
    if (isNaN(zone) || zone < 1 || zone > 9) {
      res.status(400).json({ message: "Zone inconnue" });
      return;
    }
    const wild = await captureService.getOrCreateWildPokemon(trainerId, zone);
    res.json(wild);
  } catch (e: any) {
    res.status(e.status || 500).json({ message: e.message || 'Erreur serveur' });
  }
}

export async function releaseCapture(req: Request, res: Response) {
  try {
    const trainerId = (req as any).trainer.id;
    const zone = Number(req.params.zoneId);
    if (isNaN(zone) || zone < 1 || zone > 9) {
      res.status(400).json({ message: "Zone inconnue" });
      return;
    }
    const wild = await captureService.releaseWildPokemon(trainerId, zone);
    res.json(wild);
  } catch (e: any) {
    res.status(e.status || 500).json({ message: e.message || 'Erreur serveur' });
  }
}

export async function attemptCapture(req: Request, res: Response) {
  try {
    const trainerId = (req as any).trainer.id;
    const zone = Number(req.params.zoneId);
    if (isNaN(zone) || zone < 1 || zone > 9) {
      res.status(400).json({ message: "Zone inconnue" });
      return;
    }
    const result = await captureService.attemptCapture(trainerId, zone);
    res.json(result);
  } catch (error: any) {
    console.log("[capture] - error : ", error);
    res.status(error.status || 500).json({ message: error.message || 'Erreur serveur' });
  }
}
