import { WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import * as pokemonService from '../../services/pokemon.service';
import * as battleService from '../../services/battle.service';
import { IBattleState, IBattlePokemon } from '../../models/IBattle';

const JWT_SECRET = process.env.JWT_SECRET || 'ultrasecret';

interface AuthenticatedWebSocket extends WebSocket {
  trainerId?: string;
  dungeonId?: number;
  battleId?: string;
}

interface IDungeonTeamSelection {
  trainerId: string;
  selectedPokemonIds: string[]; // Exactement 4 Pokémon
  dungeonId: number;
}

interface IDungeonSession {
  sessionId: string;
  trainerId: string;
  dungeonId: number;
  selectedPokemon: string[]; // 4 Pokémon validés
  status: 'TEAM_SELECTION' | 'READY' | 'IN_PROGRESS' | 'BATTLE' | 'COMPLETED';
  currentBattleId?: string;
  enemyPokemons?: IBattlePokemon[]; // Les 3 Pokémon générés pour le donjon
  defeatedEnemies?: number; // Nombre d'ennemis battus
}

interface IDungeonData {
  id: number;
  name: string;
  rewards: string;
  bossPokemonId: number;
  bossLevel: number;
  spawnLevels: [number, number, number]; // 3 niveaux pour les 3 Pokémon qui spawneront
}

const connectedClients = new Map<string, AuthenticatedWebSocket>();
const dungeonSessions = new Map<string, IDungeonSession>();

// Liste des Pokémon disponibles pour les donjons (roster)
const POKEMON_ROSTER = [
  1, 4, 7, 25, 39, 52, 54, 58, 60, 63, 66, 69, 72, 74, 81, 84, 86, 90, 92, 95, 
  100, 102, 104, 109, 111, 116, 118, 120, 129, 133, 138, 140, 147, 152, 155, 158
]; // Pokémon de base pour les donjons

// Liste des donjons disponibles (en dur pour le moment)
const AVAILABLE_DUNGEONS: IDungeonData[] = [
  {
    id: 1,
    name: "Donjon de mew",
    rewards: "Potion x3, Super Ball x2, 500 Gold",
    bossPokemonId: 151,
    bossLevel: 25,
    spawnLevels: [15, 17, 20]
  },
  {
    id: 2,
    name: "Caverne de Glace",
    rewards: "Hyper Potion x2, Ultra Ball x1, Pierre Glace, 750 Gold",
    bossPokemonId: 144, 
    bossLevel: 35,
    spawnLevels: [20, 25, 30]
  },
  {
    id: 3,
    name: "Volcan Ardent",
    rewards: "Max Potion x1, Master Ball x1, Pierre Feu, 1000 Gold",
    bossPokemonId: 146,
    bossLevel: 45,
    spawnLevels: [25, 30, 35]
  }
];

export function setupDungeonWebSocket(ws: AuthenticatedWebSocket, request: any) {
  console.log('New dungeon WebSocket connection');

  ws.on('message', async (data: string) => {
    try {
      const message = JSON.parse(data);
      console.log('[DUNGEON WS] Received:', message);

      switch (message.type) {
        case 'AUTHENTICATE':
          await handleAuthentication(ws, message.token);
          break;

        case 'SELECT_DUNGEON_TEAM':
          await handleDungeonTeamSelection(ws, message.data);
          break;

        case 'START_DUNGEON':
          await handleStartDungeon(ws, message.data);
          break;

        case 'GET_DUNGEON_INFO':
          await handleGetDungeonInfo(ws, message.data);
          break;

        // Actions de combat dans le donjon
        case 'DUNGEON_ATTACK':
          await handleDungeonAttack(ws, message.data);
          break;

        case 'DUNGEON_SWITCH':
          await handleDungeonSwitch(ws, message.data);
          break;

        default:
          ws.send(JSON.stringify({
            type: 'ERROR',
            message: 'Action non reconnue pour le mode donjon'
          }));
      }
    } catch (error) {
      console.error('[DUNGEON WS] Error:', error);
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Erreur lors du traitement du message'
      }));
    }
  });

  ws.on('close', () => {
    if (ws.trainerId) {
      connectedClients.delete(ws.trainerId);
      
      // Nettoyer la session dungeon si le joueur se déconnecte
      const sessionId = `${ws.trainerId}_${ws.dungeonId}`;
      const session = dungeonSessions.get(sessionId);
      if (session && session.currentBattleId) {
        battleService.deleteBattle(session.currentBattleId);
      }
      dungeonSessions.delete(sessionId);
    }
    console.log('Dungeon WebSocket connection closed');
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
      message: 'Connexion au mode donjon établie avec succès'
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Token invalide'
    }));
    ws.close();
  }
}

async function handleDungeonTeamSelection(ws: AuthenticatedWebSocket, teamData: IDungeonTeamSelection) {
  if (!ws.trainerId) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Non authentifié'
    }));
    return;
  }

  try {
    // Validation des données de base
    if (!teamData.dungeonId || !teamData.selectedPokemonIds || teamData.selectedPokemonIds.length === 0) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Données invalides : donjon ou équipe manquante'
      }));
      return;
    }

    // Vérifier qu'il y a exactement 4 Pokémon
    if (teamData.selectedPokemonIds.length !== 4) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Exactement 4 Pokémon requis pour un donjon'
      }));
      return;
    }

    // Vérifier que le donjon existe
    const dungeonData = AVAILABLE_DUNGEONS.find(d => d.id === teamData.dungeonId);
    if (!dungeonData) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Donjon introuvable'
      }));
      return;
    }

    // Récupérer tous les Pokémon du joueur
    const trainerPokemons = await pokemonService.listOwnedPokemonsByTrainer(ws.trainerId);
    const trainerPokemonIds = trainerPokemons.map(p => p.id);

    // Vérifier que tous les Pokémon sélectionnés appartiennent au joueur
    const invalidPokemonIds = teamData.selectedPokemonIds.filter(id => !trainerPokemonIds.includes(id));
    if (invalidPokemonIds.length > 0) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: `Pokémon invalides ou non possédés : ${invalidPokemonIds.join(', ')}`
      }));
      return;
    }

    // Récupérer les détails des Pokémon sélectionnés
    const selectedPokemons = trainerPokemons.filter(p => teamData.selectedPokemonIds.includes(p.id));

    teamData.trainerId = ws.trainerId;
    ws.dungeonId = teamData.dungeonId;

    // Créer une session de donjon avec toutes les informations
    const sessionId = `${ws.trainerId}_${teamData.dungeonId}`;
    const dungeonSession: IDungeonSession = {
      sessionId,
      trainerId: ws.trainerId,
      dungeonId: teamData.dungeonId,
      selectedPokemon: teamData.selectedPokemonIds,
      status: 'READY',
      defeatedEnemies: 0
    };

    dungeonSessions.set(sessionId, dungeonSession);

    // Collecter toutes les informations demandées
    const collectedInfo = {
      // Informations du joueur
      trainerId: ws.trainerId,
      
      // Informations des Pokémon (4 Pokémon avec leurs détails)
      selectedPokemons: selectedPokemons.map(p => ({
        id: p.id,
        pokedexId: p.pokedexId,
        name: p.name?.fr || 'Inconnu',
        level: p.level,
        genre: p.genre,
        boosts: {
          atk: p.boostAtk,
          def: p.boostDef,
          res: p.boostRes,
          pv: p.boostPv
        }
      })),
      
      // Informations du donjon
      dungeonInfo: {
        id: dungeonData.id,
        name: dungeonData.name,
        rewards: dungeonData.rewards,
        boss: {
          pokemonId: dungeonData.bossPokemonId,
          level: dungeonData.bossLevel
        },
        spawnLevels: dungeonData.spawnLevels // [15, 17, 20] - 3 niveaux pour les 3 Pokémon qui spawneront
      }
    };

    ws.send(JSON.stringify({
      type: 'DUNGEON_TEAM_SELECTED',
      data: {
        sessionId,
        ...collectedInfo,
        status: 'READY',
        message: `Équipe validée pour ${dungeonData.name}. Prêt à commencer l'exploration !`
      }
    }));

    // Log des informations collectées (pour debug)
    console.log('[DUNGEON] Informations collectées :', {
      trainerId: ws.trainerId,
      dungeonId: teamData.dungeonId,
      pokemonCount: selectedPokemons.length,
      pokemonIds: teamData.selectedPokemonIds,
      dungeonName: dungeonData.name,
      bossInfo: `Pokémon ${dungeonData.bossPokemonId} niveau ${dungeonData.bossLevel}`,
      spawnLevels: dungeonData.spawnLevels
    });

  } catch (error) {
    console.error('[DUNGEON] Erreur lors de la sélection d\'équipe:', error);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: `Erreur lors de la sélection d'équipe: ${(error as Error).message}`
    }));
  }
}

async function handleStartDungeon(ws: AuthenticatedWebSocket, data: { dungeonId: number }) {
  if (!ws.trainerId) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Non authentifié'
    }));
    return;
  }

  try {
    const sessionId = `${ws.trainerId}_${data.dungeonId}`;
    const session = dungeonSessions.get(sessionId);

    if (!session || session.status !== 'READY') {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Aucune session prête pour ce donjon. Sélectionnez d\'abord votre équipe.'
      }));
      return;
    }

    const dungeonData = AVAILABLE_DUNGEONS.find(d => d.id === data.dungeonId);
    if (!dungeonData) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Donjon introuvable'
      }));
      return;
    }

    // Générer 3 Pokémon aléatoires avec les niveaux du donjon
    const enemyPokemons = await generateDungeonEnemies(dungeonData);
    
    // Mettre à jour la session
    session.status = 'IN_PROGRESS';
    session.enemyPokemons = enemyPokemons;
    dungeonSessions.set(sessionId, session);

    ws.send(JSON.stringify({
      type: 'DUNGEON_STARTED',
      data: {
        sessionId,
        dungeonName: dungeonData.name,
        enemyPokemons: enemyPokemons.map(p => ({
          id: p.id,
          pokedexId: p.pokedexId,
          name: p.name,
          level: p.level,
          maxHp: p.maxHp
        })),
        message: `Exploration de ${dungeonData.name} commencée ! 3 Pokémon sauvages vous attendent.`,
        nextAction: 'Préparez-vous au premier combat !'
      }
    }));

    // Démarrer automatiquement le premier combat
    await startDungeonBattle(ws, session, 0);

  } catch (error) {
    console.error('[DUNGEON] Erreur lors du démarrage:', error);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: `Erreur lors du démarrage du donjon: ${(error as Error).message}`
    }));
  }
}

async function generateDungeonEnemies(dungeonData: IDungeonData): Promise<IBattlePokemon[]> {
  const enemies: IBattlePokemon[] = [];
  
  for (let i = 0; i < 3; i++) {
    // Choisir un Pokémon aléatoire du roster
    const randomPokedexId = POKEMON_ROSTER[Math.floor(Math.random() * POKEMON_ROSTER.length)];
    const level = dungeonData.spawnLevels[i];
    
    // Créer un Pokémon ennemi temporaire
    const tempOwnedPokemon = {
      id: `dungeon_enemy_${i}_${Date.now()}`,
      pokedexId: randomPokedexId,
      level: level,
      boostAtk: 0,
      boostDef: 0,
      boostRes: 0,
      boostPv: 0,
      genre: Math.random() > 0.5 ? 'Mâle' : 'Femelle',
      pokemonOwnedMoves: [] // Sera généré par le service battle
    };

    const battlePokemon = await battleService.convertToBattlePokemon(tempOwnedPokemon, false);
    enemies.push(battlePokemon);
  }

  return enemies;
}

async function startDungeonBattle(ws: AuthenticatedWebSocket, session: IDungeonSession, enemyIndex: number) {
  try {
    if (!session.enemyPokemons || enemyIndex >= session.enemyPokemons.length) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Ennemi introuvable'
      }));
      return;
    }

    // Récupérer l'équipe du joueur
    const trainerPokemons = await pokemonService.listOwnedPokemonsByTrainer(session.trainerId);
    const selectedPokemons = trainerPokemons.filter(p => session.selectedPokemon.includes(p.id));
    
    // Convertir en Pokémon de combat
    const playerTeam = await Promise.all(
      selectedPokemons.map(p => battleService.convertToBattlePokemon(p, true))
    );

    // Créer l'état de bataille pour le donjon
    const currentEnemy = session.enemyPokemons[enemyIndex];
    const battleState: IBattleState = {
      battleId: `dungeon_battle_${session.sessionId}_${enemyIndex}`,
      trainerId: session.trainerId,
      dungeonId: session.dungeonId,
      playerTeam: playerTeam,
      aiTeam: [currentEnemy],
      currentPlayerPokemon: playerTeam[0], // Premier Pokémon par défaut
      currentAiPokemon: currentEnemy,
      turn: 1,
      phase: 'SELECTION',
      aiDefeatedCount: 0
    };

    // Sauvegarder la bataille
    battleService.updateBattle(battleState);
    session.currentBattleId = battleState.battleId;
    session.status = 'BATTLE';
    dungeonSessions.set(session.sessionId, session);
    
    ws.battleId = battleState.battleId;

    ws.send(JSON.stringify({
      type: 'DUNGEON_BATTLE_START',
      data: {
        battleId: battleState.battleId,
        enemy: {
          id: currentEnemy.id,
          name: currentEnemy.name,
          level: currentEnemy.level,
          hp: currentEnemy.hp,
          maxHp: currentEnemy.maxHp
        },
        playerTeam: playerTeam.map(p => ({
          id: p.id,
          name: p.name,
          level: p.level,
          hp: p.hp,
          maxHp: p.maxHp
        })),
        enemyNumber: enemyIndex + 1,
        totalEnemies: session.enemyPokemons.length,
        message: `Combat ${enemyIndex + 1}/3 : ${currentEnemy.name} niveau ${currentEnemy.level} apparaît !`
      }
    }));

  } catch (error) {
    console.error('[DUNGEON] Erreur lors du démarrage du combat:', error);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: `Erreur lors du démarrage du combat: ${(error as Error).message}`
    }));
  }
}

async function handleDungeonAttack(ws: AuthenticatedWebSocket, data: { moveId: number, pokemonId?: string }) {
  if (!ws.battleId) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Aucun combat en cours'
    }));
    return;
  }

  const battleState = battleService.getBattle(ws.battleId);
  if (!battleState) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Combat introuvable'
    }));
    return;
  }

  // Utiliser la logique de combat existante (similaire à battle.ws.ts)
  // Pour simplifier, on réutilise la logique d'attaque du système de combat
  const playerMove = battleState.currentPlayerPokemon.moves.find(m => m.id === data.moveId);
  if (!playerMove || playerMove.pp <= 0) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Attaque invalide ou PP épuisés'
    }));
    return;
  }

  const aiMove = battleService.selectAiMove(battleState.currentAiPokemon);
  
  // Exécuter le combat
  const playerFirst = 
    playerMove.priority > aiMove.priority ||
    (playerMove.priority === aiMove.priority && 
     battleState.currentPlayerPokemon.speed >= battleState.currentAiPokemon.speed);

  const results = [];
  
  if (playerFirst) {
    const playerResult = battleService.executeAttack(
      battleState.currentPlayerPokemon,
      battleState.currentAiPokemon,
      playerMove
    );
    results.push(playerResult);

    if (!playerResult.isKO) {
      const aiResult = battleService.executeAttack(
        battleState.currentAiPokemon,
        battleState.currentPlayerPokemon,
        aiMove
      );
      results.push(aiResult);
    }
  } else {
    const aiResult = battleService.executeAttack(
      battleState.currentAiPokemon,
      battleState.currentPlayerPokemon,
      aiMove
    );
    results.push(aiResult);

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

  ws.send(JSON.stringify({
    type: 'DUNGEON_BATTLE_RESULT',
    data: {
      results,
      playerPokemon: battleState.currentPlayerPokemon,
      enemyPokemon: battleState.currentAiPokemon,
      turn: battleState.turn
    }
  }));

  // Vérifier si le combat est terminé
  await handleDungeonBattleEnd(ws, battleState);
}

async function handleDungeonBattleEnd(ws: AuthenticatedWebSocket, battleState: IBattleState) {
  const sessionId = `${battleState.trainerId}_${battleState.dungeonId}`;
  const session = dungeonSessions.get(sessionId);
  
  if (!session) return;

  // Si l'ennemi est KO
  if (battleState.currentAiPokemon.hp === 0) {
    session.defeatedEnemies = (session.defeatedEnemies || 0) + 1;
    
    if (session.defeatedEnemies >= 3) {
      // Tous les ennemis sont battus - Donjon terminé !
      session.status = 'COMPLETED';
      const dungeonData = AVAILABLE_DUNGEONS.find(d => d.id === session.dungeonId);
      
      ws.send(JSON.stringify({
        type: 'DUNGEON_COMPLETED',
        data: {
          message: `Félicitations ! Vous avez terminé ${dungeonData?.name} !`,
          rewards: dungeonData?.rewards || 'Récompenses inconnues',
          defeatedEnemies: session.defeatedEnemies
        }
      }));
      
      battleService.deleteBattle(battleState.battleId);
      dungeonSessions.delete(sessionId);
    } else {
      // Passer au prochain ennemi
      ws.send(JSON.stringify({
        type: 'DUNGEON_ENEMY_DEFEATED',
        data: {
          message: `${battleState.currentAiPokemon.name} est vaincu !`,
          defeatedEnemies: session.defeatedEnemies,
          nextEnemy: session.defeatedEnemies + 1
        }
      }));
      
      battleService.deleteBattle(battleState.battleId);
      await startDungeonBattle(ws, session, session.defeatedEnemies);
    }
  }
  
  // Si le joueur est KO
  if (battleState.currentPlayerPokemon.hp === 0) {
    const alivePokemon = battleState.playerTeam.filter(p => p.hp > 0);
    
    if (alivePokemon.length === 0) {
      // Défaite - Donjon échoué
      session.status = 'READY'; // Permet de recommencer
      
      ws.send(JSON.stringify({
        type: 'DUNGEON_FAILED',
        data: {
          message: 'Tous vos Pokémon sont KO ! Exploration échouée.',
          defeatedEnemies: session.defeatedEnemies || 0
        }
      }));
      
      battleService.deleteBattle(battleState.battleId);
    } else {
      // Demander de changer de Pokémon
      ws.send(JSON.stringify({
        type: 'DUNGEON_FORCE_SWITCH',
        data: {
          availablePokemon: alivePokemon,
          message: `${battleState.currentPlayerPokemon.name} est KO ! Choisissez un autre Pokémon.`
        }
      }));
    }
  }
}

async function handleDungeonSwitch(ws: AuthenticatedWebSocket, data: { pokemonId: string }) {
  if (!ws.battleId) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Aucun combat en cours'
    }));
    return;
  }

  const battleState = battleService.getBattle(ws.battleId);
  if (!battleState) return;

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
    type: 'DUNGEON_POKEMON_SWITCHED',
    data: {
      newPokemon: battleState.currentPlayerPokemon,
      message: `${newPokemon.name} entre en combat !`
    }
  }));
}

async function handleGetDungeonInfo(ws: AuthenticatedWebSocket, data: { dungeonId: number }) {
  if (!ws.trainerId) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'Non authentifié'
    }));
    return;
  }

  try {
    const sessionId = `${ws.trainerId}_${data.dungeonId}`;
    const session = dungeonSessions.get(sessionId);

    if (!session) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Aucune session active pour ce donjon'
      }));
      return;
    }

    // Informations basiques du donjon (à étendre plus tard)
    const dungeonInfo = {
      dungeonId: session.dungeonId,
      name: `Donjon ${session.dungeonId}`,
      difficulty: getDungeonDifficulty(session.dungeonId),
      recommendedLevel: getRecommendedLevel(session.dungeonId),
      description: `Exploration du donjon numéro ${session.dungeonId}`
    };

    ws.send(JSON.stringify({
      type: 'DUNGEON_INFO',
      data: {
        ...dungeonInfo,
        session: {
          status: session.status,
          selectedPokemonCount: session.selectedPokemon.length
        },
        message: `Informations du ${dungeonInfo.name} récupérées`
      }
    }));

  } catch (error) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: `Erreur lors de la récupération des informations: ${(error as Error).message}`
    }));
  }
}

// Fonctions utilitaires (à adapter selon tes besoins)
function getDungeonDifficulty(dungeonId: number): string {
  if (dungeonId <= 5) return 'FACILE';
  if (dungeonId <= 10) return 'MOYEN';
  if (dungeonId <= 15) return 'DIFFICILE';
  return 'TRÈS DIFFICILE';
}

function getRecommendedLevel(dungeonId: number): number {
  return Math.min(10 + (dungeonId * 5), 100);
}

// Fonction pour récupérer une session (utile pour d'autres parties du code)
export function getDungeonSession(trainerId: string, dungeonId: number): IDungeonSession | undefined {
  const sessionId = `${trainerId}_${dungeonId}`;
  return dungeonSessions.get(sessionId);
}

// Fonction pour supprimer une session
export function deleteDungeonSession(trainerId: string, dungeonId: number): boolean {
  const sessionId = `${trainerId}_${dungeonId}`;
  return dungeonSessions.delete(sessionId);
}
