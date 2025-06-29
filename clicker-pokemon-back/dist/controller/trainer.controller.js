"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.me = me;
const trainerService = __importStar(require("../services/trainer.service"));
async function register(req, res) {
    try {
        const data = await trainerService.registerTrainer(req.body);
        return res.status(201).json(data);
    }
    catch (e) {
        return res.status(e.status || 500).json({ message: e.message || 'Erreur serveur' });
    }
}
async function login(req, res) {
    try {
        const data = await trainerService.loginTrainer(req.body);
        return res.json(data);
    }
    catch (e) {
        return res.status(e.status || 500).json({ message: e.message || 'Erreur serveur' });
    }
}
// Pour obtenir le profil du trainer connecté (JWT)
async function me(req, res) {
    try {
        const trainerId = req.trainer.id; // récupéré via JWT, donc déjà un UUID
        const data = await trainerService.getTrainerProfile(trainerId);
        return res.json(data);
    }
    catch (e) {
        console.log("[me] - error : ", e);
        return res.status(e.status || 500).json({ message: e.message || 'Erreur serveur' });
    }
}
