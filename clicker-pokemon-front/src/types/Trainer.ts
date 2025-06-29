import { IPokemon } from "./Pokemon";

export type ITrainer = {
  name: string;
  age: number;

  pokemonStarter?: IPokemon;
  pokemons?: IPokemon[];
  teamPokemon?: IPokemon[];

  badge?: string[];
  region: string;
  money: number | 0;
  level: number | 0;
  exp: number | 0;

  gender: "Homme" | "Femme" | "Autre";
  height: number;
  weight: number;
  description: string;
  image: string;
};

// Types pour les mouvements Pokémon
export interface PokemonMove {
  name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  damageClass: string;
}

export interface PokemonOwnedMove {
  id: string;
  moveId: number;
  move: PokemonMove;
}

// Type pour les Pokémon possédés par le trainer
export interface OwnedPokemon {
  id: string;
  pokedexId: number;
  boostAtk: number;
  boostDef: number;
  boostRes: number;
  boostPv: number;
  level: number;
  genre: string;
  createdAt: string;
  pokemonOwnedMoves: PokemonOwnedMove[];
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  region: string;
  level: number;
  exp: number;
  gender: string;
  height: number;
  weight: number;
  description: string;
  image: string;
  badge: string[];
  pokemonStarter: unknown | null;
  teamPokemon: unknown | null;
  isAdmin: boolean;
  createdAt: string;
  pokemons: OwnedPokemon[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  age: number;
  region: string;
  gender: "Homme" | "Femme" | "Autre";
  height: number;
  weight: number;
  description: string;
  image: string;
}

export interface AuthResponse {
  token: string;
  trainer: Trainer;
}
