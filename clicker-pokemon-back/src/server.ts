import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { setupWebSocketServer } from './config/ws';
import { dungeonService } from './services/dungeon.service';

const port = process.env.PORT || 3000;
const wsPort = process.env.WS_PORT || 3001;

// Fonction d'initialisation du serveur
async function initializeServer() {
  try {
    // Démarrer l'API REST
    app.listen(port, () => {
      console.log(`REST API running on http://localhost:${port}`);
    });

    // Démarrer les WebSockets
    setupWebSocketServer(wsPort);

    // Initialiser le donjon par défaut
    await dungeonService.initializeDefaultDungeon();

    console.log('🚀 Serveur initialisé avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation du serveur:', error);
    process.exit(1);
  }
}

// Démarrer le serveur
initializeServer();
