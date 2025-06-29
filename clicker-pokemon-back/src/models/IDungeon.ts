import { IPokemonAdversaire } from './IPokemonAdversaire';

export interface IDungeon {
  id: number;
  name: string;
  description?: string;
  rewards: string;
  bossPokemonId: number;
  bossLevel: number;
  spawnLevels: number[]; // [15, 17, 20]
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDungeonInfo {
  dungeon: IDungeon;
  boss: IBossPokemon;
  enemies: IPokemonAdversaire[];
  dynamicRewards: IDynamicRewards;
}

export interface IBossPokemon {
  pokedexId: number;
  name: string;
  level: number;
  sprite: string;
  types: string[];
  stats: IPokemonStats;
}

export interface IDynamicRewards {
  money: number;
  items: IRewardItem[];
  experience: number;
}

export interface IRewardItem {
  name: string;
  quantity: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface IPokemonStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  specialAttack: number;
  specialDefense: number;
} 