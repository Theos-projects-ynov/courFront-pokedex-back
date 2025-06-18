"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFromPokeAPIMoveByMoveId = getFromPokeAPIMoveByMoveId;
exports.getFromPokeAPIMoves = getFromPokeAPIMoves;
const axios_1 = __importDefault(require("axios"));
async function getFromPokeAPIMoveByMoveId(moveId) {
    const res = await axios_1.default.get(`https://pokeapi.co/api/v2/move/${moveId}`);
    const movePokemon = {
        id: res.data.id,
        name: res.data.name,
        type: res.data.type.name,
        power: res.data.power,
        accuracy: res.data.accuracy,
        pp: res.data.pp,
        priority: res.data.priority,
        damageClass: res.data.damage_class.name,
    };
    console.log("[pokeapi.ts] - movePokemon : ", movePokemon);
    return movePokemon;
}
async function getFromPokeAPIMoves(pokemonId) {
    const res = await axios_1.default.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    const resMoves = [];
    const moves = res.data.moves;
    moves.map((move) => {
        // console.log("[pokeapi.ts] - moves : ", move);
        console.log("[pokeapi.ts] - move Split : ", move.move.url.split("/"));
        console.log("[pokeapi.ts] - move Split 2 : ", move.move.url.split("/").pop());
        console.log("[pokeapi.ts] - move : ", move.move.name);
        const moveData = {
            pokemonId: pokemonId,
            moveId: parseInt(move.move.url.split("/")[move.move.url.split("/").length - 2]),
            level: move.version_group_details[0].level_learned_at,
        };
        resMoves.push(moveData);
    });
    console.log("[pokeapi.ts] - res : ", resMoves);
    //   console.log("[pokeapi.ts] - res : ", resMoves);
    return resMoves;
}
