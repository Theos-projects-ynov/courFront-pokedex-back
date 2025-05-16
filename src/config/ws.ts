import { WebSocketServer } from 'ws';

export function setupWebSocketServer(port: number | string) {
  const wss = new WebSocketServer({ port: Number(port) });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    ws.send('Bienvenue sur le serveur WS Pokémon !');
  });

  console.log(`WebSocket Server running on ws://localhost:${port}`);
}
