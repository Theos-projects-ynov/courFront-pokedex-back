import { WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import * as battleService from '../../services/battle.service';
import { IBattleState, ITeamSelection } from '../../models/IBattle';

const JWT_SECRET = process.env.JWT_SECRET || 'ultrasecret';

interface AuthenticatedWebSocket extends WebSocket {
  trainerId?: string;
  battleId?: string;
}

const connectedClients = new Map<string, AuthenticatedWebSocket>();

export function setupBattleWebSocket(ws: AuthenticatedWebSocket, request: any) {
  console.log('New battle WebSocket connection');

  ws.on('message', async (data: string) => {
    try {
      const message = JSON.parse(data);
      console.log('[WS] Received:', message);

      switch (message.type) {
        case 'AUTHENTICATE':
          await handleAuthentication(ws, message.token);
          break;

        case 'SELECT_TEAM':
          await handleTeamSelection(ws, message.data);
          break;

        case 'START_BATTLE':
          await handleStartBattle(ws, message.data);
          break;

        case 'ATTACK':
          await handleAttack(ws, message.data);
          break;

        case 'SWITCH_POKEMON':
          await handleSwitchPokemon(ws, message.data);
          break;

        default:
          ws.send(JSON.stringify({
            type: 'ERROR',
            message: 'Action non reconnue'
          }));
      }
    } catch (error) {
      console.error('[WS] Error:', error);
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Erreur lors du traitement du message'
      }));
    }
  });

  ws.on('close', () => {
    if (ws.trainerId) {
      connectedClients.delete(ws.trainerId);
      
      // Nettoyer la bataille si le joueur se déconnecte
      if (ws.battleId) {
        battleService.deleteBattle(ws.battleId);
      }
    }
    console.log('Battle WebSocket connection closed');
  });
}

async function handleAuthentication(ws: AuthenticatedWebSocket, token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    ws.trainerId = decoded.id;
    
    connectedClients.set(decoded.id, ws);
    
    ws.send(JSON.stringify({
      type: 'AUTHENTICATED',
      trainerId: decoded.id,
      message: 'Connexion établie avec succès'
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Token invalide'
    }));
    ws.close();
  }
}

async function handleTeamSelection(ws: AuthenticatedWebSocket, teamData: ITeamSelection) {
  if (!ws.trainerId) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Non authentifié'
    }));
    return;
  }

  try {
    teamData.trainerId = ws.trainerId;
    
    // Créer la bataille avec l'équipe sélectionnée
    const battleState = await battleService.createBattle(teamData);
    ws.battleId = battleState.battleId;
    
    ws.send(JSON.stringify({
      type: 'BATTLE_CREATED',
      data: {
        battleId: battleState.battleId,
        playerTeam: battleState.playerTeam,
        aiTeam: battleState.aiTeam.map(p => ({
          ...p,
          moves: [] // Ne pas révéler les moves de l'IA
        })),
        message: 'Bataille créée ! Sélectionnez votre premier Pokémon.'
      }
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: `Erreur lors de la création de la bataille: ${(error as Error).message}`
    }));
  }
}

async function handleStartBattle(ws: AuthenticatedWebSocket, data: { pokemonId: string }) {
  if (!ws.battleId) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Aucune bataille en cours'
    }));
    return;
  }

  const battleState = battleService.getBattle(ws.battleId);
  if (!battleState) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Bataille introuvable'
    }));
    return;
  }

  // Sélectionner le Pokémon du joueur
  const selectedPokemon = battleState.playerTeam.find(p => p.id === data.pokemonId);
  if (!selectedPokemon) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Pokémon invalide'
    }));
    return;
  }

  battleState.currentPlayerPokemon = selectedPokemon;
  battleState.phase = 'ATTACK';
  battleService.updateBattle(battleState);

  ws.send(JSON.stringify({
    type: 'BATTLE_STARTED',
    data: {
      playerPokemon: battleState.currentPlayerPokemon,
      aiPokemon: battleState.currentAiPokemon,
      phase: battleState.phase,
      message: `${selectedPokemon.name} entre en combat contre ${battleState.currentAiPokemon.name} !`
    }
  }));
}

async function handleAttack(ws: AuthenticatedWebSocket, data: { moveId: number }) {
  if (!ws.battleId) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Aucune bataille en cours'
    }));
    return;
  }

  const battleState = battleService.getBattle(ws.battleId);
  if (!battleState || battleState.phase !== 'ATTACK') {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Impossible d\'attaquer maintenant'
    }));
    return;
  }

  // Récupérer l'attaque du joueur
  const playerMove = battleState.currentPlayerPokemon.moves.find(m => m.id === data.moveId);
  if (!playerMove || playerMove.pp <= 0) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Attaque invalide ou PP épuisés'
    }));
    return;
  }

  // Sélectionner l'attaque de l'IA
  const aiMove = battleService.selectAiMove(battleState.currentAiPokemon);

  // Déterminer l'ordre d'attaque (priorité puis vitesse)
  const playerFirst = 
    playerMove.priority > aiMove.priority ||
    (playerMove.priority === aiMove.priority && 
     battleState.currentPlayerPokemon.speed >= battleState.currentAiPokemon.speed);

  const results = [];
  
  if (playerFirst) {
    // Joueur attaque en premier
    const playerResult = battleService.executeAttack(
      battleState.currentPlayerPokemon,
      battleState.currentAiPokemon,
      playerMove
    );
    results.push(playerResult);

    // IA attaque si elle n'est pas KO
    if (!playerResult.isKO) {
      const aiResult = battleService.executeAttack(
        battleState.currentAiPokemon,
        battleState.currentPlayerPokemon,
        aiMove
      );
      results.push(aiResult);
    }
  } else {
    // IA attaque en premier
    const aiResult = battleService.executeAttack(
      battleState.currentAiPokemon,
      battleState.currentPlayerPokemon,
      aiMove
    );
    results.push(aiResult);

    // Joueur attaque si il n'est pas KO
    if (!aiResult.isKO) {
      const playerResult = battleService.executeAttack(
        battleState.currentPlayerPokemon,
        battleState.currentAiPokemon,
        playerMove
      );
      results.push(playerResult);
    }
  }

  battleState.turn++;
  battleService.updateBattle(battleState);

  // Envoyer les résultats
  ws.send(JSON.stringify({
    type: 'TURN_RESULT',
    data: {
      results,
      playerPokemon: battleState.currentPlayerPokemon,
      aiPokemon: battleState.currentAiPokemon,
      turn: battleState.turn
    }
  }));

  // Vérifier les KO et gérer la suite
  await handlePostTurnActions(ws, battleState);
}

async function handleSwitchPokemon(ws: AuthenticatedWebSocket, data: { pokemonId: string }) {
  if (!ws.battleId) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Aucune bataille en cours'
    }));
    return;
  }

  const battleState = battleService.getBattle(ws.battleId);
  if (!battleState) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Bataille introuvable'
    }));
    return;
  }

  const newPokemon = battleState.playerTeam.find(p => p.id === data.pokemonId && p.hp > 0);
  if (!newPokemon) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Pokémon invalide ou KO'
    }));
    return;
  }

  battleState.currentPlayerPokemon = newPokemon;
  battleState.phase = 'ATTACK';
  battleService.updateBattle(battleState);

  ws.send(JSON.stringify({
    type: 'POKEMON_SWITCHED',
    data: {
      newPokemon: battleState.currentPlayerPokemon,
      message: `${newPokemon.name} entre en combat !`
    }
  }));
}

async function handlePostTurnActions(ws: AuthenticatedWebSocket, battleState: IBattleState) {
  // Vérifier si le Pokémon joueur est KO
  if (battleState.currentPlayerPokemon.hp === 0) {
    const alivePokemon = battleState.playerTeam.filter(p => p.hp > 0);
    
    if (alivePokemon.length === 0) {
      // Défaite
      battleState.phase = 'DEFEAT';
      battleService.updateBattle(battleState);
      
      ws.send(JSON.stringify({
        type: 'BATTLE_END',
        data: {
          result: 'DEFEAT',
          message: 'Tous vos Pokémon sont KO ! Vous avez perdu.'
        }
      }));
      
      battleService.deleteBattle(battleState.battleId);
      return;
    }

    // Demander au joueur de choisir un nouveau Pokémon
    battleState.phase = 'SWITCH';
    battleService.updateBattle(battleState);
    
    ws.send(JSON.stringify({
      type: 'FORCE_SWITCH',
      data: {
        availablePokemon: alivePokemon,
        message: `${battleState.currentPlayerPokemon.name} est KO ! Choisissez un nouveau Pokémon.`
      }
    }));
    return;
  }

  // Vérifier si le Pokémon IA est KO
  if (battleState.currentAiPokemon.hp === 0) {
    battleState.aiDefeatedCount++;
    
    // Vérifier s'il reste des Pokémon IA
    const nextAiPokemon = battleState.aiTeam.find(p => p.hp > 0);
    
    if (!nextAiPokemon) {
      // Victoire
      battleState.phase = 'VICTORY';
      battleService.updateBattle(battleState);
      
      ws.send(JSON.stringify({
        type: 'BATTLE_END',
        data: {
          result: 'VICTORY',
          message: 'Félicitations ! Vous avez gagné le combat !'
        }
      }));
      
      battleService.deleteBattle(battleState.battleId);
      return;
    }

    // L'IA envoie le prochain Pokémon
    battleState.currentAiPokemon = nextAiPokemon;
    battleService.updateBattle(battleState);
    
    ws.send(JSON.stringify({
      type: 'AI_SWITCH',
      data: {
        newAiPokemon: battleState.currentAiPokemon,
        message: `L'adversaire envoie ${nextAiPokemon.name} !`
      }
    }));
  }
} 