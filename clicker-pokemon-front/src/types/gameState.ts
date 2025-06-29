/**
 * États possibles du jeu de donjon
 */
export enum GameState {
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  WAITING_SELECTION = 'WAITING_SELECTION', // Attendre la sélection du Pokémon
  IN_BATTLE = 'IN_BATTLE', // Combat en cours
  FORCE_SWITCH = 'FORCE_SWITCH', // Changement forcé de Pokémon
  DUNGEON_COMPLETE_WIN = 'DUNGEON_COMPLETE_WIN', // Victoire
  DUNGEON_COMPLETE_LOSE = 'DUNGEON_COMPLETE_LOSE' // Défaite
}

/**
 * Actions possibles pour le reducer
 */
export enum GameAction {
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  SET_DUNGEON_READY = 'SET_DUNGEON_READY',
  START_BATTLE = 'START_BATTLE',
  FORCE_SWITCH = 'FORCE_SWITCH',
  SWITCH_COMPLETED = 'SWITCH_COMPLETED',
  COMPLETE_WIN = 'COMPLETE_WIN',
  COMPLETE_LOSE = 'COMPLETE_LOSE',
  SET_RETRYING = 'SET_RETRYING',
  RESET = 'RESET'
}

/**
 * État unifié du jeu
 */
export interface UnifiedGameState {
  currentState: GameState;
  error: string | null;
  isConnected: boolean;
  needsPokemonSwitch: boolean;
  showPokemonSelection: boolean;
  currentBattleId: string | null;
  isRetrying: boolean;
  retryCount: number;
}

/**
 * Actions du reducer
 */
export type GameStateAction =
  | { type: GameAction.SET_LOADING }
  | { type: GameAction.SET_ERROR; payload: string }
  | { type: GameAction.SET_DUNGEON_READY; payload: { isConnected: boolean } }
  | { type: GameAction.START_BATTLE }
  | { type: GameAction.FORCE_SWITCH; payload: { battleId: string } }
  | { type: GameAction.SWITCH_COMPLETED }
  | { type: GameAction.COMPLETE_WIN }
  | { type: GameAction.COMPLETE_LOSE }
  | { type: GameAction.SET_RETRYING; payload: { retryCount: number } }
  | { type: GameAction.RESET };

/**
 * État initial du jeu
 */
export const initialGameState: UnifiedGameState = {
  currentState: GameState.LOADING,
  error: null,
  isConnected: false,
  needsPokemonSwitch: false,
  showPokemonSelection: false,
  currentBattleId: null,
  isRetrying: false,
  retryCount: 0
};

/**
 * Reducer pour la gestion d'état du jeu
 */
export const gameStateReducer = (
  state: UnifiedGameState,
  action: GameStateAction
): UnifiedGameState => {
  switch (action.type) {
    case GameAction.SET_LOADING:
      return {
        ...state,
        currentState: GameState.LOADING,
        error: null
      };

    case GameAction.SET_ERROR:
      return {
        ...state,
        currentState: GameState.ERROR,
        error: action.payload,
        isConnected: false
      };

    case GameAction.SET_DUNGEON_READY:
      return {
        ...state,
        currentState: GameState.WAITING_SELECTION,
        error: null,
        isConnected: action.payload.isConnected,
        showPokemonSelection: true,
        isRetrying: false,
        retryCount: 0
      };

    case GameAction.START_BATTLE:
      return {
        ...state,
        currentState: GameState.IN_BATTLE,
        showPokemonSelection: false,
        needsPokemonSwitch: false
      };

    case GameAction.FORCE_SWITCH:
      return {
        ...state,
        currentState: GameState.FORCE_SWITCH,
        needsPokemonSwitch: true,
        currentBattleId: action.payload.battleId
      };

    case GameAction.SWITCH_COMPLETED:
      return {
        ...state,
        currentState: GameState.IN_BATTLE,
        needsPokemonSwitch: false,
        currentBattleId: null
      };

    case GameAction.COMPLETE_WIN:
      return {
        ...state,
        currentState: GameState.DUNGEON_COMPLETE_WIN,
        needsPokemonSwitch: false,
        showPokemonSelection: false
      };

    case GameAction.COMPLETE_LOSE:
      return {
        ...state,
        currentState: GameState.DUNGEON_COMPLETE_LOSE,
        needsPokemonSwitch: false,
        showPokemonSelection: false
      };

    case GameAction.SET_RETRYING:
      return {
        ...state,
        isRetrying: true,
        retryCount: action.payload.retryCount,
        error: null // Pas d'erreur pendant le retry
      };

    case GameAction.RESET:
      return initialGameState;

    default:
      return state;
  }
}; 