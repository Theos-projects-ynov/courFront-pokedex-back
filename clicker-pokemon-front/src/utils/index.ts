// Barrel export pour tous les utilitaires
export * from './homeUtils';
export * from './uiHelpers';

// Exports spécifiques pour éviter les conflits
export { 
  debugLog, 
  validators, 
  formatters 
} from './profileUtils';

export { 
  fetchPokemonName, 
  replacePokemonNamesInMessage 
} from './pokemonUtils'; 