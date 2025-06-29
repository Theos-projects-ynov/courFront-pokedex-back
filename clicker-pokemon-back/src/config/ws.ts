import { WebSocketServer } from 'ws';
import { setupBattleWebSocket } from '../ws/battle/battle.ws';
import { setupDungeonWebSocket } from '../ws/dungeon/dungeon.ws';
import { URL } from 'url';

export function setupWebSocketServer(port: number | string) {
  const wss = new WebSocketServer({ port: Number(port) });

  wss.on('connection', (ws, request) => {
    console.log('New WebSocket connection');
    
    // Analyser l'URL pour déterminer le type de connexion
    const url = new URL(request.url || '', `http://localhost:${port}`);
    const path = url.pathname;

    if (path === '/battle') {
      // Connexion pour les combats
      console.log('Setting up battle WebSocket');
      setupBattleWebSocket(ws as any, request);
    } else if (path === '/dungeon') {
      // Connexion pour les donjons
      console.log('Setting up dungeon WebSocket');
      setupDungeonWebSocket(ws as any, request);
    } else {
      // Connexion générale - afficher les routes disponibles
      console.log('General WebSocket connection - showing available routes');
      ws.send(JSON.stringify({
        type: 'WELCOME',
        message: 'Bienvenue sur le serveur WS Pokémon !',
        availableRoutes: [
          'ws://localhost:' + port + '/battle - Pour les combats',
          'ws://localhost:' + port + '/dungeon - Pour les donjons'
        ]
      }));
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('General WS message:', message);
          
          ws.send(JSON.stringify({
            type: 'INFO',
            message: 'Utilisez /battle ou /dungeon pour accéder aux fonctionnalités spécifiques',
            availableRoutes: [
              'ws://localhost:' + port + '/battle',
              'ws://localhost:' + port + '/dungeon'
            ]
          }));
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'ERROR',
            message: 'Format de message invalide'
          }));
        }
      });
    }

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  console.log(`WebSocket Server running on ws://localhost:${port}`);
  console.log(`Battle WebSocket available at ws://localhost:${port}/battle`);
  console.log(`Dungeon WebSocket available at ws://localhost:${port}/dungeon`);
}
