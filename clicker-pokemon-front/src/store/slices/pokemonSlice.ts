import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPokemon } from '../../types/Pokemon';

interface PokemonState {
  cache: {
    [key: number]: IPokemon[];
  };
}

const initialState: PokemonState = {
  cache: {},
};

const pokemonSlice = createSlice({
  name: 'pokemon',
  initialState,
  reducers: {
    addToCache: (state, action: PayloadAction<{ generation: number; pokemons: IPokemon[] }>) => {
      state.cache[action.payload.generation] = action.payload.pokemons;
    },
  },
});

export const { addToCache } = pokemonSlice.actions;
export default pokemonSlice.reducer; 