import { useMemo } from 'react';
import { GameState, type UnifiedGameState } from '../types/gameState';
import type { DungeonState } from '../types/Dungeon';
import { DUNGEON_MESSAGES } from '../constants/dungeonConstants';

/**
 * Hook pour optimiser les calculs de rendu basés sur l'état du jeu
 */
export const useGameStateHelpers = (gameState: UnifiedGameState, dungeonState: DungeonState | null) => {
  const uiState = useMemo(() => ({
    isLoading: gameState.currentState === GameState.LOADING,
    hasError: gameState.currentState === GameState.ERROR,
    isWaitingForBattle: gameState.currentState === GameState.WAITING_SELECTION && 
                        dungeonState?.nextAction === DUNGEON_MESSAGES.READY_FOR_FIRST_BATTLE,
    isInBattle: gameState.currentState === GameState.IN_BATTLE,
    needsForceSwitch: gameState.currentState === GameState.FORCE_SWITCH,
    isCompleted: gameState.currentState === GameState.DUNGEON_COMPLETE_WIN || 
                 gameState.currentState === GameState.DUNGEON_COMPLETE_LOSE,
    showSelection: gameState.showPokemonSelection || gameState.currentState === GameState.WAITING_SELECTION
  }), [gameState, dungeonState]);

  const errorHelpers = useMemo(() => ({
    getErrorMessage: (error: string | null): string => {
      if (!error) return 'Une erreur inconnue est survenue';
      
      // Personnaliser les messages d'erreur selon le type
      switch (error) {
        case DUNGEON_MESSAGES.CONNECTION_ERROR:
          return 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
        case DUNGEON_MESSAGES.AUTH_ERROR:
          return 'Votre session a expiré. Veuillez vous reconnecter.';
        case DUNGEON_MESSAGES.ENTER_ERROR:
          return 'Erreur lors de l\'entrée dans le donjon. Réessayez.';
        default:
          return error;
      }
    },
    getSeverity: (error: string | null): 'error' | 'warning' => {
      if (error === DUNGEON_MESSAGES.AUTH_ERROR) return 'warning';
      return 'error';
    }
  }), []);

  return {
    uiState,
    errorHelpers
  };
};

/**
 * Utilitaire pour formater les messages d'état du donjon
 */
export const formatDungeonStatus = (defeatedEnemies: number, totalEnemies: number = 3): string => {
  if (defeatedEnemies >= totalEnemies) {
    return `Boss en approche ! (${defeatedEnemies}/${totalEnemies} ennemis vaincus)`;
  }
  return `Ennemis vaincus: ${defeatedEnemies}/${totalEnemies} avant le boss`;
};

/**
 * Vérification des données requises pour le donjon
 */
export const validateDungeonData = (selectedPokemon: unknown, dungeon: unknown): {
  isValid: boolean;
  error?: string;
} => {
  if (!selectedPokemon || !Array.isArray(selectedPokemon)) {
    return { isValid: false, error: 'Aucun Pokémon sélectionné' };
  }
  
  if (selectedPokemon.length === 0) {
    return { isValid: false, error: 'Vous devez sélectionner au moins un Pokémon' };
  }
  
  if (!dungeon) {
    return { isValid: false, error: 'Aucun donjon sélectionné' };
  }
  
  return { isValid: true };
}; 