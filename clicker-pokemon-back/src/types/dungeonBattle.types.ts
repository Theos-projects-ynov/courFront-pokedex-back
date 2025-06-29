// ========== TYPES POUR LE COMBAT EN DONJON ==========

export interface IDungeonBattleState {
  status: BattleStatus;
  currentTurn: number;
  playerTeam: IBattlePokemon[];
  enemyTeam: IBattlePokemon[];
  currentPlayerPokemon: IBattlePokemon | null;
  currentEnemyPokemon: IBattlePokemon | null;
  battleLog: IBattleLogEntry[];
  isWaitingForPlayerAction: boolean;
  defeatedEnemies: number;
  totalEnemies: number;
  lastTurnResult?: ITurnResult;
  isAnimating: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}

export type BattleStatus = 
  | 'WAITING_START'      // En attente de sélection du 1er Pokémon
  | 'POKEMON_SELECTION'  // En attente de changement de Pokémon après KO
  | 'BATTLE_ACTIVE'      // Combat en cours, tour automatique
  | 'TURN_PROCESSING'    // Tour en cours de traitement (animations)
  | 'ENEMY_DEFEATED'     // Ennemi vaincu, transition vers le suivant
  | 'PLAYER_DEFEATED'    // Tous les Pokémon du joueur KO
  | 'DUNGEON_COMPLETED'  // Donjon terminé avec succès
  | 'ERROR';             // Erreur critique

export interface IBattlePokemon {
  id: string;
  pokedexId: number;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  moves: IBattleMove[];
  sprite: string;
  types: string[];
  stats: IPokemonStats;
  isActive: boolean;
  statusEffects?: IStatusEffect[];
  // États temporaires pour le donjon uniquement
  tempPP?: number[]; // PP temporaires par attaque
}

export interface IBattleMove {
  id: number;
  name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number;        // PP actuels pendant le combat
  maxPp: number;     // PP max de base
  priority: number;
  damageClass: 'physical' | 'special' | 'status';
}

export interface IPokemonStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  specialAttack: number;
  specialDefense: number;
}

export interface IStatusEffect {
  type: 'burn' | 'poison' | 'paralysis' | 'sleep' | 'freeze';
  duration: number;
}

export interface IBattleLogEntry {
  id: string;
  timestamp: number;
  type: 'attack' | 'damage' | 'ko' | 'switch' | 'status' | 'system' | 'priority';
  message: string;
  pokemonId?: string;
  damage?: number;
  isCritical?: boolean;
  moveUsed?: string;
  priority?: number;
}

export interface ITurnResult {
  turn: number;
  playerAction: IBattleAction;
  enemyAction: IBattleAction;
  priorityWinner: 'player' | 'enemy' | 'simultaneous';
  totalDamageDealt: number;
  totalDamageReceived: number;
}

export interface IBattleAction {
  pokemonId: string;
  pokemonName: string;
  moveUsed: string;
  moveId: number;
  target: string;
  damage: number;
  isCritical: boolean;
  effectiveness: 'not_very_effective' | 'normal' | 'super_effective';
  remainingHp: number;
  remainingPp: number;
  priority: number;
  missedAttack: boolean;
}

// ========== MESSAGES WEBSOCKET POUR LE COMBAT ==========

// Messages envoyés au serveur
export interface IStartFightMessage {
  type: 'START_FIGHT';
  data: {
    selectedPokemonId: string;
  };
}

export interface IChangePokemonMessage {
  type: 'CHANGE_POKEMON';
  data: {
    newPokemonId: string;
  };
}

// Messages reçus du serveur
export interface IBattleStartedMessage {
  type: 'BATTLE_STARTED';
  data: {
    playerPokemon: IBattlePokemon;
    enemyPokemon: IBattlePokemon;
    battleId: string;
    enemyNumber: number; // 1/4, 2/4, etc.
    totalEnemies: number;
  };
}

export interface ITurnCompletedMessage {
  type: 'TURN_COMPLETED';
  data: {
    turn: number;
    playerAction: IBattleAction;
    enemyAction: IBattleAction;
    priorityOrder: ('player' | 'enemy')[];
    playerPokemon: IBattlePokemon;
    enemyPokemon: IBattlePokemon;
    battleContinues: boolean;
  };
}

export interface IPokemonKoMessage {
  type: 'POKEMON_KO';
  data: {
    koedPokemonId: string;
    koedPokemonName: string;
    isPlayer: boolean;
    availablePokemon?: IBattlePokemon[]; // Si c'est le joueur qui a un KO
    forceSelection: boolean; // true si le joueur DOIT choisir un nouveau Pokémon
  };
}

export interface IEnemyDefeatedMessage {
  type: 'ENEMY_DEFEATED';
  data: {
    defeatedEnemyName: string;
    defeatedEnemies: number;
    totalEnemies: number;
    nextEnemy?: IBattlePokemon;
    isLastEnemy: boolean;
    transitionDelay: number; // délai avant le prochain combat en ms
  };
}

export interface IDungeonCompletedMessage {
  type: 'DUNGEON_COMPLETED';
  data: {
    rewards: {
      money: number;
      experience: number;
      items: Array<{name: string; quantity: number}>;
    };
    defeatedEnemies: number;
    survivingPokemon: number;
    totalTurns: number;
  };
}

export interface IBattleErrorMessage {
  type: 'BATTLE_ERROR';
  data: {
    code: 'POKEMON_NOT_FOUND' | 'INVALID_ACTION' | 'CONNECTION_LOST' | 'SERVER_ERROR';
    message: string;
    recoverable: boolean;
    suggestedAction?: string;
  };
}

// ========== TYPES POUR L'UI ==========

export interface IBattleUIState {
  showPokemonSelection: boolean;
  showDamageAnimation: boolean;
  showTurnTransition: boolean;
  damageNumbers: IDamageNumber[];
  currentAnimation: 'idle' | 'attack' | 'damage' | 'ko' | 'switch';
  soundEffects: ISoundEffect[];
}

export interface IDamageNumber {
  id: string;
  damage: number;
  isCritical: boolean;
  effectiveness: 'not_very_effective' | 'normal' | 'super_effective';
  position: { x: number; y: number };
  timestamp: number;
}

export interface ISoundEffect {
  id: string;
  type: 'attack' | 'damage' | 'ko' | 'switch' | 'critical';
  timestamp: number;
}

// ========== TYPES POUR LA GESTION D'ERREURS ==========

export interface IBattleError {
  id: string;
  type: 'connection' | 'sync' | 'server' | 'client';
  message: string;
  timestamp: number;
  recoverable: boolean;
  retryCount: number;
} 