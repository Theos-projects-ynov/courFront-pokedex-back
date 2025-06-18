import { IOwnedPokemon } from "./IOwnedPokemon";

export type ITrainer = {
  name: string;
  age: number;
  pokemonStarter?: IOwnedPokemon;
  pokemons?: IOwnedPokemon[];
  teamPokemon?: IOwnedPokemon[];
  badge?: string[];
  region: string;
  money: number | 0;
  level: number | 0;
  exp: number | 0;
  gender: "Homme" | "Femme" | "Autre";
  isAdmin: boolean;
  height: number;
  weight: number;
  description: string;
  image: string;
};
