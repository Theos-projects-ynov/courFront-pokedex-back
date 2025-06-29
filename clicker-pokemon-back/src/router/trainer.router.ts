import { Router } from 'express';
import { register, login, me } from '../controller/trainer.controller';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);

// Route pour obtenir le profil du trainer connecté (nécessite JWT)
router.get('/me', authenticateJWT, me);

export default router;
