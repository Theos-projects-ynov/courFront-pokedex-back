"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPokemonByNameOrId = getPokemonByNameOrId;
exports.getTyradexPokemonById = getTyradexPokemonById;
const axios_1 = __importDefault(require("axios"));
const TYRADEX_BASE_URL = 'https://tyradex.app/api/v1';
// Récupérer les infos d'un Pokémon par nom (français) ou ID
async function getPokemonByNameOrId(nameOrId) {
    const url = `${TYRADEX_BASE_URL}/pokemon/${nameOrId}`;
    const res = await axios_1.default.get(url);
    return res.data;
}
// Fonction spécifique pour récupérer un Pokémon par ID avec gestion d'erreur
async function getTyradexPokemonById(pokedexId) {
    try {
        console.log(`[TYRADEX] Fetching pokemon with ID: ${pokedexId}`);
        const pokemon = await getPokemonByNameOrId(pokedexId);
        console.log(`[TYRADEX] Successfully fetched: ${pokemon.name.fr} (${pokemon.name.en})`);
        return pokemon;
    }
    catch (error) {
        console.error(`[TYRADEX] Error fetching pokemon ${pokedexId}:`, error);
        throw new Error(`Impossible de récupérer le Pokémon avec l'ID ${pokedexId} depuis Tyradex`);
    }
}
// Exemple d'autres endpoints Tyradex si besoin : 
// - https://tyradex.app/api/v1/pokemon
// - https://tyradex.app/api/v1/types
