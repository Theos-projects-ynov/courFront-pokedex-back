import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Collapse,
  IconButton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { ExpandMore, ExpandLess, PlayArrow } from "@mui/icons-material";
import {
  PokemonService,
  type OwnedPokemon,
  type WildPokemon,
  type CapturePayload,
} from "../../service/pokemon";
import { useInvalidateTrainerProfileMutation } from "../../api/PokemonAPI";
import "../../style/page/catch.scss";

const CatchPage = () => {
  const [myPokemon, setMyPokemon] = useState<OwnedPokemon[]>([]);
  const [wildPokemon, setWildPokemon] = useState<WildPokemon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedPokemon, setExpandedPokemon] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureResult, setCaptureResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showCaptureDialog, setShowCaptureDialog] = useState(false);

  // Hook pour invalider le cache du profil
  const [invalidateTrainerProfile] = useInvalidateTrainerProfileMutation();

  // Charger les Pokémon du dresseur
  const loadMyPokemon = async () => {
    try {
      setIsLoading(true);
      const pokemon = await PokemonService.getTrainerPokemon();
      setMyPokemon(pokemon);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors du chargement des Pokémon"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Chercher un Pokémon sauvage
  const findWildPokemon = async () => {
    try {
      setIsLoading(true);
      setError("");
      const pokemon = await PokemonService.findWildPokemon(1);
      setWildPokemon(pokemon);

      // Invalider le cache du profil car cela peut affecter les données
      await invalidateTrainerProfile();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Erreur lors de la recherche"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Capturer le Pokémon
  const capturePokemon = async () => {
    if (!wildPokemon) return;

    try {
      setIsCapturing(true);
      const payload: CapturePayload = {
        zone: wildPokemon.zone,
        pokedexId: wildPokemon.pokedexId,
        level: wildPokemon.level,
        isShiny: wildPokemon.isShiny,
        genre: wildPokemon.genre,
        pokemon: wildPokemon.pokemon,
      };

      const result = await PokemonService.capturePokemon(payload);

      if (result.success) {
        setCaptureResult({
          success: true,
          message: `${wildPokemon.pokemon.name.fr} a été capturé avec succès !`,
        });

        // Recharger les Pokémon du dresseur
        await loadMyPokemon();

        // Invalider le cache du profil car on a un nouveau Pokémon
        await invalidateTrainerProfile();

        // Afficher le prochain Pokémon sauvage s'il y en a un
        if (result.nextWildPokemon) {
          setWildPokemon(result.nextWildPokemon);
        } else {
          setWildPokemon(null);
        }
      } else {
        setCaptureResult({
          success: false,
          message: `${wildPokemon.pokemon.name.fr} s'est échappé !`,
        });
      }
      setShowCaptureDialog(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Erreur lors de la capture"
      );
    } finally {
      setIsCapturing(false);
    }
  };

  // Relâcher le Pokémon
  const releasePokemon = async () => {
    if (!wildPokemon) return;

    try {
      setIsCapturing(true);
      await PokemonService.releasePokemon(1); // Zone 1 par défaut

      setWildPokemon(null);
      setCaptureResult({
        success: true,
        message: "Pokémon relâché avec succès !",
      });
      setShowCaptureDialog(true);

      // Invalider le cache du profil car l'état peut avoir changé
      await invalidateTrainerProfile();
    } catch (error) {
      setCaptureResult({
        success: false,
        message:
          error instanceof Error ? error.message : "Erreur lors du relâchement",
      });
      setShowCaptureDialog(true);
    } finally {
      setIsCapturing(false);
    }
  };

  // Relâcher et chercher un nouveau Pokémon
  const releaseAndFindNew = async () => {
    if (!wildPokemon) {
      findWildPokemon();
      return;
    }

    try {
      setIsLoading(true);
      await PokemonService.releasePokemon(1); // Relâcher d'abord
      setWildPokemon(null);
      await findWildPokemon(); // Puis chercher un nouveau (qui invalidera déjà le cache)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors du changement de Pokémon"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyPokemon();
    document.title = "PokéDex - Capture";
  }, []);

  const getTypeColor = (typeName: string) => {
    const colors: { [key: string]: string } = {
      Normal: "#A8A878",
      Combat: "#C03028",
      Vol: "#A890F0",
      Poison: "#A040A0",
      Sol: "#E0C068",
      Roche: "#B8A038",
      Insecte: "#A8B820",
      Spectre: "#705898",
      Acier: "#B8B8D0",
      Feu: "#F08030",
      Eau: "#6890F0",
      Plante: "#78C850",
      Électrik: "#F8D030",
      Psy: "#F85888",
      Glace: "#98D8D8",
      Dragon: "#7038F8",
      Ténèbres: "#705848",
      Fée: "#EE99AC",
    };
    return colors[typeName] || "#68A090";
  };

  return (
    <div className="catch-page">
      <div className="catch-container">
        <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "#fff", textAlign: "center", mb: 3 }}
          >
            Zone de Capture
          </Typography>

          {/* Indicateur de synchronisation avec le profil */}
          <Box sx={{ mb: 2, textAlign: "center" }}>
            <Typography variant="caption" sx={{ color: "#aaa" }}>
              🔄 Les captures/recherches mettent automatiquement à jour votre
              profil
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Section Mes Pokémon (repliable) */}
          <Card
            sx={{
              mb: 3,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => setExpandedPokemon(!expandedPokemon)}
              >
                <Typography variant="h6" sx={{ color: "#fff" }}>
                  Mes Pokémon ({myPokemon.length})
                </Typography>
                <IconButton sx={{ color: "#fff" }}>
                  {expandedPokemon ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>

              <Collapse in={expandedPokemon}>
                <Box sx={{ mt: 2 }}>
                  {isLoading && myPokemon.length === 0 ? (
                    <Box display="flex" justifyContent="center" p={2}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <div className="pokemon-grid">
                      {myPokemon.map((pokemon) => (
                        <Card
                          key={pokemon.id}
                          variant="outlined"
                          className="pokemon-card"
                        >
                          <CardContent>
                            {/* Titre plus grand */}
                            <Typography
                              variant="h6"
                              className="pokemon-name"
                              sx={{
                                mb: 2,
                                textAlign: "center",
                                fontSize: "1.3rem",
                              }}
                            >
                              {pokemon.name?.fr || "Pokémon Inconnu"}
                            </Typography>

                            {/* Section principale avec image à gauche et infos à droite */}
                            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                              {/* Image à gauche - plus grande */}
                              <div className="pokemon-slot-large">
                                <img
                                  src={
                                    pokemon.sprites?.regular ||
                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIvPgo8dGV4dCB4PSIzMCIgeT0iMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KSIgZm9udC1zaXplPSIxNiI+Pz88L3RleHQ+Cjwvc3ZnPg=="
                                  }
                                  alt={pokemon.name?.fr || "Pokémon"}
                                  className="pokemon-image-large"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIvPgo8dGV4dCB4PSIzMCIgeT0iMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC41KSIgZm9udC1zaXplPSIxNiI+Pz88L3RleHQ+Cjwvc3ZnPg==";
                                  }}
                                />
                              </div>

                              {/* Infos à droite */}
                              <Box
                                sx={{
                                  flex: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                }}
                              >
                                <Typography
                                  variant="body1"
                                  sx={{
                                    color: "#fff",
                                    fontWeight: "bold",
                                    mb: 0.5,
                                  }}
                                >
                                  Pokédex #{pokemon.pokedexId}
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ color: "#fff", mb: 1 }}
                                >
                                  Niveau {pokemon.level} •{" "}
                                  {pokemon.genre === "male" ? "♂" : "♀"}
                                </Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(
                                    (pokemon.level / 100) * 100,
                                    100
                                  )}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    "& .MuiLinearProgress-bar": {
                                      backgroundColor: "#1976d2",
                                    },
                                  }}
                                />
                              </Box>
                            </Box>

                            {/* Types et attaques en dessous - plus larges */}
                            <Box className="pokemon-bottom-info">
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  flexWrap: "wrap",
                                  justifyContent: "center",
                                  mb: 2,
                                }}
                              >
                                {pokemon.types?.map((type, index) => (
                                  <Chip
                                    key={index}
                                    icon={
                                      type.image ? (
                                        <img
                                          src={type.image}
                                          alt={type.name}
                                          style={{ width: 16, height: 16 }}
                                        />
                                      ) : undefined
                                    }
                                    label={type.name}
                                    sx={{
                                      backgroundColor: getTypeColor(type.name),
                                      color: "white",
                                      fontWeight: "bold",
                                      fontSize: "0.9rem",
                                      height: "32px",
                                      px: 1,
                                      "& .MuiChip-icon": {
                                        color: "transparent",
                                      },
                                    }}
                                  />
                                )) || []}
                              </Box>

                              {pokemon.pokemonOwnedMoves &&
                                pokemon.pokemonOwnedMoves.length > 0 && (
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: "#aaa",
                                        display: "block",
                                        mb: 1,
                                        textAlign: "center",
                                      }}
                                    >
                                      Attaques (
                                      {pokemon.pokemonOwnedMoves.length})
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        gap: 0.5,
                                        flexWrap: "wrap",
                                        justifyContent: "center",
                                      }}
                                    >
                                      {pokemon.pokemonOwnedMoves
                                        .slice(0, 2)
                                        .map((move, index) => (
                                          <Chip
                                            key={index}
                                            label={move.move.name.replace(
                                              /-/g,
                                              " "
                                            )}
                                            size="medium"
                                            variant="outlined"
                                            sx={{
                                              fontSize: "0.8rem",
                                              height: "28px",
                                              borderColor:
                                                "rgba(255, 255, 255, 0.3)",
                                              color: "#fff",
                                              "& .MuiChip-label": {
                                                px: 1,
                                              },
                                            }}
                                          />
                                        ))}
                                      {pokemon.pokemonOwnedMoves.length > 2 && (
                                        <Chip
                                          label={`+${
                                            pokemon.pokemonOwnedMoves.length - 2
                                          }`}
                                          size="medium"
                                          variant="outlined"
                                          sx={{
                                            fontSize: "0.8rem",
                                            height: "28px",
                                            borderColor:
                                              "rgba(255, 255, 255, 0.3)",
                                            color: "#aaa",
                                            "& .MuiChip-label": {
                                              px: 1,
                                            },
                                          }}
                                        />
                                      )}
                                    </Box>
                                  </Box>
                                )}
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </Box>
              </Collapse>
            </CardContent>
          </Card>

          {/* Section Capture */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Card
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                width: "50%",
                minWidth: "400px",
              }}
            >
              <CardContent sx={{ py: 1.5, px: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#fff",
                    mb: 1.5,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Capture de Pokémon
                </Typography>

                {!wildPokemon ? (
                  <Box sx={{ textAlign: "center", py: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#aaa", mb: 1.5, fontSize: "0.9rem" }}
                    >
                      Aucun Pokémon sauvage en vue...
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={findWildPokemon}
                      disabled={isLoading}
                      size="small"
                    >
                      {isLoading ? "Recherche..." : "Chercher un Pokémon"}
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Card
                      variant="outlined"
                      sx={{
                        mb: 1.5,
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 107, 107, 0.6)",
                        borderRadius: 1,
                      }}
                      className="wild-pokemon-card-compact"
                    >
                      <CardContent sx={{ py: 2, px: 2 }}>
                        {/* Conteneur centré pour la zone rouge */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mb: 2,
                          }}
                        >
                          {/* Section principale avec image à gauche et infos à droite */}
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              alignItems: "center",
                              maxWidth: "fit-content",
                            }}
                          >
                            {/* Image à gauche avec effet violet */}
                            <div
                              className="pokemon-slot-large"
                              style={{
                                border: "3px solid #9c27b0",
                                boxShadow: "0 0 20px rgba(156, 39, 176, 0.4)",
                              }}
                            >
                              <img
                                src={
                                  wildPokemon.isShiny
                                    ? wildPokemon.pokemon.sprites?.shiny
                                    : wildPokemon.pokemon.sprites?.regular
                                }
                                alt={wildPokemon.pokemon.name?.fr || "Pokémon"}
                                className="pokemon-image-large pokemon-sprite"
                              />
                            </div>

                            {/* Infos à droite */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  color: "#fff",
                                  fontWeight: "bold",
                                  mb: 0.5,
                                  fontSize: "1.3rem",
                                }}
                              >
                                {wildPokemon.pokemon.name?.fr ||
                                  "Pokémon Inconnu"}
                                {wildPokemon.isShiny && " ✨"}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  color: "#fff",
                                  fontWeight: "bold",
                                  mb: 0.5,
                                }}
                              >
                                Pokédex #{wildPokemon.pokedexId}
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ color: "#fff", mb: 1 }}
                              >
                                Niveau {wildPokemon.level} •{" "}
                                {wildPokemon.genre === "male" ? "♂" : "♀"}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Types en dessous - plus larges */}
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            flexWrap: "wrap",
                            justifyContent: "center",
                            mb: 2,
                          }}
                        >
                          {wildPokemon.pokemon.types?.map((type, index) => (
                            <Chip
                              key={index}
                              icon={
                                type.image ? (
                                  <img
                                    src={type.image}
                                    alt={type.name}
                                    style={{ width: 16, height: 16 }}
                                  />
                                ) : undefined
                              }
                              label={type.name}
                              sx={{
                                backgroundColor: getTypeColor(type.name),
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "0.9rem",
                                height: "32px",
                                px: 1,
                                "& .MuiChip-icon": {
                                  color: "transparent",
                                },
                              }}
                            />
                          )) || []}
                        </Box>

                        {/* Boutons de capture en dessous */}
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                            mb: 2,
                          }}
                        >
                          <Button
                            variant="contained"
                            onClick={capturePokemon}
                            disabled={isCapturing}
                            size="medium"
                            sx={{ minWidth: "120px" }}
                          >
                            {isCapturing ? "Capture..." : "Capturer"}
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={releasePokemon}
                            disabled={isCapturing}
                            size="medium"
                            sx={{ minWidth: "120px" }}
                          >
                            Relâcher
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>

                    <Box sx={{ textAlign: "center" }}>
                      <Button
                        variant="text"
                        onClick={releaseAndFindNew}
                        disabled={isLoading || isCapturing}
                        size="small"
                        sx={{ color: "#aaa", fontSize: "0.8rem" }}
                      >
                        {isLoading
                          ? "Changement..."
                          : "Chercher un autre Pokémon"}
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Dialog de résultat de capture */}
          <Dialog
            open={showCaptureDialog}
            onClose={() => setShowCaptureDialog(false)}
          >
            <DialogTitle>
              {captureResult?.success ? "Succès !" : "Échec..."}
            </DialogTitle>
            <DialogContent>
              <Typography>{captureResult?.message}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowCaptureDialog(false)}>
                Fermer
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </div>
    </div>
  );
};

export default CatchPage;
