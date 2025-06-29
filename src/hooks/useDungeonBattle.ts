import { useState, useCallback, useRef, useEffect } from 'react';
import {
    IDungeonBattleState, IBattlePokemon,
    IBattleLogEntry, IPokemonKoMessage,
    IEnemyDefeatedMessage,
    IDungeonCompletedMessage,
    IBattleErrorMessage,
    IBattleUIState,
    IBattleError,
    ITurnCompletedMessage
} from '../types/dungeonBattle.types';

interface UseDungeonBattleProps {
  webSocket: WebSocket | null;
  onBattleEnd: (result: 'victory' | 'defeat', rewards?: any) => void;
  onError: (error: string) => void;
  onConnectionChange?: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
}

export const useDungeonBattle = ({ 
  webSocket, 
  onBattleEnd, 
  onError, 
  onConnectionChange 
}: UseDungeonBattleProps) => {
  
  // ========== ÉTAT PRINCIPAL ==========
  const [battleState, setBattleState] = useState<IDungeonBattleState>({
    status: 'WAITING_START',
    currentTurn: 0,
    playerTeam: [],
    enemyTeam: [],
    currentPlayerPokemon: null,
    currentEnemyPokemon: null,
    battleLog: [],
    isWaitingForPlayerAction: false,
    defeatedEnemies: 0,
    totalEnemies: 4,
    isAnimating: false,
    connectionStatus: 'disconnected'
  });

  // ========== ÉTAT UI ==========
  const [uiState, setUIState] = useState<IBattleUIState>({
    showPokemonSelection: false,
    showDamageAnimation: false,
    showTurnTransition: false,
    damageNumbers: [],
    currentAnimation: 'idle',
    soundEffects: []
  });

  // ========== GESTION D'ERREURS ==========
  const [errors, setErrors] = useState<IBattleError[]>([]);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  // ========== REFS POUR ÉVITER LES RE-RENDERS ==========
  const battleStateRef = useRef(battleState);
  battleStateRef.current = battleState;

  // ========== ACTIONS WEBSOCKET ==========
  const startFight = useCallback((selectedPokemonId: string) => {
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
      addError('connection', 'Connexion WebSocket fermée', true);
      return;
    }

    console.log('[BATTLE] Starting fight with Pokemon:', selectedPokemonId);
    
    webSocket.send(JSON.stringify({
      type: 'START_FIGHT',
      data: { selectedPokemonId }
    }));

    setBattleState(prev => ({
      ...prev,
      status: 'BATTLE_ACTIVE',
      isWaitingForPlayerAction: false
    }));

    setUIState(prev => ({
      ...prev,
      showPokemonSelection: false,
      currentAnimation: 'idle'
    }));
  }, [webSocket]);

  const changePokemon = useCallback((newPokemonId: string) => {
    if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
      addError('connection', 'Connexion WebSocket fermée', true);
      return;
    }

    console.log('[BATTLE] Changing to Pokemon:', newPokemonId);

    webSocket.send(JSON.stringify({
      type: 'CHANGE_POKEMON',
      data: { newPokemonId }
    }));

    setBattleState(prev => ({
      ...prev,
      status: 'BATTLE_ACTIVE',
      isWaitingForPlayerAction: false
    }));

    setUIState(prev => ({
      ...prev,
      showPokemonSelection: false,
      currentAnimation: 'switch'
    }));

    addLogEntry({
      type: 'switch',
      message: `Changement de Pokémon en cours...`
    });
  }, [webSocket]);

  // ========== GESTION DES LOGS ==========
  const addLogEntry = useCallback((entry: Omit<IBattleLogEntry, 'id' | 'timestamp'>) => {
    const logEntry: IBattleLogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: Date.now()
    };

    setBattleState(prev => ({
      ...prev,
      battleLog: [...prev.battleLog.slice(-19), logEntry] // Garder max 20 entrées
    }));
  }, []);

  // ========== GESTION D'ERREURS ==========
  const addError = useCallback((
    type: IBattleError['type'], 
    message: string, 
    recoverable: boolean
  ) => {
    const error: IBattleError = {
      id: `error_${Date.now()}`,
      type,
      message,
      timestamp: Date.now(),
      recoverable,
      retryCount: 0
    };

    setErrors(prev => [...prev.slice(-4), error]); // Garder max 5 erreurs
    onError(message);

    if (!recoverable) {
      setBattleState(prev => ({
        ...prev,
        status: 'ERROR'
      }));
    }
  }, [onError]);

  // ========== ANIMATIONS ET EFFETS ==========
  const triggerDamageAnimation = useCallback((damage: number, isCritical: boolean, effectiveness: string, isPlayer: boolean) => {
    const damageNumber = {
      id: `damage_${Date.now()}`,
      damage,
      isCritical,
      effectiveness: effectiveness as 'not_very_effective' | 'normal' | 'super_effective',
      position: { 
        x: isPlayer ? 200 : 600, // Position approximative
        y: isPlayer ? 300 : 200 
      },
      timestamp: Date.now()
    };

    setUIState(prev => ({
      ...prev,
      damageNumbers: [...prev.damageNumbers, damageNumber],
      showDamageAnimation: true
    }));

    // Nettoyer l'animation après 2 secondes
    setTimeout(() => {
      setUIState(prev => ({
        ...prev,
        damageNumbers: prev.damageNumbers.filter(d => d.id !== damageNumber.id)
      }));
    }, 2000);
  }, []);

  // ========== HANDLERS DES MESSAGES WEBSOCKET ==========
  const handleBattleStarted = useCallback((data: any) => {
    const { playerPokemon, enemyPokemon, enemyNumber, totalEnemies } = data;
    
    console.log('[BATTLE] Battle started:', { playerPokemon, enemyPokemon, enemyNumber });

    setBattleState(prev => ({
      ...prev,
      currentPlayerPokemon: playerPokemon,
      currentEnemyPokemon: enemyPokemon,
      totalEnemies,
      status: 'BATTLE_ACTIVE',
      isAnimating: false
    }));

    addLogEntry({
      type: 'system',
      message: `Combat ${enemyNumber}/${totalEnemies} : ${enemyPokemon.name} niveau ${enemyPokemon.level} apparaît !`
    });
  }, [addLogEntry]);

  const handleTurnCompleted = useCallback((message: ITurnCompletedMessage) => {
    const { turn, playerAction, enemyAction, priorityOrder, playerPokemon, enemyPokemon } = message.data;

    console.log('[BATTLE] Turn completed:', { turn, playerAction, enemyAction, priorityOrder });

    setBattleState(prev => ({
      ...prev,
      currentTurn: turn,
      currentPlayerPokemon: playerPokemon,
      currentEnemyPokemon: enemyPokemon,
      status: 'TURN_PROCESSING',
      isAnimating: true,
      lastTurnResult: {
        turn,
        playerAction,
        enemyAction,
        priorityWinner: priorityOrder[0] === 'player' ? 'player' : 'enemy',
        totalDamageDealt: playerAction.damage,
        totalDamageReceived: enemyAction.damage
      }
    }));

    // Traitement des actions selon la priorité
    priorityOrder.forEach((attacker, index) => {
      setTimeout(() => {
        const action = attacker === 'player' ? playerAction : enemyAction;
        const isPlayerAttacking = attacker === 'player';

        // Log de l'attaque
        addLogEntry({
          type: 'attack',
          message: `${action.pokemonName} utilise ${action.moveUsed} !`,
          pokemonId: action.pokemonId,
          moveUsed: action.moveUsed,
          priority: action.priority
        });

        // Animation d'attaque
        setUIState(prev => ({
          ...prev,
          currentAnimation: 'attack'
        }));

        // Après animation d'attaque, traiter les dégâts
        setTimeout(() => {
          if (action.missedAttack) {
            addLogEntry({
              type: 'system',
              message: `L'attaque a échoué !`
            });
          } else if (action.damage > 0) {
            addLogEntry({
              type: 'damage',
              message: `${action.target} perd ${action.damage} HP !${action.isCritical ? ' Coup critique !' : ''}`,
              damage: action.damage,
              isCritical: action.isCritical
            });

            // Animation de dégâts
            triggerDamageAnimation(action.damage, action.isCritical, action.effectiveness, !isPlayerAttacking);
          }

          // Si c'est la dernière action du tour
          if (index === priorityOrder.length - 1) {
            setTimeout(() => {
              setBattleState(prev => ({
                ...prev,
                status: 'BATTLE_ACTIVE',
                isAnimating: false
              }));
              
              setUIState(prev => ({
                ...prev,
                currentAnimation: 'idle'
              }));
            }, 1000);
          }
        }, 500); // Délai pour l'animation d'attaque
      }, index * 2000); // Décalage entre les actions
    });
  }, [addLogEntry, triggerDamageAnimation]);

  const handlePokemonKo = useCallback((message: IPokemonKoMessage) => {
    const { koedPokemonName, isPlayer, availablePokemon, forceSelection } = message.data;

    console.log('[BATTLE] Pokemon KO:', { koedPokemonName, isPlayer, forceSelection });

    addLogEntry({
      type: 'ko',
      message: `${koedPokemonName} est KO !`
    });

    setUIState(prev => ({
      ...prev,
      currentAnimation: 'ko'
    }));

    if (isPlayer && forceSelection && availablePokemon && availablePokemon.length > 0) {
      // Le joueur doit choisir un nouveau Pokémon
      setBattleState(prev => ({
        ...prev,
        status: 'POKEMON_SELECTION',
        isWaitingForPlayerAction: true
      }));

      setUIState(prev => ({
        ...prev,
        showPokemonSelection: true
      }));

      addLogEntry({
        type: 'system',
        message: `Choisissez votre prochain Pokémon ! (${availablePokemon.length} disponibles)`
      });
    } else if (isPlayer && (!availablePokemon || availablePokemon.length === 0)) {
      // Tous les Pokémon du joueur sont KO
      setBattleState(prev => ({
        ...prev,
        status: 'PLAYER_DEFEATED'
      }));
      
      setTimeout(() => onBattleEnd('defeat'), 2000);
    }
  }, [addLogEntry, onBattleEnd]);

  const handleEnemyDefeated = useCallback((message: IEnemyDefeatedMessage) => {
    const { defeatedEnemyName, defeatedEnemies, totalEnemies, nextEnemy, isLastEnemy, transitionDelay } = message.data;

    console.log('[BATTLE] Enemy defeated:', { defeatedEnemyName, defeatedEnemies, isLastEnemy });

    addLogEntry({
      type: 'system',
      message: `🎉 ${defeatedEnemyName} est vaincu ! (${defeatedEnemies}/${totalEnemies})`
    });

    setBattleState(prev => ({
      ...prev,
      defeatedEnemies,
      status: isLastEnemy ? 'DUNGEON_COMPLETED' : 'ENEMY_DEFEATED'
    }));

    if (nextEnemy && !isLastEnemy) {
      // Transition vers le prochain ennemi
      setTimeout(() => {
        setBattleState(prev => ({
          ...prev,
          currentEnemyPokemon: nextEnemy,
          status: 'BATTLE_ACTIVE'
        }));
        
        addLogEntry({
          type: 'system',
          message: `💀 ${nextEnemy.name} niveau ${nextEnemy.level} entre en combat !`
        });
      }, transitionDelay);
    }
  }, [addLogEntry]);

  const handleDungeonCompleted = useCallback((message: IDungeonCompletedMessage) => {
    const { rewards, defeatedEnemies, survivingPokemon, totalTurns } = message.data;

    console.log('[BATTLE] Dungeon completed:', { rewards, defeatedEnemies, survivingPokemon });

    addLogEntry({
      type: 'system',
      message: `🏆 Donjon terminé ! ${defeatedEnemies} ennemis vaincus en ${totalTurns} tours avec ${survivingPokemon} Pokémon survivants !`
    });

    setBattleState(prev => ({
      ...prev,
      status: 'DUNGEON_COMPLETED'
    }));

    setTimeout(() => onBattleEnd('victory', rewards), 3000);
  }, [addLogEntry, onBattleEnd]);

  const handleBattleError = useCallback((message: IBattleErrorMessage) => {
    const { code, message: errorMessage, recoverable, suggestedAction } = message.data;
    
    console.error('[BATTLE] Battle error:', { code, errorMessage, recoverable });

    addError('server', `${code}: ${errorMessage}`, recoverable);

    if (suggestedAction) {
      addLogEntry({
        type: 'system',
        message: `💡 Suggestion: ${suggestedAction}`
      });
    }

    if (!recoverable) {
      setTimeout(() => onBattleEnd('defeat'), 2000);
    }
  }, [addError, addLogEntry, onBattleEnd]);

  // ========== ÉCOUTEUR WEBSOCKET ==========
  useEffect(() => {
    if (!webSocket) {
      setBattleState(prev => ({
        ...prev,
        connectionStatus: 'disconnected'
      }));
      onConnectionChange?.('disconnected');
      return;
    }

    const handleOpen = () => {
      setBattleState(prev => ({
        ...prev,
        connectionStatus: 'connected'
      }));
      onConnectionChange?.('connected');
      reconnectAttempts.current = 0;
    };

    const handleClose = () => {
      setBattleState(prev => ({
        ...prev,
        connectionStatus: 'disconnected'
      }));
      onConnectionChange?.('disconnected');
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        setBattleState(prev => ({
          ...prev,
          connectionStatus: 'reconnecting'
        }));
        onConnectionChange?.('reconnecting');
        reconnectAttempts.current++;
      }
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        console.log('[BATTLE] Received message:', message);
        
        switch (message.type) {
          case 'BATTLE_STARTED':
            handleBattleStarted(message.data);
            break;
          case 'TURN_COMPLETED':
            handleTurnCompleted(message);
            break;
          case 'POKEMON_KO':
            handlePokemonKo(message);
            break;
          case 'ENEMY_DEFEATED':
            handleEnemyDefeated(message);
            break;
          case 'DUNGEON_COMPLETED':
            handleDungeonCompleted(message);
            break;
          case 'BATTLE_ERROR':
            handleBattleError(message);
            break;
          default:
            console.log('[BATTLE] Message non géré:', message);
        }
      } catch (error) {
        console.error('[BATTLE] Erreur parsing message:', error);
        addError('client', 'Erreur de communication avec le serveur', true);
      }
    };

    webSocket.addEventListener('open', handleOpen);
    webSocket.addEventListener('close', handleClose);
    webSocket.addEventListener('message', handleMessage);
    
    return () => {
      webSocket.removeEventListener('open', handleOpen);
      webSocket.removeEventListener('close', handleClose);
      webSocket.removeEventListener('message', handleMessage);
    };
  }, [webSocket, onConnectionChange, handleBattleStarted, handleTurnCompleted, handlePokemonKo, handleEnemyDefeated, handleDungeonCompleted, handleBattleError, addError]);

  // ========== UTILITAIRES ==========
  const getAvailablePokemon = useCallback((): IBattlePokemon[] => {
    return battleState.playerTeam.filter(pokemon => 
      pokemon.hp > 0 && pokemon.id !== battleState.currentPlayerPokemon?.id
    );
  }, [battleState.playerTeam, battleState.currentPlayerPokemon]);

  const initializeBattle = useCallback((playerTeam: IBattlePokemon[], enemyTeam: IBattlePokemon[]) => {
    console.log('[BATTLE] Initializing battle with teams:', { playerTeam, enemyTeam });
    
    setBattleState(prev => ({
      ...prev,
      playerTeam,
      enemyTeam,
      status: 'WAITING_START',
      battleLog: [],
      currentTurn: 0,
      defeatedEnemies: 0,
      isAnimating: false
    }));

    setUIState({
      showPokemonSelection: true,
      showDamageAnimation: false,
      showTurnTransition: false,
      damageNumbers: [],
      currentAnimation: 'idle',
      soundEffects: []
    });

    setErrors([]);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    // États
    battleState,
    uiState,
    errors,
    
    // Actions
    startFight,
    changePokemon,
    
    // Utilitaires
    getAvailablePokemon,
    initializeBattle,
    clearErrors,
    addLogEntry
  };
}; 