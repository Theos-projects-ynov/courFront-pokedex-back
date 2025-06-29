import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IPokemon } from "../types/Pokemon";
import type { AppDispatch } from "../store/store";
import type { Trainer } from "../types/Trainer";

export const pokemonApi = createApi({
  reducerPath: "pokemonApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://tyradex.app/api/v1/" }),
  tagTypes: ["PokemonGen", "Pokemon", "TrainerProfile"],
  keepUnusedDataFor: 300,
  refetchOnReconnect: false,
  refetchOnMountOrArgChange: false,

  endpoints: (builder) => ({
    getPokemonByGeneration: builder.query<IPokemon[], number>({
      query: (gen) => `gen/${gen}`,
      providesTags: (result, error, gen) => [
        { type: "PokemonGen", id: gen },
        "PokemonGen"
      ],
      keepUnusedDataFor: 604800, // 1 semaine de cache (7j × 24h × 60min × 60s)
    }),

    getPokemon: builder.query<IPokemon, string>({
      query: (id) => `pokemon/${id}`,
      providesTags: (result, error, id) => [
        { type: "Pokemon", id },
        "Pokemon"
      ],
      keepUnusedDataFor: 604800, // 1 semaine de cache (7j × 24h × 60min × 60s)
    }),

    // Endpoint pour les données du profil avec cache 24h
    getTrainerProfile: builder.query<Trainer, void>({
      queryFn: async () => {
        // Utilise le service existant pour récupérer les données
        const { AuthService } = await import("../service/authService");
        try {
          const data = await AuthService.getTrainerProfile();
          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error instanceof Error ? error.message : 'Erreur profil' } };
        }
      },
      providesTags: ["TrainerProfile"],
      keepUnusedDataFor: 86400, // 24 heures de cache (24h × 60min × 60s)
    }),

    // Exemple de mutation qui invalide le cache
    refreshPokemonData: builder.mutation<void, void>({
      queryFn: () => ({ data: undefined }),
      // Invalide TOUT le cache Pokemon
      invalidatesTags: ["PokemonGen", "Pokemon"],
    }),

    // Exemple pour invalider seulement une génération spécifique
    refreshGeneration: builder.mutation<void, number>({
      queryFn: () => ({ data: undefined }),
      invalidatesTags: (result, error, gen) => [
        { type: "PokemonGen", id: gen }
      ],
    }),

    // Invalider le profil après capture/recherche
    invalidateTrainerProfile: builder.mutation<void, void>({
      queryFn: () => ({ data: undefined }),
      invalidatesTags: ["TrainerProfile"],
    }),
  }),
});

export const { 
  useGetPokemonByGenerationQuery, 
  useGetPokemonQuery,
  useGetTrainerProfileQuery,
  useRefreshPokemonDataMutation,
  useRefreshGenerationMutation,
  useInvalidateTrainerProfileMutation
} = pokemonApi;

// Utilitaires pour gérer le cache manuellement
export const pokemonCacheUtils = {
  // Invalider tout le cache
  invalidateAll: (dispatch: AppDispatch) => {
    dispatch(pokemonApi.util.invalidateTags(["PokemonGen", "Pokemon", "TrainerProfile"]));
  },

  // Invalider une génération spécifique
  invalidateGeneration: (dispatch: AppDispatch, gen: number) => {
    dispatch(pokemonApi.util.invalidateTags([{ type: "PokemonGen", id: gen }]));
  },

  // Invalider un Pokémon spécifique
  invalidatePokemon: (dispatch: AppDispatch, id: string) => {
    dispatch(pokemonApi.util.invalidateTags([{ type: "Pokemon", id }]));
  },

  // Invalider le profil du dresseur
  invalidateTrainerProfile: (dispatch: AppDispatch) => {
    dispatch(pokemonApi.util.invalidateTags(["TrainerProfile"]));
  },

  // Supprimer complètement le cache (reset total)
  resetCache: (dispatch: AppDispatch) => {
    dispatch(pokemonApi.util.resetApiState());
  },

  // Prefetch une génération (mettre en cache avant d'en avoir besoin)
  prefetchGeneration: (dispatch: AppDispatch, gen: number) => {
    dispatch(pokemonApi.util.prefetch('getPokemonByGeneration', gen, { force: false }));
  }
};
