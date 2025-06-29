import { PROFILE_LABELS } from "../constants/profileConstants";
import type { OwnedPokemon } from "../types/Trainer";

// Cache pour les noms des Pokémon (global au module)
const pokemonNamesCache: { [key: number]: string } = {};

// Types pour l'API PokeAPI
interface PokemonName {
  language: { name: string };
  name: string;
}

interface PokemonSpecies {
  names: PokemonName[];
}

// Fonction pour récupérer le nom d'un Pokémon
export const fetchPokemonName = async (pokedexId: number): Promise<string> => {
  if (pokemonNamesCache[pokedexId]) {
    return pokemonNamesCache[pokedexId];
  }

  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${pokedexId}`
    );
    const data: PokemonSpecies = await response.json();
    const frenchName =
      data.names.find((name: PokemonName) => name.language.name === "fr")?.name ||
      data.names.find((name: PokemonName) => name.language.name === "en")?.name ||
      PROFILE_LABELS.POKEMON_FALLBACK.replace("{id}", pokedexId.toString());

    pokemonNamesCache[pokedexId] = frenchName;
    return frenchName;
  } catch {
    return PROFILE_LABELS.POKEMON_FALLBACK.replace("{id}", pokedexId.toString());
  }
};

// Fonction optimisée pour charger tous les noms en parallèle
export const loadPokemonNames = async (
  pokemonList: OwnedPokemon[]
): Promise<{ [key: number]: string }> => {
  if (!pokemonList.length) {
    return {};
  }

  try {
    // Charger tous les noms en parallèle avec Promise.all
    const namePromises = pokemonList.map(pokemon => 
      fetchPokemonName(pokemon.pokedexId)
    );
    
    const names = await Promise.all(namePromises);
    
    // Construire l'objet de mapping
    const nameMap: { [key: number]: string } = {};
    pokemonList.forEach((pokemon, index) => {
      nameMap[pokemon.pokedexId] = names[index];
    });

    return nameMap;
  } catch {
    // Fallback: retourner les noms par défaut
    const fallbackNames: { [key: number]: string } = {};
    pokemonList.forEach(pokemon => {
      fallbackNames[pokemon.pokedexId] = PROFILE_LABELS.POKEMON_FALLBACK.replace(
        "{id}", 
        pokemon.pokedexId.toString()
      );
    });
    return fallbackNames;
  }
};

// Utilitaires de formatage
export const formatters = {
  // Formater le label de niveau
  levelLabel: (level: number): string => 
    PROFILE_LABELS.LEVEL_LABEL.replace("{level}", level.toString()),
  
  // Formater la position dans l'équipe
  teamPosition: (position: number): string =>
    PROFILE_LABELS.TEAM_POSITION.replace("{position}", position.toString()),
  
  // Formater le numéro Pokédex
  pokedexNumber: (id: number): string =>
    PROFILE_LABELS.POKEDEX_NUMBER.replace("{id}", id.toString()),
  
  // Formater la taille avec unité
  height: (height: number): string => `${height}${PROFILE_LABELS.HEIGHT_UNIT}`,
  
  // Formater le poids avec unité
  weight: (weight: number): string => `${weight}${PROFILE_LABELS.WEIGHT_UNIT}`,
  
  // Formater l'expérience avec suffixe
  experience: (exp: number): string => `${exp} ${PROFILE_LABELS.XP_SUFFIX}`,
  
  // Formater le rôle utilisateur
  userRole: (isAdmin: boolean): string => 
    isAdmin ? PROFILE_LABELS.ADMIN : PROFILE_LABELS.TRAINER
};

// Utilitaires de validation
export const validators = {
  // Vérifier si l'équipe Pokémon est valide
  isValidTeam: (teamPokemon: unknown): teamPokemon is OwnedPokemon[] => {
    return Array.isArray(teamPokemon) && teamPokemon.length > 0;
  }
}; 