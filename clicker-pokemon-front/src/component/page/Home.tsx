import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGetPokemonByGenerationQuery } from "../../api/PokemonAPI";
import { IPokemon } from "../../types/Pokemon";
import PokemonCard from "../card/PokemonCard";
import GenerationNavigation from "../card/GenerationNavigation";
import PokemonGridSkeleton from "../card/PokemonGridSkeleton";
import HomeErrorMessage from "../common/HomeErrorMessage";
import { HOME_CONFIG, HOME_MESSAGES } from "../../constants/homeConstants";
import {
  isValidGeneration,
  getGenerationTitle,
  getLoadingState,
} from "../../utils/homeUtils";
import "../../style/page/home.scss";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [generation, setGeneration] = useState<number>(
    HOME_CONFIG.MIN_GENERATION
  );

  const {
    data: pokemonsData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetPokemonByGenerationQuery(generation, {
    skip: false,
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
    refetchOnFocus: false,
  });

  // Calcul de l'état de chargement
  const loadingState = getLoadingState(
    isLoading,
    isFetching,
    isError,
    Boolean(pokemonsData?.length)
  );

  // Gestion du titre de la page
  useEffect(() => {
    document.title = getGenerationTitle(generation);
  }, [generation]);

  // Handlers mémorisés
  const handleNextGeneration = useCallback(() => {
    const nextGen = generation + 1;
    if (nextGen <= HOME_CONFIG.MAX_GENERATION) {
      setGeneration(nextGen);
    }
  }, [generation]);

  const handlePreviousGeneration = useCallback(() => {
    const previousGen = generation - 1;
    if (previousGen >= HOME_CONFIG.MIN_GENERATION) {
      setGeneration(previousGen);
    }
  }, [generation]);

  const handleGenerationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newGeneration = Number(e.target.value);
      if (isValidGeneration(newGeneration)) {
        setGeneration(newGeneration);
      }
    },
    []
  );

  const handlePokemonClick = useCallback(
    (pokemon: IPokemon) => {
      navigate(`/pokemon/${pokemon.pokedex_id}`);
    },
    [navigate]
  );

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // État de chargement/fetch
  const isLoadingOrFetching = isLoading || isFetching;

  // Rendu des différents états
  const renderContent = () => {
    switch (loadingState) {
      case "loading":
        return (
          <div className="loading-container">
            <PokemonGridSkeleton count={getSkeletonCount()} />
            <p>
              {HOME_MESSAGES.LOADING} {generation}...
            </p>
          </div>
        );

      case "fetching":
        return (
          <div className="loading-container">
            <PokemonGridSkeleton count={getSkeletonCount()} />
          </div>
        );

      case "error":
        return (
          <HomeErrorMessage generation={generation} onRetry={handleRetry} />
        );

      case "success":
        return (
          <>
            <div className="pokemon-grid">
              {pokemonsData?.map((pokemon) => (
                <PokemonCard
                  key={pokemon.pokedex_id}
                  pokemon={pokemon}
                  onClick={() => handlePokemonClick(pokemon)}
                />
              ))}
            </div>

            <GenerationNavigation
              generation={generation}
              onPrevious={handlePreviousGeneration}
              onNext={handleNextGeneration}
              onChange={handleGenerationChange}
              disabled={isLoadingOrFetching}
            />
          </>
        );

      default:
        return null;
    }
  };

  // Fonction pour déterminer le nombre de skeletons selon la taille d'écran
  const getSkeletonCount = (): number => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width <= 480) return 8; // Mobile: 1 colonne, 8 cards
      if (width <= 768) return 10; // Tablet: 2 colonnes, 10 cards
      if (width <= 1024) return 12; // Tablet landscape: 3 colonnes, 12 cards
      return HOME_CONFIG.DEFAULT_SKELETON_COUNT; // Desktop: 4 colonnes, 20 cards
    }
    return HOME_CONFIG.DEFAULT_SKELETON_COUNT;
  };

  return (
    <div className="home">
      <h1 className="title-home">PokéDex</h1>

      <div className="content-container">
        <h2 className="title-generation">Génération {generation}</h2>

        <GenerationNavigation
          generation={generation}
          onPrevious={handlePreviousGeneration}
          onNext={handleNextGeneration}
          onChange={handleGenerationChange}
          disabled={isLoadingOrFetching}
        />

        {renderContent()}
      </div>
    </div>
  );
};

export default Home;
