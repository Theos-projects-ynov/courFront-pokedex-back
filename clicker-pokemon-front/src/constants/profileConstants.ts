// Labels et constantes pour le profil
export const PROFILE_LABELS = {
  // Titres principales
  GENERAL_INFO: "Informations générales",
  PROGRESSION: "Progression",
  TEAM_POKEMON: "Équipe de combat",
  DESCRIPTION: "Description",
  
  // Champs utilisateur
  REGION: "Région",
  GENDER: "Genre", 
  HEIGHT: "Taille",
  WEIGHT: "Poids",
  LEVEL: "Niveau",
  EXPERIENCE: "Expérience",
  
  // Rôles
  ADMIN: "Administrateur",
  TRAINER: "Dresseur",
  
  // Actions
  LOGOUT: "Se déconnecter", 
  LOGGING_OUT: "Déconnexion...",
  RETRY: "Réessayer",
  
  // Erreurs
  PROFILE_ERROR: "Erreur lors du chargement du profil. Veuillez vous reconnecter.",
  LOGOUT_ERROR: "Erreur lors de la déconnexion",
  
  // Pokémon
  TEAM_POSITION: "Position #{position} de l'équipe",
  LEVEL_LABEL: "Niv. {level}",
  POKEDEX_NUMBER: "Pokédex #{id}",
  POKEMON_FALLBACK: "Pokémon #{id}",
  
  // Format
  HEIGHT_UNIT: "m",
  WEIGHT_UNIT: "kg", 
  XP_SUFFIX: "XP"
} as const;

// Configuration UI  
export const UI_CONFIG = {
  POKEMON_LIMIT_MOBILE: 4,
  POKEMON_LIMIT_DESKTOP: 6,
  MAX_TEAM_SIZE: 6,
  AVATAR_SIZE: 120,
  PROGRESS_BAR_HEIGHT: 8,
  XP_CALCULATION_BASE: 1000
} as const; 