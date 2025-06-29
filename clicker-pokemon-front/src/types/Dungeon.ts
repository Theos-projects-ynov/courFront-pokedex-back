export interface Dungeon {
  id: number;
  name: string;
  difficulty: number;
  type: string;
  rewards: string[];
}

export interface Enemy {
  id: string;
  pokedexId: number;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  sprite: string;
  types: string[];
  moves: Array<{
    id: number;
    name: string;
    power: number | null;
    type: string;
  }>;
}

export interface Boss {
  pokedexId: number;
  name: string;
  level: number;
  sprite: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number | null;
    specialAttack: number | null;
    specialDefense: number | null;
  };
}

export interface DungeonSession {
  id: string;
  status: string;
  selectedPokemon: string[];
  defeatedEnemies: number;
}

export interface DungeonState {
  trainerId: string;
  session: DungeonSession;
  dungeonInfo: {
    id: number;
    name: string;
    description: string;
    rewards: string;
    bossLevel: number;
    spawnLevels: number[];
  };
  playerTeam: Array<{
    id: string;
    pokedexId: number;
    name: string;
    level: number;
    genre: string;
    sprite: string;
    types: string[];
    stats: {
      hp: number;
      maxHp: number;
      attack: number;
      defense: number;
      speed: number;
    };
    boosts: {
      atk: number;
      def: number;
      res: number;
      pv: number;
    };
  }>;
  enemies: Enemy[];
  boss: Boss;
  rewards: {
    money: number;
    experience: number;
    items: Array<{
      name: string;
      quantity: number;
      rarity: string;
    }>;
  };
  message: string;
  nextAction: string;
  sessionReset?: boolean;
}

export interface AttackResult {
  turn: number;
  attacker: {
    id: string;
    name: string;
    isPlayer: boolean;
  };
  defender: {
    id: string;
    name: string;
    isPlayer: boolean;
  };
  move: {
    id: number;
    name: string;
    power: number;
    accuracy: number;
    pp: number;
    priority: number;
  };
  damage: number;
  isCritical: boolean;
  remainingHp: number;
  maxHp: number;
  message: string;
}

export interface PokemonKO {
  koedPokemon: {
    id: string;
    name: string;
    isPlayer: boolean;
  };
  winner: {
    id: string;
    name: string;
    isPlayer: boolean;
  };
  message: string;
}

export interface EnemyDefeated {
  message: string;
  defeatedEnemies: number;
  totalEnemies: number;
  nextBattleDelay: number;
}

export interface AvailablePokemon {
  id: string;
  pokedexId: number;
  name: string;
  level: number;
}

export interface ForcePokemonSwitch {
  message: string;
  availablePokemons: AvailablePokemon[];
  battleId: string;
}

export interface DungeonCompletion {
  isWin: boolean;
  message: string;
  rewards?: {
    money: number;
    experience: number;
    items: Array<{
      name: string;
      quantity: number;
      rarity: string;
    }>;
  };
}

// Types pour les composants
export interface PlayerTeam {
  id: string;
  pokedexId: number;
  name: string;
  level: number;
  genre: string;
  sprite: string;
  types: string[];
  stats: {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  boosts: {
    atk: number;
    def: number;
    res: number;
    pv: number;
  };
}

export interface PokemonNames {
  [key: number]: string;
}

export interface CurrentHp {
  [key: string]: number;
}

export interface MaxHp {
  [key: string]: number;
} 