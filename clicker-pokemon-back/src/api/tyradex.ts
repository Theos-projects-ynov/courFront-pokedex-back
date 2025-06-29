import axios from 'axios';

const TYRADEX_BASE_URL = 'https://tyradex.app/api/v1';

// Interfaces pour typer les réponses Tyradex
export interface TyradexType {
  name: string;
  image: string;
}

export interface TyradexTalent {
  name: string;
  tc: boolean;
}

export interface TyradexStats {
  hp: number;
  atk: number;
  def: number;
  spe_atk: number;
  spe_def: number;
  vit: number;
}

export interface TyradexResistance {
  name: string;
  multiplier: number;
}

export interface TyradexEvolution {
  pokedex_id: number;
  name: string;
  condition: string;
}

export interface TyradexSexe {
  male: number;
  female: number;
}

export interface TyradexPokemon {
  pokedex_id: number;
  generation: number;
  category: string;
  name: {
    fr: string;
    en: string;
    jp: string;
  };
  sprites: {
    regular: string;
    shiny: string;
    gmax: string | null;
  };
  types: TyradexType[];
  talents: TyradexTalent[];
  stats: TyradexStats;
  resistances: TyradexResistance[];
  evolution: {
    pre: TyradexEvolution | null;
    next: TyradexEvolution[];
    mega: any | null;
  };
  height: string;
  weight: string;
  egg_groups: string[];
  sexe: TyradexSexe;
  catch_rate: number;
  level_100: number;
  formes: any | null;
}

// Récupérer les infos d'un Pokémon par nom (français) ou ID
export async function getPokemonByNameOrId(nameOrId: string | number): Promise<TyradexPokemon> {
  const url = `${TYRADEX_BASE_URL}/pokemon/${nameOrId}`;
  const res = await axios.get(url);
  return res.data;
}

// Fonction spécifique pour récupérer un Pokémon par ID avec gestion d'erreur
export async function getTyradexPokemonById(pokedexId: number): Promise<TyradexPokemon> {
  try {
    console.log(`[TYRADEX] Fetching pokemon with ID: ${pokedexId}`);
    const pokemon = await getPokemonByNameOrId(pokedexId);
    console.log(`[TYRADEX] Successfully fetched: ${pokemon.name.fr} (${pokemon.name.en})`);
    return pokemon;
  } catch (error) {
    console.error(`[TYRADEX] Error fetching pokemon ${pokedexId}:`, error);
    throw new Error(`Impossible de récupérer le Pokémon avec l'ID ${pokedexId} depuis Tyradex`);
  }
}

// Exemple d'autres endpoints Tyradex si besoin : 
// - https://tyradex.app/api/v1/pokemon
// - https://tyradex.app/api/v1/types
