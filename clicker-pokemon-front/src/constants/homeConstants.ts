// Messages d'erreur et d'état
export const HOME_MESSAGES = {
  LOADING: "Chargement de la génération",
  ERROR: "Problème de chargement de la génération",
  RETRY: "Réessayer",
  NO_POKEMON: "Aucun Pokémon trouvé pour cette génération",
} as const;

// Configuration de l'UI
export const HOME_CONFIG = {
  MIN_GENERATION: 1,
  MAX_GENERATION: 9,
  DEFAULT_SKELETON_COUNT: 20,
  TITLE_PREFIX: "PokéDex - Génération",
} as const; 