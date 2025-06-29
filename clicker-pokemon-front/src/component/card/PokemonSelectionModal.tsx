import React from "react";
import { Typography, Button, Box } from "@mui/material";
import DungeonPokemonCard from "./DungeonPokemonCard";
import type {
  AvailablePokemon,
  PlayerTeam,
  CurrentHp,
  MaxHp,
  PokemonNames,
} from "../../types/Dungeon";

interface PokemonSelectionModalProps {
  // Pour le remplacement forcé
  isForceSwitch?: boolean;
  availableForSwitch?: AvailablePokemon[];
  onSwitch?: () => void;

  // Pour la sélection normale
  isShowSelection?: boolean;
  playerTeam?: PlayerTeam[];
  isInCombat?: boolean;
  nextAction?: string;
  onConfirm?: () => void;
  onCancel?: () => void;

  // Commun
  selectedFighter: string | null;
  onSelectFighter: (pokemonId: string) => void;
  currentHp: CurrentHp;
  maxHp: MaxHp;
  koedPokemon: Set<string>;
  pokemonNames: PokemonNames;
}

const PokemonSelectionModal: React.FC<PokemonSelectionModalProps> = ({
  isForceSwitch = false,
  availableForSwitch = [],
  onSwitch,
  isShowSelection = false,
  playerTeam = [],
  isInCombat = false,
  nextAction = "",
  onConfirm,
  onCancel,
  selectedFighter,
  onSelectFighter,
  currentHp,
  maxHp,
  koedPokemon,
  pokemonNames,
}) => {
  if (isForceSwitch) {
    return (
      <div className="pokemon-selection">
        <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
          Choisissez un Pokémon de remplacement :
        </Typography>
        <div className="fighter-selection-grid">
          {availableForSwitch
            .filter((pokemon) => {
              // Filtrer les pokémons KO
              const isKO =
                koedPokemon.has(pokemon.id) || currentHp[pokemon.id] === 0;
              return !isKO;
            })
            .map((pokemon) => {
              // Trouver les données complètes du Pokémon dans l'équipe
              const fullPokemonData = playerTeam.find(
                (p) => p.id === pokemon.id
              );

              return (
                <DungeonPokemonCard
                  key={pokemon.id}
                  pokedexId={pokemon.pokedexId}
                  name={pokemonNames[pokemon.pokedexId] || pokemon.name}
                  level={pokemon.level}
                  sprite={fullPokemonData?.sprite || ""}
                  currentHp={
                    currentHp[pokemon.id] !== undefined
                      ? currentHp[pokemon.id]
                      : fullPokemonData?.stats.hp || 0
                  }
                  maxHp={maxHp[pokemon.id] || fullPokemonData?.stats.maxHp || 0}
                  isKO={false} // Déjà filtré plus haut
                  type="MyTeam"
                  pokemonNames={pokemonNames}
                  onClick={() => onSelectFighter(pokemon.id)}
                  isSelected={selectedFighter === pokemon.id}
                />
              );
            })}
        </div>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            size="large"
            disabled={!selectedFighter}
            onClick={onSwitch}
            color="error"
          >
            Remplacer !
          </Button>
        </Box>
      </div>
    );
  }

  if (isShowSelection) {
    return (
      <div className="pokemon-selection">
        <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
          Choisissez votre Pokémon pour le combat :
        </Typography>
        <div className="fighter-selection-grid">
          {playerTeam.map((pokemon) => {
            const isKO =
              koedPokemon.has(pokemon.id) || currentHp[pokemon.id] === 0;
            return (
              <DungeonPokemonCard
                key={pokemon.id}
                pokedexId={pokemon.pokedexId}
                name={pokemon.name}
                level={pokemon.level}
                sprite={pokemon.sprite}
                currentHp={
                  currentHp[pokemon.id] !== undefined
                    ? currentHp[pokemon.id]
                    : pokemon.stats.hp
                }
                maxHp={maxHp[pokemon.id] || pokemon.stats.maxHp}
                isKO={isKO}
                type="MyTeam"
                pokemonNames={pokemonNames}
                onClick={!isKO ? () => onSelectFighter(pokemon.id) : undefined}
                isSelected={selectedFighter === pokemon.id}
              />
            );
          })}
        </div>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            size="large"
            disabled={!selectedFighter}
            onClick={onConfirm}
            sx={{ mr: 2 }}
          >
            {isInCombat || nextAction === "Prêt pour le premier combat !"
              ? "Combattre !"
              : "Confirmer"}
          </Button>
          <Button variant="outlined" size="large" onClick={onCancel}>
            Annuler
          </Button>
        </Box>
      </div>
    );
  }

  return null;
};

export default PokemonSelectionModal;
