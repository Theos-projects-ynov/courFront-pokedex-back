import { useCallback, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import type { OwnedPokemon } from "../../types/Trainer";
import type { Dungeon } from "../../types/Dungeon";
import { GameState } from "../../types/gameState";
import { DUNGEON_MESSAGES } from "../../constants/dungeonConstants";
import { usePokemonNames } from "../../hooks/usePokemonNames";
import useDungeonWebSocket from "../../hooks/useDungeonWebSocket";
import PlayerTeamSection from "../card/PlayerTeamSection";
import EnemiesSection from "../card/EnemiesSection";
import PokemonSelectionModal from "../card/PokemonSelectionModal";
import BattleMessages from "../card/BattleMessages";
import DungeonCompletionCard from "../card/DungeonCompletionCard";
import FullPageLoader from "../common/FullPageLoader";
import RetryLoader from "../common/RetryLoader";
import AlertMessage from "../common/AlertMessage";
import "../../style/page/dungeonBattle.scss";
import "../../style/component/card/pokemonCard.scss";
import "../../style/component/card/playerTeamSection.scss";
import "../../style/component/card/enemiesSection.scss";
import "../../style/component/card/pokemonSelectionModal.scss";
import "../../style/component/card/battleMessages.scss";
import "../../style/component/card/dungeonCompletionCard.scss";

function DungeonBattle() {
  const { dungeonId } = useParams<{ dungeonId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedFighter, setSelectedFighter] = useState<string | null>(null);

  const selectedPokemon = location.state?.selectedPokemon as OwnedPokemon[];
  const dungeon = location.state?.dungeon as Dungeon;

  // Hook pour les noms de Pokémon
  const { pokemonNames, loadPokemonNames } = usePokemonNames();

  // Hook principal pour la gestion WebSocket et l'état du jeu
  const {
    gameState,
    dungeonState,
    currentHp,
    maxHp,
    battleMessages,
    koedPokemon,
    availableForSwitch,
    dungeonCompletion,
    startFight,
    switchPokemon,
    resetDungeon,
  } = useDungeonWebSocket({
    dungeonId: dungeonId || "1",
    selectedPokemon: selectedPokemon || [],
    pokemonNames,
    onPokemonNamesUpdate: loadPokemonNames,
  });

  // Actions optimisées avec useCallback
  const handleStartBattle = useCallback(() => {
    if (
      selectedFighter &&
      dungeonState?.playerTeam &&
      dungeonState.playerTeam.length > 0
    ) {
      startFight(selectedFighter);
    }
  }, [selectedFighter, startFight, dungeonState]);

  const handleSwitchPokemon = useCallback(() => {
    if (selectedFighter) {
      switchPokemon(selectedFighter);
      setSelectedFighter(null);
    }
  }, [selectedFighter, switchPokemon]);

  const handleConfirmSelection = useCallback(() => {
    if (gameState.currentState === GameState.WAITING_SELECTION) {
      handleStartBattle();
    } else {
      // Sinon, c'est un changement volontaire - juste fermer la sélection
      setSelectedFighter(null);
    }
  }, [gameState.currentState, handleStartBattle]);

  const handleReturnToDungeons = useCallback(() => {
    resetDungeon();
    navigate("/dungeon");
  }, [resetDungeon, navigate]);

  // Vérifications préliminaires
  if (!selectedPokemon || !dungeon) {
    navigate("/dungeon");
    return null;
  }

  // Gestion des états de chargement et d'erreur avec retry
  if (gameState.currentState === GameState.LOADING) {
    if (gameState.isRetrying && gameState.retryCount > 1) {
      // Afficher le retry loader seulement après le premier échec
      return (
        <div className="dungeon-battle-page">
          <RetryLoader
            retryCount={gameState.retryCount}
            maxRetries={3}
            message="Résolution des conflits de session..."
          />
        </div>
      );
    } else {
      // Loader normal pour le chargement initial ou premier retry silencieux
      return (
        <div className="dungeon-battle-page">
          <FullPageLoader message="Connexion au donjon en cours..." />
        </div>
      );
    }
  }

  if (gameState.currentState === GameState.ERROR) {
    return (
      <div className="dungeon-battle-page">
        <AlertMessage
          severity="error"
          message={gameState.error || "Une erreur est survenue"}
          onAction={handleReturnToDungeons}
          actionLabel="Retour aux donjons"
        />
      </div>
    );
  }

  if (!dungeonState) {
    return (
      <div className="dungeon-battle-page">
        <AlertMessage
          severity="warning"
          message="Aucune donnée de donjon disponible"
          onAction={handleReturnToDungeons}
          actionLabel="Retour aux donjons"
        />
      </div>
    );
  }

  // Page de fin de donjon (victoire ou défaite)
  if (dungeonCompletion) {
    return (
      <DungeonCompletionCard
        isWin={dungeonCompletion.isWin}
        message={dungeonCompletion.message}
        rewards={dungeonCompletion.rewards}
        onReturnToDungeons={handleReturnToDungeons}
      />
    );
  }

  // Calcul des props pour les composants
  const isWaitingForFirstBattle =
    gameState.currentState === GameState.WAITING_SELECTION &&
    dungeonState?.nextAction === DUNGEON_MESSAGES.READY_FOR_FIRST_BATTLE;

  const showSelection =
    gameState.showPokemonSelection ||
    gameState.currentState === GameState.WAITING_SELECTION;
  const isForceSwitch = gameState.currentState === GameState.FORCE_SWITCH;

  return (
    <div className="dungeon-battle-page">
      {/* En-tête avec l'équipe du joueur */}
      <PlayerTeamSection
        dungeonName={dungeonState.dungeonInfo.name}
        playerTeam={dungeonState.playerTeam}
        currentHp={currentHp}
        maxHp={maxHp}
        koedPokemon={koedPokemon}
        pokemonNames={pokemonNames}
      />

      {/* Zone de combat centrale */}
      <Card className="battle-zone h-100">
        <CardContent>
          <Typography variant="h6" className="battle-status">
            {dungeonState.nextAction}
          </Typography>

          <div className="battle-arena">
            <Typography variant="h6">Zone de Combat</Typography>
            <Typography variant="body2">
              Ennemis vaincus: {dungeonState.session.defeatedEnemies}/3 avant le
              boss
            </Typography>

            {/* Messages de combat en temps réel */}
            <BattleMessages messages={battleMessages} />
          </div>

          <Box className="battle-controls" sx={{ mt: 3 }}>
            <PokemonSelectionModal
              isForceSwitch={isForceSwitch}
              availableForSwitch={availableForSwitch}
              onSwitch={handleSwitchPokemon}
              isShowSelection={showSelection}
              playerTeam={dungeonState.playerTeam}
              isInCombat={gameState.currentState === GameState.IN_BATTLE}
              nextAction={dungeonState.nextAction}
              onConfirm={handleConfirmSelection}
              onCancel={() => setSelectedFighter(null)}
              selectedFighter={selectedFighter}
              onSelectFighter={setSelectedFighter}
              currentHp={currentHp}
              maxHp={maxHp}
              koedPokemon={koedPokemon}
              pokemonNames={pokemonNames}
            />

            {isWaitingForFirstBattle && !showSelection && (
              <>
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  disabled={!gameState.isConnected}
                  onClick={() => setSelectedFighter(null)} // Trigger modal opening
                >
                  Commencer le combat
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleReturnToDungeons}
                  sx={{ ml: 2 }}
                >
                  Abandonner
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Ennemis et boss en bas */}
      <EnemiesSection
        enemies={dungeonState.enemies}
        boss={dungeonState.boss}
        defeatedEnemies={dungeonState.session.defeatedEnemies}
        currentHp={currentHp}
        maxHp={maxHp}
        koedPokemon={koedPokemon}
        pokemonNames={pokemonNames}
      />
    </div>
  );
}

export default DungeonBattle;
