import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ITrainer } from "../../types/Trainer";
import { Pokemon } from "../../service/api";

export interface ReduxTrainer extends ITrainer {
  id: string;
  pokemons: Pokemon[];
}

interface TrainerState {
  trainers: Record<string, ReduxTrainer>;
  activeTrainerId: string | null;
}

const initialState: TrainerState = {
  trainers: {},
  activeTrainerId: null,
};

export const trainerSlice = createSlice({
  name: "trainer",
  initialState,
  reducers: {
    setTrainer: (state, action: PayloadAction<ReduxTrainer>) => {
      const trainer = action.payload;
      state.trainers[trainer.id] = trainer;

      if (Object.keys(state.trainers).length === 1) {
        state.activeTrainerId = trainer.id;
      }
    },

    setActiveTrainer: (state, action: PayloadAction<string>) => {
      if (state.trainers[action.payload]) {
        state.activeTrainerId = action.payload;
      }
    },

    removeTrainer: (state, action: PayloadAction<string>) => {
      delete state.trainers[action.payload];
      if (state.activeTrainerId === action.payload) {
        state.activeTrainerId = Object.keys(state.trainers)[0] || null;
      }
    },

    addPokemonToTrainer: (
      state,
      action: PayloadAction<{ trainerId: string; pokemon: Pokemon }>
    ) => {
      const { trainerId, pokemon } = action.payload;
      if (state.trainers[trainerId]) {
        state.trainers[trainerId].pokemons.push(pokemon);
      }
    },

    removePokemonFromTrainer: (
      state,
      action: PayloadAction<{ trainerId: string; pokemonId: number }>
    ) => {
      const { trainerId, pokemonId } = action.payload;
      if (state.trainers[trainerId]) {
        state.trainers[trainerId].pokemons = state.trainers[
          trainerId
        ].pokemons.filter((p) => p.pokedex_id !== pokemonId);
      }
    },
  },
});

export const {
  setTrainer,
  setActiveTrainer,
  removeTrainer,
  addPokemonToTrainer,
  removePokemonFromTrainer,
} = trainerSlice.actions;

export const selectTrainers = (state: { trainer: TrainerState }) =>
  Object.values(state.trainer.trainers);

export const selectActiveTrainer = (state: { trainer: TrainerState }) =>
  state.trainer.activeTrainerId
    ? state.trainer.trainers[state.trainer.activeTrainerId]
    : null;

export default trainerSlice.reducer;
