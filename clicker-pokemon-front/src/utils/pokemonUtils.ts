import type { PokemonNames } from '../types/Dungeon';

/**
 * Récupère le nom français d'un Pokémon via PokeAPI
 */
export const fetchPokemonName = async (pokedexId: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${pokedexId}`
    );
    const data = await response.json();
    const frenchName =
      data.names.find(
        (name: { language: { name: string }; name: string }) =>
          name.language.name === 'fr'
      )?.name ||
      data.names.find(
        (name: { language: { name: string }; name: string }) =>
          name.language.name === 'en'
      )?.name ||
      `Pokémon #${pokedexId}`;

    return frenchName;
  } catch (error) {
    console.error(
      `Erreur lors de la récupération du nom pour ${pokedexId}:`,
      error
    );
    return `Pokémon #${pokedexId}`;
  }
};

/**
 * Remplace les noms génériques par les vrais noms dans un message
 */
export const replacePokemonNamesInMessage = (
  message: string,
  pokemonNames: PokemonNames
): string => {
  let updatedMessage = message;

  // Remplacer les noms génériques du type "Pokémon 1", "Pokémon 144", etc.
  Object.entries(pokemonNames).forEach(([pokedexId, realName]) => {
    const genericPattern = new RegExp(`Pokémon ${pokedexId}(?!\\d)`, 'g');
    updatedMessage = updatedMessage.replace(genericPattern, realName);
  });

  return updatedMessage;
}; 