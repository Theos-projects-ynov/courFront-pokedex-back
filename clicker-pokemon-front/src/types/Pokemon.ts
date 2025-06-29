export interface PokemonName {
  fr: string;
  en: string;
  jp: string;
}

export interface PokemonSprites {
  regular: string;
  shiny: string;
  gmax: string | null;
}

export interface PokemonType {
    name: string;
    image: string;
}

export interface PokemonTalent {
  name: string;
  tc: boolean;
}

export interface PokemonStats {
        hp: number;
  atk: number;
  def: number;
  spe_atk: number;
  spe_def: number;
  vit: number;
}

export interface PokemonResistance {
  name: string;
  multiplier: number;
}

export interface PokemonEvolution {
  pokedex_id: number;
  name: string;
  condition: string;
}

export interface PokemonEvolutionChain {
  pre: PokemonEvolution | null;
  next: PokemonEvolution[] | null;
  mega: PokemonEvolution[] | null;
}

export interface PokemonSexe {
  male: number;
  female: number;
}

export interface PokemonForme {
  name: string;
  [key: string]: unknown;
}

export interface IPokemon {
  pokedex_id: number;
  generation: number;
  category: string;
  name: PokemonName;
  sprites: PokemonSprites;
  types: PokemonType[];
  talents: PokemonTalent[];
  stats: PokemonStats;
  resistances: PokemonResistance[];
  evolution: PokemonEvolutionChain;
    height: string;
    weight: string;
  egg_groups: string[];
  sexe: PokemonSexe;
  catch_rate: number;
  level_100: number;
  formes: PokemonForme[] | null;
}
