import prisma from '../config/db';
import { getTyradexPokemonById } from '../api/tyradex';
import { IBattlePokemon, IBattleMove, IBattleState, IBattleResult, ITeamSelection } from '../models/IBattle';

const activeBattles = new Map<string, IBattleState>();

// Conversion OwnedPokemon vers BattlePokemon
export async function convertToBattlePokemon(ownedPokemon: any, isPlayer: boolean = true): Promise<IBattlePokemon> {
  const tyradexData = await getTyradexPokemonById(ownedPokemon.pokedexId);
  
  // Calcul des stats avec level + boosts
  const baseHp = tyradexData.stats.hp;
  const baseAtk = tyradexData.stats.atk;
  const baseDef = tyradexData.stats.def;
  const baseSpeed = tyradexData.stats.vit;
  
  const level = ownedPokemon.level || 1;
  const hpBoost = ownedPokemon.boostPv || 0;
  const atkBoost = ownedPokemon.boostAtk || 0;
  const defBoost = ownedPokemon.boostDef || 0;
  
  // Formule simplifiée de calcul des stats
  const maxHp = Math.floor(((2 * baseHp + hpBoost) * level) / 100) + level + 10;
  const attack = Math.floor(((2 * baseAtk + atkBoost) * level) / 100) + 5;
  const defense = Math.floor(((2 * baseDef + defBoost) * level) / 100) + 5;
  const speed = Math.floor(((2 * baseSpeed) * level) / 100) + 5;

  // Récupérer les moves du Pokémon
  const moves: IBattleMove[] = [];
  if (ownedPokemon.pokemonOwnedMoves) {
    for (const ownedMove of ownedPokemon.pokemonOwnedMoves) {
      moves.push({
        id: ownedMove.move.id,
        name: ownedMove.move.name,
        type: ownedMove.move.type,
        power: ownedMove.move.power,
        accuracy: ownedMove.move.accuracy,
        pp: ownedMove.move.pp || 10,
        maxPp: ownedMove.move.pp || 10,
        priority: ownedMove.move.priority || 0,
        damageClass: ownedMove.move.damageClass
      });
    }
  }

  return {
    id: ownedPokemon.id,
    pokedexId: ownedPokemon.pokedexId,
    name: tyradexData.name.fr,
    level,
    hp: maxHp,
    maxHp,
    attack,
    defense,
    speed,
    moves,
    isPlayer
  };
}

// Générer un Pokémon IA aléatoire
export async function generateAiPokemon(level: number = 20): Promise<IBattlePokemon> {
  const randomPokedexId = Math.floor(Math.random() * 151) + 1; // Gen 1 pour l'instant
  
  const tyradexData = await getTyradexPokemonById(randomPokedexId);
  
  // Stats calculées pour l'IA
  const baseHp = tyradexData.stats.hp;
  const baseAtk = tyradexData.stats.atk;
  const baseDef = tyradexData.stats.def;
  const baseSpeed = tyradexData.stats.vit;
  
  const maxHp = Math.floor(((2 * baseHp) * level) / 100) + level + 10;
  const attack = Math.floor(((2 * baseAtk) * level) / 100) + 5;
  const defense = Math.floor(((2 * baseDef) * level) / 100) + 5;
  const speed = Math.floor(((2 * baseSpeed) * level) / 100) + 5;

  // Moves basiques pour l'IA (on pourrait améliorer)
  const moves: IBattleMove[] = [
    {
      id: 1,
      name: "Charge",
      type: "normal",
      power: 40,
      accuracy: 100,
      pp: 35,
      maxPp: 35,
      priority: 0,
      damageClass: "physical"
    }
  ];

  return {
    id: `ai_${randomPokedexId}_${Date.now()}`,
    pokedexId: randomPokedexId,
    name: tyradexData.name.fr,
    level,
    hp: maxHp,
    maxHp,
    attack,
    defense,
    speed,
    moves,
    isPlayer: false
  };
}

// Générer le boss final du donjon
export async function generateBossPokemon(dungeonId: number): Promise<IBattlePokemon> {
  const bossPokedexIds: { [key: number]: number } = {
    1: 150, // Mewtwo
    2: 151, // Mew
    3: 144, // Articuno
    // etc...
  };
  
  const bossId = bossPokedexIds[dungeonId] || 150; // Mewtwo par défaut
  
  const tyradexData = await getTyradexPokemonById(bossId);
  const level = 50;
  
  const baseHp = tyradexData.stats.hp;
  const baseAtk = tyradexData.stats.atk;
  const baseDef = tyradexData.stats.def;
  const baseSpeed = tyradexData.stats.vit;
  
  const maxHp = Math.floor(((2 * baseHp) * level) / 100) + level + 10;
  const attack = Math.floor(((2 * baseAtk) * level) / 100) + 5;
  const defense = Math.floor(((2 * baseDef) * level) / 100) + 5;
  const speed = Math.floor(((2 * baseSpeed) * level) / 100) + 5;

  const moves: IBattleMove[] = [
    {
      id: 94,
      name: "Psycho",
      type: "psychic",
      power: 90,
      accuracy: 100,
      pp: 10,
      maxPp: 10,
      priority: 0,
      damageClass: "special"
    },
    {
      id: 85,
      name: "Fatal-Foudre",
      type: "electric",
      power: 110,
      accuracy: 70,
      pp: 10,
      maxPp: 10,
      priority: 0,
      damageClass: "special"
    }
  ];

  return {
    id: `boss_${bossId}_${Date.now()}`,
    pokedexId: bossId,
    name: tyradexData.name.fr,
    level,
    hp: maxHp,
    maxHp,
    attack,
    defense,
    speed,
    moves,
    isPlayer: false
  };
}

// Créer une nouvelle bataille
export async function createBattle(teamSelection: ITeamSelection): Promise<IBattleState> {
  const battleId = `battle_${Date.now()}`;
  
  // Récupérer les Pokémon du joueur
  const playerPokemons = await prisma.ownedPokemon.findMany({
    where: {
      id: { in: teamSelection.selectedPokemonIds },
      trainerId: teamSelection.trainerId
    },
    include: {
      pokemonOwnedMoves: {
        include: {
          move: true
        }
      }
    }
  });

  if (playerPokemons.length !== 4) {
    throw new Error("Il faut exactement 4 Pokémon pour commencer un combat");
  }

  const playerTeam: IBattlePokemon[] = [];
  for (const pokemon of playerPokemons) {
    const battlePokemon = await convertToBattlePokemon(pokemon, true);
    playerTeam.push(battlePokemon);
  }

  // Générer l'équipe IA (3 pokémon + 1 boss)
  const aiTeam: IBattlePokemon[] = [];
  for (let i = 0; i < 3; i++) {
    const aiPokemon = await generateAiPokemon(Math.floor(Math.random() * 30) + 10);
    aiTeam.push(aiPokemon);
  }
  
  // Ajouter le boss si donjon spécifié
  if (teamSelection.dungeonId) {
    const boss = await generateBossPokemon(teamSelection.dungeonId);
    aiTeam.push(boss);
  }

  const battleState: IBattleState = {
    battleId,
    trainerId: teamSelection.trainerId,
    dungeonId: teamSelection.dungeonId,
    playerTeam,
    aiTeam,
    currentPlayerPokemon: playerTeam[0],
    currentAiPokemon: aiTeam[0],
    turn: 0,
    phase: 'SELECTION',
    aiDefeatedCount: 0
  };

  activeBattles.set(battleId, battleState);
  return battleState;
}

// Calculer les dégâts
export function calculateDamage(attacker: IBattlePokemon, defender: IBattlePokemon, move: IBattleMove): number {
  if (!move.power) return 0;
  
  // Formule simplifiée de Pokémon
  const level = attacker.level;
  const power = move.power;
  const attack = attacker.attack;
  const defense = defender.defense;
  
  // Multiplicateur de type (simplifié, on pourrait ajouter un vrai système)
  const typeMultiplier = 1.0;
  
  // Variation aléatoire (85% à 100%)
  const randomFactor = (Math.random() * 0.15) + 0.85;
  
  const damage = Math.floor(
    ((((2 * level + 10) / 250) * (attack / defense) * power) + 2) * 
    typeMultiplier * 
    randomFactor
  );
  
  return Math.max(1, damage); // Au moins 1 dégât
}

// Exécuter une attaque
export function executeAttack(attacker: IBattlePokemon, defender: IBattlePokemon, move: IBattleMove): IBattleResult {
  // Vérifier la précision
  const accuracy = move.accuracy || 100;
  const hitChance = Math.random() * 100;
  
  if (hitChance > accuracy) {
    return {
      damage: 0,
      attacker,
      defender,
      move,
      isKO: false,
      message: `${attacker.name} utilise ${move.name} mais ça rate !`
    };
  }

  // Calculer les dégâts
  const damage = calculateDamage(attacker, defender, move);
  defender.hp = Math.max(0, defender.hp - damage);
  
  // Réduire les PP
  move.pp = Math.max(0, move.pp - 1);
  
  const isKO = defender.hp === 0;
  
  return {
    damage,
    attacker,
    defender,
    move,
    isKO,
    message: `${attacker.name} utilise ${move.name} et inflige ${damage} dégâts à ${defender.name} !`
  };
}

// Sélectionner une attaque aléatoire pour l'IA
export function selectAiMove(aiPokemon: IBattlePokemon): IBattleMove {
  const availableMoves = aiPokemon.moves.filter(move => move.pp > 0);
  
  if (availableMoves.length === 0) {
    // Attaque buggée
    return {
      id: -1,
      name: "Attaque Buggée",
      type: "normal",
      power: 10,
      accuracy: 100,
      pp: 1,
      maxPp: 1,
      priority: 0,
      damageClass: "physical"
    };
  }
  
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

export function getBattle(battleId: string): IBattleState | undefined {
  return activeBattles.get(battleId);
}

export function updateBattle(battleState: IBattleState): void {
  activeBattles.set(battleState.battleId, battleState);
}

export function deleteBattle(battleId: string): void {
  activeBattles.delete(battleId);
} 