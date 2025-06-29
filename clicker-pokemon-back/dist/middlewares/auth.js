"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'ultrasecret';
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log("authHeader", authHeader);
    console.log("!authHeader : ", !authHeader, "!authHeader.startsWith('Bearer ') : ", !authHeader?.startsWith('Bearer '));
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant' });
    }
    const token = authHeader.split(' ')[1];
    console.log("token : ", token);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.trainer = decoded;
        console.log("decoded : ", decoded);
        next();
    }
    catch (e) {
        console.log("e : ", e);
        return res.status(403).json({ message: 'Token invalide' });
    }
}
