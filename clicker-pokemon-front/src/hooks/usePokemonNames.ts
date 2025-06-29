import { useState, useCallback } from 'react';
import type { PokemonNames, DungeonState, AvailablePokemon } from '../types/Dungeon';
import { fetchPokemonName } from '../utils/pokemonUtils';

export const usePokemonNames = () => {
  const [pokemonNames, setPokemonNames] = useState<PokemonNames>({});

  const loadPokemonNames = useCallback(async (
    dungeonState: DungeonState | null,
    availableForSwitch: AvailablePokemon[] = []
  ) => {
    if (!dungeonState) return;

    const names: PokemonNames = {};

    // Charger les noms de l'équipe du joueur
    if (dungeonState.playerTeam) {
      for (const pokemon of dungeonState.playerTeam) {
        if (!pokemonNames[pokemon.pokedexId]) {
          names[pokemon.pokedexId] = await fetchPokemonName(pokemon.pokedexId);
        }
      }
    }

    // Charger les noms des ennemis
    if (dungeonState.enemies) {
      for (const enemy of dungeonState.enemies) {
        if (!pokemonNames[enemy.pokedexId]) {
          names[enemy.pokedexId] = await fetchPokemonName(enemy.pokedexId);
        }
      }
    }

    // Charger le nom du boss
    if (dungeonState.boss && !pokemonNames[dungeonState.boss.pokedexId]) {
      names[dungeonState.boss.pokedexId] = await fetchPokemonName(
        dungeonState.boss.pokedexId
      );
    }

    // Charger les noms des Pokémon disponibles pour le switch
    if (availableForSwitch.length > 0) {
      for (const pokemon of availableForSwitch) {
        if (!pokemonNames[pokemon.pokedexId]) {
          names[pokemon.pokedexId] = await fetchPokemonName(pokemon.pokedexId);
        }
      }
    }

    if (Object.keys(names).length > 0) {
      setPokemonNames((prev) => ({ ...prev, ...names }));
    }
  }, [pokemonNames]);

  return {
    pokemonNames,
    loadPokemonNames,
  };
}; 