import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ultrasecret';

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  console.log("authHeader", authHeader);

  console.log("!authHeader : ", !authHeader, "!authHeader.startsWith('Bearer ') : ",!authHeader?.startsWith('Bearer '));

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' });
  }
  const token = authHeader.split(' ')[1];
  console.log("token : ", token);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).trainer = decoded;
    console.log("decoded : ", decoded);
    next();
  } catch (e) {
    console.log("e : ", e);
    return res.status(403).json({ message: 'Token invalide' });
  }
}
