import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth";
import { getOrCreateCapture, releaseCapture, attemptCapture } from "../controller/capture.controller";

const router = Router();

router.post('/zone/:zoneId', authenticateJWT, getOrCreateCapture);
router.post('/zone/:zoneId/release', authenticateJWT, releaseCapture);
router.post('/zone/:zoneId/attempt', authenticateJWT, attemptCapture);

export default router;
