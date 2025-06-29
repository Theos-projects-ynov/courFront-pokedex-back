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
exports.getOrCreateCapture = getOrCreateCapture;
exports.releaseCapture = releaseCapture;
exports.attemptCapture = attemptCapture;
const captureService = __importStar(require("../services/capture.service"));
async function getOrCreateCapture(req, res) {
    try {
        const trainerId = req.trainer.id;
        const zone = Number(req.params.zoneId);
        if (isNaN(zone) || zone < 1 || zone > 9)
            return res.status(400).json({ message: "Zone inconnue" });
        const wild = await captureService.getOrCreateWildPokemon(trainerId, zone);
        return res.json(wild);
    }
    catch (e) {
        return res.status(e.status || 500).json({ message: e.message || 'Erreur serveur' });
    }
}
async function releaseCapture(req, res) {
    try {
        const trainerId = req.trainer.id;
        const zone = Number(req.params.zoneId);
        if (isNaN(zone) || zone < 1 || zone > 9)
            return res.status(400).json({ message: "Zone inconnue" });
        const wild = await captureService.releaseWildPokemon(trainerId, zone);
        return res.json(wild);
    }
    catch (e) {
        return res.status(e.status || 500).json({ message: e.message || 'Erreur serveur' });
    }
}
async function attemptCapture(req, res) {
    try {
        const trainerId = req.trainer.id;
        const zone = Number(req.params.zoneId);
        if (isNaN(zone) || zone < 1 || zone > 9)
            return res.status(400).json({ message: "Zone inconnue" });
        const result = await captureService.attemptCapture(trainerId, zone);
        return res.json(result);
    }
    catch (error) {
        console.log("[capture] - error : ", error);
        return res.status(error.status || 500).json({ message: error.message || 'Erreur serveur' });
    }
}
