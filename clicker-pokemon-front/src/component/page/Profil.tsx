import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Button } from "@mui/material";
import { Logout } from "@mui/icons-material";

// Services et API
import { AuthService } from "../../service/authService";
import { useGetTrainerProfileQuery } from "../../api/PokemonAPI";

// Composants
import ApiErrorMessage from "../common/ApiErrorMessage";
import ProfileSkeleton from "../common/ProfileSkeleton";
import TrainerHeader from "../card/TrainerHeader";
import TrainerInfoCard from "../card/TrainerInfoCard";
import TrainerProgressCard from "../card/TrainerProgressCard";
import TeamPokemonGrid from "../card/TeamPokemonGrid";
import TrainerDescription from "../card/TrainerDescription";

// Hooks et utilitaires
import { useTeamPokemonNames } from "../../hooks/useTeamPokemonNames";
import { validators } from "../../utils/profileUtils";
import { PROFILE_LABELS } from "../../constants/profileConstants";

// Styles
import "../../style/page/profil.scss";

const Profil = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // RTK Query pour les données du profil
  const {
    data: trainer,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTrainerProfileQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
    refetchOnFocus: false,
  });

  // Hook personnalisé pour charger les noms des Pokémon de l'équipe
  const { pokemonNames } = useTeamPokemonNames(trainer?.teamPokemon);

  // Gérer la déconnexion avec useCallback pour éviter les re-renders
  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      await AuthService.logout();
      navigate("/login");
    } catch {
      // L'erreur est gérée silencieusement - l'utilisateur reste sur la page
    } finally {
      setIsLoggingOut(false);
    }
  }, [navigate]);

  // Obtenir l'équipe Pokémon typée
  const getTeamPokemon = useCallback(() => {
    if (!trainer?.teamPokemon) {
      return [];
    }

    if (!validators.isValidTeam(trainer.teamPokemon)) {
      return [];
    }

    return trainer.teamPokemon.slice(0, 6); // Maximum 6 Pokémon
  }, [trainer?.teamPokemon]);

  // États de chargement
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // Gestion des erreurs avec composant réutilisable
  if (isError || !trainer) {
    return (
      <div className="profil-page">
        <ApiErrorMessage
          error={error}
          onRetry={refetch}
          onLogout={handleLogout}
          showLogout={true}
          retryLabel={PROFILE_LABELS.RETRY}
          logoutLabel={PROFILE_LABELS.LOGOUT}
        />
      </div>
    );
  }

  const teamPokemon = getTeamPokemon();

  return (
    <div className="profil-page">
      <div className="profil-container">
        <Card className="profil-card">
          <CardContent>
            {/* En-tête du profil */}
            <TrainerHeader trainer={trainer} />

            <div className="profil-info">
              {/* Informations générales */}
              <TrainerInfoCard trainer={trainer} />

              {/* Progression */}
              <TrainerProgressCard trainer={trainer} />

              {/* Équipe Pokémon (s'affiche seulement s'il y en a) */}
              <TeamPokemonGrid
                teamPokemon={teamPokemon}
                pokemonNames={pokemonNames}
              />

              {/* Description (s'affiche seulement s'il y en a) */}
              <TrainerDescription description={trainer.description} />
            </div>

            {/* Actions */}
            <Box className="profil-actions">
              <Button
                variant="outlined"
                color="error"
                startIcon={<Logout />}
                onClick={handleLogout}
                disabled={isLoggingOut}
                size="large"
              >
                {isLoggingOut
                  ? PROFILE_LABELS.LOGGING_OUT
                  : PROFILE_LABELS.LOGOUT}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profil;
