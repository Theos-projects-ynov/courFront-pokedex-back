export interface IBattlePokemon {
  id: string; 
  pokedexId: number;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  moves: IBattleMove[];
  isPlayer: boolean;
}

export interface IBattleMove {
  id: number;
  name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  maxPp: number;
  priority: number;
  damageClass: string;
}

export interface IBattleState {
  battleId: string;
  trainerId: string;
  dungeonId?: number;
  playerTeam: IBattlePokemon[];
  aiTeam: IBattlePokemon[];
  currentPlayerPokemon: IBattlePokemon;
  currentAiPokemon: IBattlePokemon;
  turn: number;
  phase: 'SELECTION' | 'ATTACK' | 'SWITCH' | 'VICTORY' | 'DEFEAT';
  aiDefeatedCount: number; 
}

export interface IBattleAction {
  type: 'ATTACK' | 'SWITCH' | 'START_BATTLE' | 'SELECT_TEAM';
  pokemonId?: string;
  moveId?: number;
  targetId?: string;
}

export interface IBattleResult {
  damage: number;
  attacker: IBattlePokemon;
  defender: IBattlePokemon;
  move: IBattleMove;
  isKO: boolean;
  message: string;
}

export interface ITeamSelection {
  trainerId: string;
  selectedPokemonIds: string[];
  dungeonId?: number;
} 