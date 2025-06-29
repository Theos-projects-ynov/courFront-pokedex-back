import { Box, Typography, Chip } from "@mui/material";
import { Pets } from "@mui/icons-material";

// Utilitaires
import { formatters, validators } from "../../utils/profileUtils";
import { PROFILE_LABELS } from "../../constants/profileConstants";
import type { OwnedPokemon } from "../../types/Trainer";

interface TeamPokemonGridProps {
  teamPokemon: OwnedPokemon[];
  pokemonNames: { [key: number]: string };
}

const TeamPokemonGrid = ({
  teamPokemon,
  pokemonNames,
}: TeamPokemonGridProps) => {
  // Fonction pour obtenir le nom du Pokémon de manière sécurisée
  const getPokemonName = (pokedexId: number): string => {
    const nameFromCache = pokemonNames[pokedexId];
    if (nameFromCache) {
      return nameFromCache;
    }

    // Fallback vers l'ID si le nom n'est pas trouvé
    return `Pokémon #${pokedexId}`;
  };

  // Calculer le sprite de manière sécurisée
  const getPokemonSprite = (pokedexId: number): string => {
    if (!pokedexId || pokedexId <= 0) {
      return "/src/assets/missingno.png";
    }

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexId}.png`;
  };

  // Ne pas afficher la section si pas d'équipe valide
  if (!validators.isValidTeam(teamPokemon)) {
    return null;
  }

  return (
    <Box className="team-pokemon-section">
      <Typography variant="h6" className="section-title">
        <Pets />
        {PROFILE_LABELS.TEAM_POKEMON} ({teamPokemon.length})
      </Typography>

      <div className="team-pokemon-grid">
        {teamPokemon.map((pokemon) => (
          <div key={pokemon.id} className="team-pokemon-card">
            <img
              src={getPokemonSprite(pokemon.pokedexId)}
              alt={getPokemonName(pokemon.pokedexId)}
              className="team-pokemon-sprite"
              onError={(e) => {
                e.currentTarget.src = "/src/assets/missingno.png";
              }}
            />
            <div className="team-pokemon-info">
              <Typography variant="body2" className="pokemon-name">
                {getPokemonName(pokemon.pokedexId)}
              </Typography>
              <Chip
                label={formatters.levelLabel(pokemon.level)}
                size="small"
                variant="outlined"
                className="pokemon-level"
              />
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
};

export default TeamPokemonGrid;
