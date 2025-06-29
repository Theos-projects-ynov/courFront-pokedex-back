import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { AuthService } from "../../service/authService";
import type { Trainer, OwnedPokemon } from "../../types/Trainer";
import "../../style/page/dungeon.scss";
import superbonbon from "../../assets/icon/image-removebg-preview (13).png";

// Types pour les donjons
interface Dungeon {
  id: number;
  name: string;
  difficulty: number;
  type: string;
  rewards: string[];
}

// Cache pour les noms des Pokémon
const pokemonNamesCache: { [key: number]: string } = {};

// Types pour l'API PokeAPI
interface PokemonName {
  language: { name: string };
  name: string;
}

interface PokemonSpecies {
  names: PokemonName[];
}

const dungeons: Dungeon[] = [
  {
    id: 1,
    name: "Donjon de mew",
    difficulty: 4,
    type: "plante et eau",
    rewards: ["Pokéball", "Potion", "XP"],
  },
];

function DungeonPage() {
  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon | null>(null);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<OwnedPokemon[]>([]);
  const [availablePokemon, setAvailablePokemon] = useState<OwnedPokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pokemonNames, setPokemonNames] = useState<{ [key: number]: string }>(
    {}
  );
  const navigate = useNavigate();

  // Fonction pour récupérer le nom du Pokémon
  const fetchPokemonName = async (pokedexId: number): Promise<string> => {
    if (pokemonNamesCache[pokedexId]) {
      return pokemonNamesCache[pokedexId];
    }

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${pokedexId}`
      );
      const data: PokemonSpecies = await response.json();
      const frenchName =
        data.names.find((name: PokemonName) => name.language.name === "fr")
          ?.name ||
        data.names.find((name: PokemonName) => name.language.name === "en")
          ?.name ||
        `Pokémon #${pokedexId}`;

      pokemonNamesCache[pokedexId] = frenchName;
      return frenchName;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du nom pour ${pokedexId}:`,
        error
      );
      return `Pokémon #${pokedexId}`;
    }
  };

  useEffect(() => {
    document.title = "PokéDex - Donjon";
    loadTrainerData();
  }, []);

  useEffect(() => {
    if (trainer?.pokemons) {
      setAvailablePokemon(
        trainer.pokemons.filter(
          (pokemon) =>
            !selectedPokemon.find((selected) => selected.id === pokemon.id)
        )
      );
    }
  }, [trainer, selectedPokemon]);

  useEffect(() => {
    // Récupérer les noms des Pokémon quand ils changent
    const loadPokemonNames = async () => {
      if (trainer?.pokemons) {
        const names: { [key: number]: string } = {};
        const allPokemon = [...selectedPokemon, ...availablePokemon];

        for (const pokemon of allPokemon) {
          if (!pokemonNames[pokemon.pokedexId]) {
            names[pokemon.pokedexId] = await fetchPokemonName(
              pokemon.pokedexId
            );
          }
        }

        if (Object.keys(names).length > 0) {
          setPokemonNames((prev) => ({ ...prev, ...names }));
        }
      }
    };

    loadPokemonNames();
  }, [trainer, selectedPokemon, availablePokemon, pokemonNames]);

  const loadTrainerData = async () => {
    try {
      setIsLoading(true);
      const trainerData = await AuthService.getTrainerProfile();
      setTrainer(trainerData);
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
      setError("Erreur lors du chargement de vos Pokémon");
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return "★".repeat(difficulty) + "☆".repeat(5 - difficulty);
  };

  const handleDungeonSelect = (dungeon: Dungeon) => {
    setSelectedDungeon(dungeon);
    // Reset de la sélection quand on change de donjon
    setSelectedPokemon([]);
  };

  const handlePokemonSelect = (pokemon: OwnedPokemon) => {
    if (selectedPokemon.length < 4) {
      setSelectedPokemon((prev) => [...prev, pokemon]);
    }
  };

  const handlePokemonDeselect = (pokemon: OwnedPokemon) => {
    setSelectedPokemon((prev) => prev.filter((p) => p.id !== pokemon.id));
  };

  const isTeamReady = selectedPokemon.length === 4;

  const handleStartDungeon = () => {
    if (selectedDungeon && selectedPokemon.length === 4) {
      // Naviguer vers la page de bataille du donjon avec l'équipe sélectionnée
      navigate(`/dungeon-battle/${selectedDungeon.id}`, {
        state: {
          selectedPokemon: selectedPokemon,
          dungeon: selectedDungeon,
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="dungeon-page">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      </div>
    );
  }

  return (
    <div className="dungeon-page">
      <div className="dungeon-container">
        {/* Section sélection de donjon */}
        <Card className="dungeon-selection-card">
          <CardContent>
            <Typography variant="h4" component="h1" className="dungeon-title">
              Donjons disponibles
            </Typography>

            <div className="dungeon-grid">
              {dungeons.map((dungeon) => (
                <Card
                  key={dungeon.id}
                  className={`dungeon-card ${
                    selectedDungeon?.id === dungeon.id ? "selected" : ""
                  }`}
                  onClick={() => handleDungeonSelect(dungeon)}
                >
                  <CardContent>
                    <Typography variant="h6" className="dungeon-name">
                      {dungeon.name}
                    </Typography>
                    <Box className="dungeon-info">
                      <Typography variant="body2" className="difficulty">
                        Difficulté {getDifficultyStars(dungeon.difficulty)}
                      </Typography>
                      <Typography variant="body2" className="type">
                        Type du donjon : {dungeon.type}
                      </Typography>
                    </Box>
                    <Box className="rewards">
                      <Typography variant="body2" className="rewards-title">
                        Récompense
                      </Typography>
                      <div className="reward-boxes">
                        {dungeon.rewards.map((reward, index) => (
                          <div key={index} className="reward-box">
                            <img src={superbonbon} alt="superbonbon" />
                          </div>
                        ))}
                      </div>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section sélection d'équipe */}
        {selectedDungeon && (
          <Card className="team-selection-card">
            <CardContent>
              <Typography variant="h5" component="h2" className="section-title">
                Pokémon sélectionnés : {selectedPokemon.length}/4
              </Typography>

              <div className="selected-pokemon-grid">
                {Array.from({ length: 4 }, (_, index) => {
                  const pokemon = selectedPokemon[index];
                  return (
                    <Card
                      key={index}
                      className={`selected-slot ${
                        pokemon ? "filled" : "empty"
                      }`}
                      onClick={() => pokemon && handlePokemonDeselect(pokemon)}
                    >
                      <CardContent>
                        {pokemon ? (
                          <div className="pokemon-content">
                            <Typography
                              variant="subtitle2"
                              className="pokemon-name"
                            >
                              {pokemonNames[pokemon.pokedexId] ||
                                `Pokémon #${pokemon.pokedexId}`}
                            </Typography>
                            <div className="pokemon-slot">
                              <img
                                src={`https://raw.githubusercontent.com/Yarkis01/TyraDex/images/sprites/${pokemon.pokedexId}/regular.png`}
                                alt={
                                  pokemonNames[pokemon.pokedexId] ||
                                  `Pokémon #${pokemon.pokedexId}`
                                }
                                className="pokemon-image"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIvPgo8dGV4dCB4PSIyMCIgeT0iMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KSIgZm9udC1zaXplPSIxMiI+Pz88L3RleHQ+Cjwvc3ZnPg==";
                                }}
                              />
                            </div>
                            <Box className="pokemon-details">
                              <Typography variant="caption">
                                #{pokemon.pokedexId}
                              </Typography>
                              <Chip
                                label={`Niv. ${pokemon.level}`}
                                size="small"
                                color="primary"
                              />
                            </Box>
                          </div>
                        ) : (
                          <div className="empty-slot">
                            <div className="empty-indicator">+</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Box className="start-button-container">
                <Button
                  variant="contained"
                  size="large"
                  disabled={!isTeamReady}
                  onClick={handleStartDungeon}
                  className={`start-dungeon-button ${
                    isTeamReady ? "ready" : "disabled"
                  }`}
                >
                  {isTeamReady
                    ? "Commencer le donjon"
                    : `Sélectionnez ${
                        4 - selectedPokemon.length
                      } Pokémon de plus`}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Section Pokémon disponibles */}
        {selectedDungeon && (
          <Card className="pokemon-team-card">
            <CardContent>
              <Typography variant="h5" component="h2" className="section-title">
                Mes Pokémons : {availablePokemon.length} disponibles
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {availablePokemon.length > 0 ? (
                <div className="pokemon-grid">
                  {availablePokemon.map((pokemon) => (
                    <Card
                      key={pokemon.id}
                      className="pokemon-card clickable"
                      onClick={() => handlePokemonSelect(pokemon)}
                    >
                      <CardContent>
                        <div className="pokemon-header">
                          <Typography
                            variant="subtitle1"
                            className="pokemon-name"
                          >
                            {pokemonNames[pokemon.pokedexId] ||
                              `Pokémon #${pokemon.pokedexId}`}
                          </Typography>
                          <div className="pokemon-slot">
                            <img
                              src={`https://raw.githubusercontent.com/Yarkis01/TyraDex/images/sprites/${pokemon.pokedexId}/regular.png`}
                              alt={
                                pokemonNames[pokemon.pokedexId] ||
                                `Pokémon #${pokemon.pokedexId}`
                              }
                              className="pokemon-image"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIvPgo8dGV4dCB4PSIzMCIgeT0iMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KSIgZm9udC1zaXplPSIxNiI+Pz88L3RleHQ+Cjwvc3ZnPg==";
                              }}
                            />
                          </div>
                        </div>
                        <Box className="pokemon-details">
                          <Typography variant="body2">
                            Pokédex #{pokemon.pokedexId}
                          </Typography>
                          <Chip
                            label={`Niv. ${pokemon.level}`}
                            size="small"
                            color="primary"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  {selectedPokemon.length === 4
                    ? "Tous vos Pokémon sont sélectionnés !"
                    : "Aucun Pokémon disponible"}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default DungeonPage;
