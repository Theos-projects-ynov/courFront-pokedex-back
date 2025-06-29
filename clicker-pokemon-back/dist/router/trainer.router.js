"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trainer_controller_1 = require("../controller/trainer.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/register', trainer_controller_1.register);
router.post('/login', trainer_controller_1.login);
// Route pour obtenir le profil du trainer connecté (nécessite JWT)
router.get('/me', auth_1.authenticateJWT, trainer_controller_1.me);
exports.default = router;
