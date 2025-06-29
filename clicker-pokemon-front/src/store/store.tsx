import { configureStore } from "@reduxjs/toolkit";
import trainerReducer from "./slices/trainer-slice";
import { pokemonApi } from "../api/PokemonAPI";
import { authAPI } from "../api/AuthAPI";

export const store = configureStore({
  reducer: {
    trainer: trainerReducer,
    [pokemonApi.reducerPath]: pokemonApi.reducer,
    [authAPI.reducerPath]: authAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(pokemonApi.middleware)
      .concat(authAPI.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
