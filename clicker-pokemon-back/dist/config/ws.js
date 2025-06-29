"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocketServer = setupWebSocketServer;
const ws_1 = require("ws");
function setupWebSocketServer(port) {
    const wss = new ws_1.WebSocketServer({ port: Number(port) });
    wss.on('connection', (ws) => {
        console.log('New WebSocket connection');
        ws.send('Bienvenue sur le serveur WS Pokémon !');
    });
    console.log(`WebSocket Server running on ws://localhost:${port}`);
}
