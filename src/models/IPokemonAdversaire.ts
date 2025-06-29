export interface IPokemonAdversaire {
  id: string; // ID temporaire généré pour ce combat
  pokedexId: number;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  stats: IPokemonStats;
  moves: IPokemonMove[];
  sprite: string;
  types: string[];
  genre: 'male' | 'female' | 'unknown';
  isShiny: boolean;
}

export interface IPokemonMove {
  id: number;
  name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  maxPp: number;
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