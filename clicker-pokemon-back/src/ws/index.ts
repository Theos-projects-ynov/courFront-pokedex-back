import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { setupBattleWebSocket } from './battle/battle.ws';
import { setupDungeonWebSocket } from './dungeon/dungeon.ws';

export function setupWebSocket(server: any) {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws'
  });

  wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
    console.log('New WebSocket connection');
    
    // Déterminer le type de connexion basé sur l'URL ou les paramètres
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const mode = url.searchParams.get('mode');

    switch (mode) {
      case 'battle':
        console.log('Setting up battle WebSocket');
        setupBattleWebSocket(ws as any, request);
        break;
        
      case 'dungeon':
        console.log('Setting up dungeon WebSocket');
        setupDungeonWebSocket(ws as any, request);
        break;
        
      default:
        console.log('No mode specified, closing connection');
        ws.send(JSON.stringify({
          type: 'ERROR',
          message: 'Mode requis : ?mode=battle ou ?mode=dungeon'
        }));
        ws.close();
    }
  });

  console.log('WebSocket server setup complete');
  return wss;
}
