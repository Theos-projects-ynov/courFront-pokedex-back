import { IPokemon } from "./IPokemon";

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
