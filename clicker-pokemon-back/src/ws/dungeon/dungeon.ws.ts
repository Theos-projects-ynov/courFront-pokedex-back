import { WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { dungeonService } from '../../services/dungeon.service';
import * as pokemonService from '../../services/pokemon.service';

const JWT_SECRET = process.env.JWT_SECRET || 'ultrasecret';

interface AuthenticatedWebSocket extends WebSocket {
  trainerId?: string;
}

export function setupDungeonWebSocket(ws: AuthenticatedWebSocket, request: any) {
  console.log('New dungeon WebSocket connection');

  ws.on('message', async (data: any) => {
    try {
      console.log('[DUNGEON WS] Raw data received:', data);
      console.log('[DUNGEON WS] Data type:', typeof data);
      console.log('[DUNGEON WS] Data length:', data.length);
      
      // Convertir en string si c'est un Buffer
      const dataString = data.toString();
      console.log('[DUNGEON WS] Data as string:', dataString);
      
      // Tenter de parser le JSON, avec fallback pour JS object literal
      let message;
      try {
        message = JSON.parse(dataString);
      } catch (jsonError) {
        console.log('[DUNGEON WS] JSON parse failed, trying to fix format...');
        
        // Tenter de corriger le format JS object literal vers JSON
        try {
          const fixedJson = dataString
            .replace(/(\w+):/g, '"$1":')  // Ajouter guillemets aux clés
            .replace(/'/g, '"');          // Remplacer ' par "
            
          console.log('[DUNGEON WS] Fixed JSON:', fixedJson);
          message = JSON.parse(fixedJson);
        } catch (fixError) {
          console.error('[DUNGEON WS] Failed to fix JSON format:', fixError);
          throw jsonError; // Relancer l'erreur originale
        }
      }
      console.log('[DUNGEON WS] Parsed message:', message);

      switch (message.type) {
        case 'ENTER_DUNGEON':
          await handleEnterDungeon(ws, message);
          break;

        case 'START_FIGHT':
          await handleStartFight(ws, message);
          break;

        case 'CHANGE_POKEMON':
          await handleChangePokemon(ws, message);
          break;

        default:
          ws.send(JSON.stringify({
            type: 'ERROR',
            error: 'Action non reconnue pour le mode donjon',
            code: 'UNKNOWN_ACTION'
          }));
      }
    } catch (error) {
      console.error('[DUNGEON WS] Error:', error);
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'Erreur lors du traitement du message',
        code: 'PROCESSING_ERROR'
      }));
    }
  });

  ws.on('close', () => {
    if (ws.trainerId) {
      // Nettoyer la session si nécessaire
      dungeonService.deleteSession(ws.trainerId);
    }
    console.log('Dungeon WebSocket connection closed');
  });
}

async function handleEnterDungeon(ws: AuthenticatedWebSocket, message: any) {
  try {
    // 1. Authentification
    if (!message.token) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'Token requis',
        code: 'MISSING_TOKEN'
      }));
      return;
    }

    let trainerId: string;
    try {
      const decoded = jwt.verify(message.token, JWT_SECRET) as any;
      trainerId = decoded.id;
      ws.trainerId = trainerId;
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'Token invalide',
        code: 'INVALID_TOKEN'
      }));
      return;
    }

    // 2. Validation des données
    const { dungeonId, selectedPokemonIds } = message.data || {};
    
    if (!dungeonId || !selectedPokemonIds) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'Données manquantes : dungeonId et selectedPokemonIds requis',
        code: 'MISSING_DATA'
      }));
      return;
    }

    if (!Array.isArray(selectedPokemonIds) || selectedPokemonIds.length !== 4) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'Exactement 4 Pokémon requis',
        code: 'INVALID_TEAM_SIZE'
      }));
      return;
    }

    // 3. Vérifier que le donjon existe
    const dungeon = await dungeonService.getDungeonById(dungeonId);
    if (!dungeon) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'Donjon introuvable ou inactif',
        code: 'DUNGEON_NOT_AVAILABLE'
      }));
      return;
    }

    // 4. Vérifier que les Pokémon appartiennent au joueur
    const trainerPokemons = await pokemonService.listOwnedPokemonsByTrainer(trainerId);
    const trainerPokemonIds = trainerPokemons.map(p => p.id);
    
    const invalidPokemonIds = selectedPokemonIds.filter(id => !trainerPokemonIds.includes(id));
    if (invalidPokemonIds.length > 0) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: `Pokémon non possédés : ${invalidPokemonIds.join(', ')}`,
        code: 'POKEMON_NOT_OWNED'
      }));
      return;
    }

    // 5. Vérifier s'il y a une session existante
    const existingSession = await dungeonService.getActiveSession(trainerId);
    const hadExistingSession = !!existingSession;
    
    // 6. Créer la nouvelle session (écrase l'ancienne si elle existe)
    const session = await dungeonService.createOrUpdateSession(trainerId, dungeonId, selectedPokemonIds);
    const dungeonInfo = await dungeonService.generateDungeonInfo(dungeonId);
    
    if (!dungeonInfo) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'Impossible de générer les informations du donjon',
        code: 'GENERATION_ERROR'
      }));
      return;
    }

    // 7. Récupérer les détails des Pokémon sélectionnés avec leurs vraies données
    const selectedPokemons = trainerPokemons.filter(p => selectedPokemonIds.includes(p.id));
    
    // Récupérer les vraies données des Pokémon depuis l'API
    const pokemonDetailsPromises = selectedPokemons.map(async (p) => {
      try {
        const response = await fetch(`https://tyradex.app/api/v1/pokemon/${p.pokedexId}`);
        const pokemonData = await response.json() as any;
        
        // Calculer les vraies stats avec les boosts
        const level = p.level;
        const maxHp = Math.floor((pokemonData.stats?.hp || 45) * 2 * level / 100 + level + 10) + p.boostPv;
        const attack = Math.floor((pokemonData.stats?.atk || 49) * 2 * level / 100 + 5) + p.boostAtk;
        const defense = Math.floor((pokemonData.stats?.def || 49) * 2 * level / 100 + 5) + p.boostDef;
        const speed = Math.floor((pokemonData.stats?.spe || 45) * 2 * level / 100 + 5);
        
        return {
          id: p.id,
          pokedexId: p.pokedexId,
          name: pokemonData.name?.fr || pokemonData.name?.en || `Pokémon ${p.pokedexId}`,
          level: p.level,
          genre: p.genre,
          sprite: pokemonData.sprites?.regular || '',
          types: pokemonData.types?.map((t: any) => t.name) || [],
          stats: {
            hp: maxHp,
            maxHp: maxHp,
            attack: attack,
            defense: defense,
            speed: speed
          },
          boosts: {
            atk: p.boostAtk,
            def: p.boostDef,
            res: p.boostRes,
            pv: p.boostPv
          }
        };
      } catch (error) {
        console.error(`[DUNGEON] Error fetching data for Pokemon ${p.pokedexId}:`, error);
        // Fallback avec données basiques
        const level = p.level;
        const maxHp = Math.floor(45 * 2 * level / 100 + level + 10) + p.boostPv;
        
        return {
          id: p.id,
          pokedexId: p.pokedexId,
          name: `Pokémon ${p.pokedexId}`,
          level: p.level,
          genre: p.genre,
          sprite: '',
          types: ['Normal'],
          stats: {
            hp: maxHp,
            maxHp: maxHp,
            attack: Math.floor(49 * 2 * level / 100 + 5) + p.boostAtk,
            defense: Math.floor(49 * 2 * level / 100 + 5) + p.boostDef,
            speed: Math.floor(45 * 2 * level / 100 + 5)
          },
          boosts: {
            atk: p.boostAtk,
            def: p.boostDef,
            res: p.boostRes,
            pv: p.boostPv
          }
        };
      }
    });
    
    const detailedPokemons = await Promise.all(pokemonDetailsPromises);

    // 8. Envoyer la réponse complète
    console.log(`[DUNGEON] Sending ${session.enemyPokemons?.length || 0} enemies to front (${(session.enemyPokemons?.length || 1) - 1} normal + 1 boss)`);
    
    ws.send(JSON.stringify({
      type: 'DUNGEON_READY',
      data: {
        trainerId,
        session: {
          id: session.id,
          status: session.status,
          selectedPokemon: session.selectedPokemon,
          defeatedEnemies: session.defeatedEnemies
        },
        dungeonInfo: {
          id: dungeon.id,
          name: dungeon.name,
          description: dungeon.description,
          rewards: dungeon.rewards,
          bossLevel: dungeon.bossLevel,
          spawnLevels: dungeon.spawnLevels
        },
        playerTeam: detailedPokemons,
        enemies: session.enemyPokemons?.slice(0, -1).map((enemy: any) => ({
          id: enemy.id,
          pokedexId: enemy.pokedexId,
          name: enemy.name,
          level: enemy.level,
          hp: enemy.hp,
          maxHp: enemy.maxHp,
          sprite: enemy.sprite,
          types: enemy.types,
          moves: enemy.moves.map((m: any) => ({
            id: m.id,
            name: m.name,
            power: m.power,
            type: m.type
          }))
        })) || [],
        boss: session.enemyPokemons && session.enemyPokemons.length > 0 ? (() => {
          const boss = session.enemyPokemons[session.enemyPokemons.length - 1] as any;
          return {
            pokedexId: boss.pokedexId,
            name: boss.name,
            level: boss.level,
            sprite: boss.sprite,
            types: boss.types,
            stats: boss.stats
          };
        })() : {
          pokedexId: dungeonInfo.boss.pokedexId,
          name: dungeonInfo.boss.name,
          level: dungeonInfo.boss.level,
          sprite: dungeonInfo.boss.sprite,
          types: dungeonInfo.boss.types,
          stats: dungeonInfo.boss.stats
        },
        rewards: dungeonInfo.dynamicRewards,
        message: hadExistingSession 
          ? `Session précédente écrasée ! Bienvenue dans ${dungeon.name} ! 3 adversaires + 1 boss vous attendent.`
          : `Bienvenue dans ${dungeon.name} ! 3 adversaires + 1 boss vous attendent.`,
        nextAction: 'Prêt pour le premier combat !',
        sessionReset: hadExistingSession
      }
    }));

    if (hadExistingSession) {
      console.log(`[DUNGEON] ${trainerId} reset previous session and entered dungeon ${dungeonId} with team:`, selectedPokemonIds);
    } else {
      console.log(`[DUNGEON] ${trainerId} entered dungeon ${dungeonId} with team:`, selectedPokemonIds);
    }

  } catch (error) {
    console.error('[DUNGEON] Error in handleEnterDungeon:', error);
    ws.send(JSON.stringify({
      type: 'ERROR',
      error: `Erreur lors de l'entrée dans le donjon: ${(error as Error).message}`,
      code: 'INTERNAL_ERROR'
    }));
  }
}

// Map pour stocker les combats actifs
const activeBattles = new Map<string, IBattleState>();

interface IBattleState {
  battleId: string;
  trainerId: string;
  playerPokemon: IBattlePokemon;
  enemyPokemon: IBattlePokemon;
  turn: number;
  isActive: boolean;
  ws: AuthenticatedWebSocket;
}

interface IBattlePokemon {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  moves: IBattleMove[];
}

interface IBattleMove {
  id: number;
  name: string;
  power: number;
  accuracy: number;
  pp: number;
  priority: number;
}

async function handleStartFight(ws: AuthenticatedWebSocket, message: any) {
  if (!ws.trainerId) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      error: 'Non authentifié',
      code: 'UNAUTHORIZED'
    }));
    return;
  }

  try {
    const { selectedPokemonId } = message.data || {};
    
    if (!selectedPokemonId) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'ID du Pokémon requis',
        code: 'MISSING_POKEMON_ID'
      }));
      return;
    }

    // Vérifier qu'il y a une session active
    const session = await dungeonService.getActiveSession(ws.trainerId);
    if (!session) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'Aucune session de donjon active. Utilisez ENTER_DUNGEON d\'abord.',
        code: 'NO_ACTIVE_SESSION'
      }));
      return;
    }

    // Récupérer les vraies données du Pokémon du joueur
    const trainerPokemons = await pokemonService.listOwnedPokemonsByTrainer(ws.trainerId);
    const selectedPokemon = trainerPokemons.find(p => p.id === selectedPokemonId);
    
    if (!selectedPokemon) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'Pokémon non trouvé',
        code: 'POKEMON_NOT_FOUND'
      }));
      return;
    }

    // Calculer les vraies stats du Pokémon joueur
    const playerLevel = selectedPokemon.level;
    const playerMaxHp = Math.floor((45 * 2 * playerLevel) / 100 + playerLevel + 10) + selectedPokemon.boostPv;
    const playerAttack = Math.floor((49 * 2 * playerLevel) / 100 + 5) + selectedPokemon.boostAtk;
    const playerDefense = Math.floor((49 * 2 * playerLevel) / 100 + 5) + selectedPokemon.boostDef;
    const playerSpeed = Math.floor((45 * 2 * playerLevel) / 100 + 5);

    // Noms des pokémons les plus communs
    const pokemonNames: { [key: number]: string } = {
      1: 'Bulbizarre', 4: 'Salamèche', 7: 'Carapuce', 15: 'Dardargnan', 25: 'Pikachu', 
      39: 'Rondoudou', 41: 'Nosferapti', 52: 'Miaouss', 53: 'Persian', 54: 'Psykokwak', 58: 'Caninos', 60: 'Ptitard', 
      63: 'Abra', 66: 'Machoc', 69: 'Chétiflor', 72: 'Tentacool', 74: 'Racaillou', 
      81: 'Magnéti', 84: 'Doduo', 86: 'Otaria', 90: 'Kokiyas', 92: 'Fantominus',
      95: 'Onix', 100: 'Voltorbe', 102: 'Noeunoeuf', 103: 'Noadkoko', 104: 'Osselait', 
      107: 'Tygnon', 109: 'Smogo', 111: 'Rhinocorne', 116: 'Hypotrempe', 118: 'Poissirène', 120: 'Stari', 
      129: 'Magicarpe', 131: 'Lokhlass', 133: 'Évoli', 136: 'Pyroli', 138: 'Amonita', 
      140: 'Kabuto', 142: 'Ptéra', 144: 'Artikodin', 147: 'Minidraco', 151: 'Mew'
    };

    // Créer le Pokémon joueur pour le combat
    const playerPokemon: IBattlePokemon = {
      id: selectedPokemon.id,
      name: pokemonNames[selectedPokemon.pokedexId] || `Pokémon ${selectedPokemon.pokedexId}`,
      level: selectedPokemon.level,
      hp: playerMaxHp, // HP complets au début du combat
      maxHp: playerMaxHp,
      attack: playerAttack,
      defense: playerDefense,
      speed: playerSpeed,
      moves: [
        { id: 1, name: 'Charge', power: 40, accuracy: 100, pp: 35, priority: 0 },
        { id: 2, name: 'Griffe', power: 35, accuracy: 95, pp: 30, priority: 0 }
      ]
    };

    // Récupérer les ennemis stockés dans la session
    console.log(`[DUNGEON] Session enemyPokemons:`, session.enemyPokemons ? 'EXISTS' : 'NULL');
    console.log(`[DUNGEON] Enemy count in session:`, session.enemyPokemons?.length || 0);
    
    if (!session.enemyPokemons || session.enemyPokemons.length === 0) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'Aucun ennemi trouvé dans la session. Relancez ENTER_DUNGEON.',
        code: 'NO_ENEMIES_IN_SESSION'
      }));
      return;
    }

    // Déterminer quel ennemi combattre (basé sur les ennemis déjà battus)
    const defeatedCount = session.defeatedEnemies || 0;
    
    if (defeatedCount >= session.enemyPokemons.length) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'Tous les ennemis ont déjà été battus. Donjon terminé !',
        code: 'DUNGEON_COMPLETED'
      }));
      return;
    }

    // Récupérer l'ennemi actuel depuis la session
    const currentEnemy = session.enemyPokemons[defeatedCount];

    // Vérifier s'il y a un combat en cours avec cet ennemi (pour préserver les HP)
    const existingBattle = Array.from(activeBattles.values()).find(
      battle => battle.trainerId === ws.trainerId && battle.enemyPokemon.id === currentEnemy.id
    );

    // Créer l'ennemi pour le combat (tous sont des IPokemonAdversaire dans la session)
    const enemy = currentEnemy as any; // IPokemonAdversaire
    
    // Maintenant tous les ennemis (y compris boss) ont des moves
    const enemyMoves = enemy.moves.map((move: any) => ({
      id: move.id,
      name: move.name,
      power: move.power || 40,
      accuracy: move.accuracy || 100,
      pp: move.pp,
      priority: move.priority
    }));
    
    const enemyPokemon: IBattlePokemon = {
      id: enemy.id,
      name: enemy.name,
      level: enemy.level,
      // ✅ Préserver les HP si c'est un changement de pokémon
      hp: existingBattle ? existingBattle.enemyPokemon.hp : enemy.hp,
      maxHp: enemy.maxHp,
      attack: enemy.stats.attack,
      defense: enemy.stats.defense,
      speed: enemy.stats.speed,
      moves: enemyMoves
    };

    // Nettoyer l'ancien combat s'il existe
    if (existingBattle) {
      activeBattles.delete(existingBattle.battleId);
      console.log(`[DUNGEON] Preserved enemy HP: ${enemyPokemon.hp}/${enemyPokemon.maxHp}`);
    }

    // Créer l'état du combat
    const battleId = `battle_${ws.trainerId}_${Date.now()}`;
    const battleState: IBattleState = {
      battleId,
      trainerId: ws.trainerId,
      playerPokemon,
      enemyPokemon,
      turn: 1,
      isActive: true,
      ws
    };

    // Stocker le combat
    activeBattles.set(battleId, battleState);

    // Envoyer le début du combat
    const enemyNumber = defeatedCount + 1;
    const totalEnemies = session.enemyPokemons.length;
    const isBoss = defeatedCount === (session.enemyPokemons.length - 1); // Le dernier est le boss
    
    ws.send(JSON.stringify({
      type: 'BATTLE_STARTED',
      data: {
        playerPokemon,
        enemyPokemon,
        battleId,
        enemyNumber,
        totalEnemies,
        isBoss,
        message: isBoss 
          ? `Combat final contre le Boss ${enemyPokemon.name} niveau ${enemyPokemon.level} !`
          : `Combat ${enemyNumber}/${totalEnemies} contre ${enemyPokemon.name} niveau ${enemyPokemon.level} !`
      }
    }));

    console.log(`[DUNGEON] ${ws.trainerId} started fight with Pokemon: ${selectedPokemonId}`);

    // Démarrer la boucle de combat automatique après 2 secondes
    setTimeout(() => {
      startBattleLoop(battleId);
    }, 2000);

  } catch (error) {
    console.error('[DUNGEON] Error in handleStartFight:', error);
    ws.send(JSON.stringify({
      type: 'ERROR',
      error: `Erreur lors du démarrage du combat: ${(error as Error).message}`,
      code: 'FIGHT_START_ERROR'
    }));
  }
}

// Fonction principale de la boucle de combat
async function startBattleLoop(battleId: string) {
  const battle = activeBattles.get(battleId);
  if (!battle || !battle.isActive) return;

  console.log(`[BATTLE] Starting turn ${battle.turn} for battle ${battleId}`);

  // Choisir les attaques aléatoirement
  const playerMove = getRandomMove(battle.playerPokemon);
  const enemyMove = getRandomMove(battle.enemyPokemon);

  // Déterminer l'ordre d'attaque (priorité puis vitesse)
  const attackOrder = determineAttackOrder(
    { pokemon: battle.playerPokemon, move: playerMove, isPlayer: true },
    { pokemon: battle.enemyPokemon, move: enemyMove, isPlayer: false }
  );

  // Exécuter les attaques dans l'ordre
  for (let i = 0; i < attackOrder.length; i++) {
    const attacker = attackOrder[i];
    const defender = attacker.isPlayer ? battle.enemyPokemon : battle.playerPokemon;
    
    // Vérifier si le Pokémon attaquant est encore vivant
    if (attacker.pokemon.hp <= 0) continue;

    // Calculer les dégâts
    const damage = calculateDamage(attacker.pokemon, defender, attacker.move);
    const isCritical = Math.random() < 0.1; // 10% de chance de critique
    const finalDamage = isCritical ? Math.floor(damage * 1.5) : damage;

    // Appliquer les dégâts
    defender.hp = Math.max(0, defender.hp - finalDamage);

    // Envoyer le message d'attaque
    battle.ws.send(JSON.stringify({
      type: 'ATTACK_RESULT',
      data: {
        turn: battle.turn,
        attacker: {
          id: attacker.pokemon.id,
          name: attacker.pokemon.name,
          isPlayer: attacker.isPlayer
        },
        defender: {
          id: defender.id,
          name: defender.name,
          isPlayer: !attacker.isPlayer
        },
        move: attacker.move,
        damage: finalDamage,
        isCritical,
        remainingHp: defender.hp,
        maxHp: defender.maxHp,
        message: `${attacker.pokemon.name} utilise ${attacker.move.name} et inflige ${finalDamage} dégâts !${isCritical ? ' Coup critique !' : ''}`
      }
    }));

    console.log(`[BATTLE] ${attacker.pokemon.name} attacks with ${attacker.move.name} for ${finalDamage} damage. ${defender.name} HP: ${defender.hp}/${defender.maxHp}`);

    // Vérifier si le défenseur est KO
    if (defender.hp <= 0) {
      // Pokémon KO - arrêter le combat temporairement
      battle.isActive = false;
      
      setTimeout(async () => {
        battle.ws.send(JSON.stringify({
          type: 'POKEMON_KO',
          data: {
            koedPokemon: {
              id: defender.id,
              name: defender.name,
              isPlayer: !attacker.isPlayer
            },
            winner: {
              id: attacker.pokemon.id,
              name: attacker.pokemon.name,
              isPlayer: attacker.isPlayer
            },
            message: `${defender.name} est KO ! ${attacker.pokemon.name} remporte le combat !`
          }
        }));

        if (attacker.isPlayer) {
          // Le joueur gagne - mettre à jour le compteur et enchaîner automatiquement
          await updateDefeatedEnemiesCount(battle.trainerId);
          await handlePlayerVictory(battle.trainerId, battleId);
        } else {
          // Le bot gagne - vérifier si le joueur peut changer de pokémon
          await handlePlayerDefeat(battle.trainerId, battleId);
        }
      }, 1000);

      return; // Sortir de la boucle
    }

    // Délai entre les attaques
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Incrémenter le tour
  battle.turn++;

  // Continuer la boucle si le combat est toujours actif
  if (battle.isActive && battle.playerPokemon.hp > 0 && battle.enemyPokemon.hp > 0) {
    setTimeout(() => {
      startBattleLoop(battleId);
    }, 1000); // Délai entre les tours
  }
}

// Fonctions utilitaires
function getRandomMove(pokemon: IBattlePokemon): IBattleMove {
  const availableMoves = pokemon.moves.filter(move => move.pp > 0);
  if (availableMoves.length === 0) {
    // Attaque par défaut si plus de PP
    return { id: 0, name: 'Lutte', power: 20, accuracy: 100, pp: 1, priority: 0 };
  }
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function determineAttackOrder(
  playerAction: { pokemon: IBattlePokemon; move: IBattleMove; isPlayer: boolean },
  enemyAction: { pokemon: IBattlePokemon; move: IBattleMove; isPlayer: boolean }
): Array<{ pokemon: IBattlePokemon; move: IBattleMove; isPlayer: boolean }> {
  
  // Comparer les priorités
  if (playerAction.move.priority > enemyAction.move.priority) {
    return [playerAction, enemyAction];
  } else if (enemyAction.move.priority > playerAction.move.priority) {
    return [enemyAction, playerAction];
  } else {
    // Même priorité - comparer la vitesse
    if (playerAction.pokemon.speed >= enemyAction.pokemon.speed) {
      return [playerAction, enemyAction];
    } else {
      return [enemyAction, playerAction];
    }
  }
}

function calculateDamage(attacker: IBattlePokemon, defender: IBattlePokemon, move: IBattleMove): number {
  if (move.power === 0) return 0;
  
  // Formule simplifiée de calcul de dégâts
  const attack = attacker.attack;
  const defense = defender.defense;
  const power = move.power;
  const level = attacker.level;

  // Formule basique : ((2 * level + 10) / 250) * (attack / defense) * power + 2
  const baseDamage = Math.floor(((2 * level + 10) / 250) * (attack / defense) * power + 2);
  
  // Ajouter un facteur aléatoire (85% - 100%)
  const randomFactor = 0.85 + Math.random() * 0.15;
  
  return Math.max(1, Math.floor(baseDamage * randomFactor));
}

// Fonction pour mettre à jour le compteur d'ennemis battus
async function updateDefeatedEnemiesCount(trainerId: string): Promise<void> {
  try {
    const session = await dungeonService.getActiveSession(trainerId);
    if (!session) return;

    const newDefeatedCount = (session.defeatedEnemies || 0) + 1;
    const totalEnemies = session.enemyPokemons?.length || 0;

    if (newDefeatedCount >= totalEnemies) {
      // Donjon terminé
      await dungeonService.updateSessionStatus(trainerId, 'COMPLETED', newDefeatedCount);
      console.log(`[DUNGEON] ${trainerId} completed dungeon! All enemies defeated.`);
    } else {
      // Continuer le donjon
      await dungeonService.updateSessionStatus(trainerId, 'IN_PROGRESS', newDefeatedCount);
      console.log(`[DUNGEON] ${trainerId} defeated enemy ${newDefeatedCount}/${totalEnemies}`);
    }
  } catch (error) {
    console.error('[DUNGEON] Error updating defeated enemies count:', error);
  }
}

// Fonction pour gérer la victoire du joueur
async function handlePlayerVictory(trainerId: string, battleId: string): Promise<void> {
  try {
    const session = await dungeonService.getActiveSession(trainerId);
    if (!session) {
      console.error(`[DUNGEON] No active session found for trainer ${trainerId}`);
      return;
    }

    const battle = activeBattles.get(battleId);
    if (!battle) {
      console.error(`[DUNGEON] Battle ${battleId} not found`);
      return;
    }

    const defeatedCount = session.defeatedEnemies || 0;
    const totalEnemies = session.enemyPokemons?.length || 0;

    if (defeatedCount >= totalEnemies) {
      // Donjon terminé avec victoire - récupérer les vraies récompenses
      const dungeonInfo = await dungeonService.generateDungeonInfo(session.dungeonId);
      const rewards = dungeonInfo ? dungeonInfo.dynamicRewards : {
        money: 500,
        experience: 1000,
        items: [
          { name: 'Potion', quantity: 2, rarity: 'common' },
          { name: 'Super Ball', quantity: 1, rarity: 'uncommon' }
        ]
      };

      battle.ws.send(JSON.stringify({
        type: 'DUNGEON_COMPLETED_WIN',
        data: {
          message: '🎉 Félicitations ! Vous avez terminé le donjon !',
          defeatedEnemies: defeatedCount,
          totalEnemies,
          rewards: {
            money: rewards.money,
            experience: rewards.experience,
            items: rewards.items
          },
          dungeonName: dungeonInfo?.dungeon.name || 'Donjon Mystérieux'
        }
      }));
      
      // Nettoyer le combat
      activeBattles.delete(battleId);
      console.log(`[DUNGEON] ${trainerId} completed dungeon! All enemies defeated.`);
    } else {
      // Enchaîner automatiquement avec le prochain ennemi
      battle.ws.send(JSON.stringify({
        type: 'ENEMY_DEFEATED',
        data: {
          message: `Ennemi ${defeatedCount}/${totalEnemies} vaincu ! Combat suivant dans 3 secondes...`,
          defeatedEnemies: defeatedCount,
          totalEnemies,
          nextBattleDelay: 4000
        }
      }));

      // Nettoyer le combat actuel
      activeBattles.delete(battleId);
      
      // Relancer automatiquement le prochain combat après 3 secondes
      setTimeout(() => {
        console.log(`[DUNGEON] Auto-starting next fight for ${trainerId}`);
        // Relancer automatiquement avec le même pokémon
        const lastSelectedPokemon = battle.playerPokemon.id;
        handleStartFight(battle.ws, { data: { selectedPokemonId: lastSelectedPokemon } });
      }, 4000);
    }
  } catch (error) {
    console.error('[DUNGEON] Error in handlePlayerVictory:', error);
  }
}

// Fonction pour gérer la défaite du joueur
async function handlePlayerDefeat(trainerId: string, battleId: string): Promise<void> {
  try {
    const battle = activeBattles.get(battleId);
    if (!battle) {
      console.error(`[DUNGEON] Battle ${battleId} not found`);
      return;
    }

    // Récupérer l'équipe du joueur sélectionnée pour le donjon
    const session = await dungeonService.getActiveSession(trainerId);
    if (!session || !session.selectedPokemon) {
      // Aucune session active - erreur
      battle.ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'Session de donjon introuvable',
        code: 'NO_ACTIVE_SESSION'
      }));
      
      activeBattles.delete(battleId);
      return;
    }

    // Ajouter le pokémon KO à la liste des morts
    await dungeonService.addDeadPokemon(trainerId, battle.playerPokemon.id);

    // Récupérer tous les pokémon de l'équipe sélectionnée sauf ceux qui sont morts
    const playerPokemons = await pokemonService.listOwnedPokemonsByTrainer(trainerId);
    const selectedPokemonIds = session.selectedPokemon;
    const deadPokemonIds = session.deadPokemonIds || [];
    const availablePokemons = playerPokemons.filter((pokemon: any) => 
      selectedPokemonIds.includes(pokemon.id) && !deadPokemonIds.includes(pokemon.id) && pokemon.id !== battle.playerPokemon.id
    );

    if (availablePokemons.length === 0) {
      // Aucun pokémon disponible dans l'équipe - défaite
      battle.ws.send(JSON.stringify({
        type: 'DUNGEON_COMPLETED_LOOSE',
        data: {
          message: '💀 Tous vos Pokémon de l\'équipe sont KO ! Vous avez perdu le combat.',
          canRetry: true
        }
      }));
      
      // Nettoyer le combat
      activeBattles.delete(battleId);
      console.log(`[DUNGEON] ${trainerId} defeated - no more pokemon available in team`);
    } else {
      // Le joueur peut changer de pokémon - attendre un peu après POKEMON_KO
      const playerPokemonName = battle.playerPokemon.name;
      const ws = battle.ws;
      
      console.log(`[DUNGEON] ${trainerId} has ${availablePokemons.length} pokemon available for switch`);
      
      setTimeout(async () => {
        console.log(`[DUNGEON] 🔄 Sending FORCE_POKEMON_SWITCH to ${trainerId}`);
        
        // Récupérer les vrais noms des pokémons disponibles (même mapping que plus haut)
        const pokemonNamesMap: { [key: number]: string } = {
          1: 'Bulbizarre', 4: 'Salamèche', 7: 'Carapuce', 15: 'Dardargnan', 25: 'Pikachu', 
          39: 'Rondoudou', 41: 'Nosferapti', 52: 'Miaouss', 53: 'Persian', 54: 'Psykokwak', 58: 'Caninos', 60: 'Ptitard', 
          63: 'Abra', 66: 'Machoc', 69: 'Chétiflor', 72: 'Tentacool', 74: 'Racaillou', 
          81: 'Magnéti', 84: 'Doduo', 86: 'Otaria', 90: 'Kokiyas', 92: 'Fantominus',
          95: 'Onix', 100: 'Voltorbe', 102: 'Noeunoeuf', 103: 'Noadkoko', 104: 'Osselait', 
          107: 'Tygnon', 109: 'Smogo', 111: 'Rhinocorne', 116: 'Hypotrempe', 118: 'Poissirène', 120: 'Stari', 
          129: 'Magicarpe', 131: 'Lokhlass', 133: 'Évoli', 136: 'Pyroli', 138: 'Amonita', 
          140: 'Kabuto', 142: 'Ptéra', 144: 'Artikodin', 147: 'Minidraco', 151: 'Mew',
          152: 'Germignon', 155: 'Héricendre', 158: 'Kaiminus'
        };
        
        const pokemonWithNames = availablePokemons.map((pokemon: any) => ({
          id: pokemon.id,
          pokedexId: pokemon.pokedexId,
          name: pokemonNamesMap[pokemon.pokedexId] || `Pokémon ${pokemon.pokedexId}`,
          level: pokemon.level
        }));
        
        ws.send(JSON.stringify({
          type: 'FORCE_POKEMON_SWITCH',
          data: {
            message: `${playerPokemonName} est KO ! Choisissez un nouveau Pokémon.`,
            availablePokemons: pokemonWithNames,
            battleId: battleId
          }
        }));
        
        console.log(`[DUNGEON] ✅ FORCE_POKEMON_SWITCH sent with ${availablePokemons.length} options`);
      }, 1500); // Délai de 1.5 secondes après POKEMON_KO
      
      // NE PAS supprimer le combat ici - il sera supprimé après le changement de pokémon
    }
  } catch (error) {
    console.error('[DUNGEON] Error in handlePlayerDefeat:', error);
  }
}

async function handleChangePokemon(ws: AuthenticatedWebSocket, message: any) {
  if (!ws.trainerId) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      error: 'Non authentifié',
      code: 'UNAUTHORIZED'
    }));
    return;
  }

  try {
    const { newPokemonId, battleId } = message.data || {};
    
    if (!newPokemonId) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'ID du nouveau Pokémon requis',
        code: 'MISSING_POKEMON_ID'
      }));
      return;
    }

    if (!battleId) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'ID du combat requis',
        code: 'MISSING_BATTLE_ID'
      }));
      return;
    }

    // Vérifier que le pokémon appartient au joueur et est dans l'équipe sélectionnée
    const session = await dungeonService.getActiveSession(ws.trainerId);
    if (!session || !session.selectedPokemon || !session.selectedPokemon.includes(newPokemonId)) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        error: 'Pokémon non disponible pour ce donjon',
        code: 'POKEMON_NOT_AVAILABLE'
      }));
      return;
    }

    console.log(`[DUNGEON] ${ws.trainerId} switched to Pokemon: ${newPokemonId}`);

    // Redémarrer directement le combat avec le nouveau pokémon
    // (l'ancien combat sera automatiquement nettoyé dans handleStartFight)
    handleStartFight(ws, { data: { selectedPokemonId: newPokemonId } });

  } catch (error) {
    console.error('[DUNGEON] Error in handleChangePokemon:', error);
    ws.send(JSON.stringify({
      type: 'ERROR',
      error: `Erreur lors du changement de Pokémon: ${(error as Error).message}`,
      code: 'POKEMON_CHANGE_ERROR'
    }));
  }
}

