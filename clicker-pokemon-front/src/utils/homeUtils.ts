// Utilitaires pour la génération
export const isValidGeneration = (gen: number): boolean => {
  return gen >= 1 && gen <= 9;
};

export const getGenerationTitle = (generation: number): string => {
  return `PokéDex - Génération ${generation}`;
};

// Calcul de l'état de chargement
export const getLoadingState = (
  isLoading: boolean,
  isFetching: boolean,
  isError: boolean,
  hasData: boolean
) => {
  if (isLoading) return "loading";
  if (isFetching) return "fetching";
  if (isError || !hasData) return "error";
  return "success";
}; 