import { useState, useEffect } from "react";
import { loadPokemonNames, validators } from "../utils/profileUtils";

// Hook personnalisé pour charger les noms de l'équipe Pokémon
export const useTeamPokemonNames = (teamPokemon: unknown) => {
  const [pokemonNames, setPokemonNames] = useState<{ [key: number]: string }>({});
  const [isLoadingNames, setIsLoadingNames] = useState(false);
  const [namesError, setNamesError] = useState<string | null>(null);

  useEffect(() => {
    const loadNames = async () => {
      // Vérifier si l'équipe est valide
      if (!validators.isValidTeam(teamPokemon)) {
        setPokemonNames({});
        return;
      }

      try {
        setIsLoadingNames(true);
        setNamesError(null);
        
        // Utiliser la fonction optimisée avec Promise.all
        const names = await loadPokemonNames(teamPokemon);
        
        setPokemonNames(names);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erreur de chargement des noms";
        setNamesError(errorMessage);
        
        // Fallback: garder les noms existants ou vide
        setPokemonNames({});
      } finally {
        setIsLoadingNames(false);
      }
    };

    loadNames();
  }, [teamPokemon]);

  return {
    pokemonNames,
    isLoadingNames,
    namesError,
    // Fonction pour rafraîchir manuellement les noms
    refreshNames: () => {
      if (validators.isValidTeam(teamPokemon)) {
        // Re-déclencher l'effet
        setPokemonNames({});
      }
    }
  };
}; 