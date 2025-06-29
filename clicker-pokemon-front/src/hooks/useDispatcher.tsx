import { useDispatch } from "react-redux";
import {
  setTrainer,
  setActiveTrainer,
  removeTrainer,
  addPokemonToTrainer,
  removePokemonFromTrainer,
  ReduxTrainer,
} from "../store/slices/trainer-slice";
import { IPokemon } from "../types/Pokemon";

export const useDispatcher = () => {
  const dispatch = useDispatch();

  return {
    setTrainer: (trainer: ReduxTrainer) => {
      dispatch(setTrainer(trainer));
    },

    setActiveTrainer: (trainerId: string) => {
      dispatch(setActiveTrainer(trainerId));
    },

    removeTrainer: (trainerId: string) => {
      dispatch(removeTrainer(trainerId));
    },

    addPokemonToTrainer: (trainerId: string, pokemon: IPokemon) => {
      dispatch(addPokemonToTrainer({ trainerId, pokemon }));
    },

    /**
     * Supprime un pokémon d'un dresseur
     */
    removePokemonFromTrainer: (trainerId: string, pokemonId: number) => {
      dispatch(removePokemonFromTrainer({ trainerId, pokemonId }));
    },

    /**
     * Crée un nouveau dresseur
     */

    createTrainer: (name: string, region: string = "") => {
      const timestamp = Date.now();
      const randomNum = Math.random();

      const newTrainer: ReduxTrainer = {
        id: crypto.randomUUID(),
        name,
        region,
        pokemons: [],

        age: 10,
        money: 1000,
        level: 1,
        exp: 0,
        gender: "Homme",
        height: 170,
        weight: 60,
        description: `${name} est un dresseur de la région ${region}.`,
        image: `https://cataas.com/cat?t=${timestamp}&rand=${randomNum}`,
      };

      dispatch(setTrainer(newTrainer));
      return newTrainer.id;
    },
  };
};
