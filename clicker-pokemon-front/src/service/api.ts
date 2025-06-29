export const BASE_URL = "https://tyradex.app/api/v1";

export interface PokemonType {
  name: string;
  image: string;
}

export interface PokemonTalent {
  name: string;
  tc: boolean;
}

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

export interface Pokemon {
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

/**
 * Récupère les Pokémon d'une génération spécifique
 * @param {number} generation - Numéro de la génération (1-9)
 * @returns {Promise<Pokemon[]>} - Liste des Pokémon de la génération
 */
export const getPokemonByGeneration = async (
  generation: number
): Promise<Pokemon[]> => {
  try {
    const response = await fetch(`${BASE_URL}/gen/${generation}`);
    if (!response.ok) {
      throw new Error(`Erreur: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des Pokémon:", error);
    return [];
  }
};

/**
 * Récupère un Pokémon spécifique par son ID
 * @param {number | string} id - ID du Pokémon dans le Pokédex
 * @returns {Promise<Pokemon | null>} - Les données du Pokémon ou null si non trouvé
 */
export const getPokemonById = async (
  id: number | string
): Promise<Pokemon | null> => {
  try {
    const response = await fetch(`${BASE_URL}/pokemon/${id}`);
    if (!response.ok) {
      throw new Error(`Erreur: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la récupération du Pokémon #${id}:`, error);
    return null;
  }
};


