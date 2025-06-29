"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMovesIfExists = GetMovesIfExists;
exports.CreateMoveForPokemon = CreateMoveForPokemon;
exports.GetAllMovesForPokemon = GetAllMovesForPokemon;
exports.createMovesForPokemon = createMovesForPokemon;
const pokeapi_1 = require("../api/pokeapi");
const db_1 = __importDefault(require("../config/db"));
// export async function cacheMovesForPokemon(pokedexId: number) {
//   console.log(`[CACHE] Called for pokedexId: ${pokedexId}`);
//   const exists = await prisma.pokemonMove.findFirst({ where: { pokemonId: pokedexId } });
//   if (exists) {
//     console.log(`[CACHE] Moveset already cached for pokedexId: ${pokedexId}`);
//     return exists;
//   }
//   try {
//     const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokedexId}/`);
//     console.log(`[CACHE] PokéAPI response OK for pokedexId: ${pokedexId}`);
//     const movesByMoveId = new Map<number, { move: any, level: number }>();
//     data.moves.forEach((moveObj: any) => {
//       const levelUpDetails = moveObj.version_group_details.filter((v: any) =>
//         v.move_learn_method.name === "level-up"
//       );
//       if (levelUpDetails.length === 0) return;
//       const best = levelUpDetails.reduce((a: any, b: any) =>
//         a.level_learned_at > b.level_learned_at ? a : b
//       );
//       if (best.level_learned_at === 0) return;
//       const moveId = parseInt(moveObj.move.url.split('/').filter(Boolean).pop());
//       movesByMoveId.set(moveId, { move: moveObj.move, level: best.level_learned_at });
//     });
//     for (const [moveId, { move, level }] of movesByMoveId.entries()) {
//       let moveEntry = await prisma.move.findUnique({ where: { id: moveId } });
//       if (!moveEntry) {
//         const { data: moveData } = await axios.get(move.url);
//         moveEntry = await prisma.move.create({
//           data: {
//             id: moveId,
//             name: moveData.name,
//             type: moveData.type.name,
//             power: moveData.power,
//             accuracy: moveData.accuracy,
//             pp: moveData.pp,
//             priority: moveData.priority,
//             damageClass: moveData.damage_class.name
//           }
//         });
//         console.log(`[CACHE] Move ${moveData.name} (${moveId}) created`);
//       }
//       await prisma.pokemonMove.upsert({
//         where: {
//           pokemonId_moveId_level: { pokemonId: pokedexId, moveId, level }
//         },
//         update: {},
//         create: {
//           pokemonId: pokedexId,
//           moveId,
//           level
//         }
//       });
//       console.log(`[CACHE] PokemonMove mapping pokedexId ${pokedexId}, moveId ${moveId}, level ${level} upserted`);
//     }
//     console.log(`[CACHE] All moves cached for pokedexId: ${pokedexId}`);
//   } catch (e) {
//     console.error(`[CACHE] ERROR fetching PokéAPI for pokedexId ${pokedexId}:`, e);
//     throw e;
//   }
// }
async function GetMovesIfExists(pokedexId) {
    console.log(`\x1b[35m[CACHE]\x1b[0m - GetMovesIfExists - Getting all moves for pokedexId: ${pokedexId}`);
    const moves = await db_1.default.pokemonMove.findMany({ where: { pokemonId: pokedexId } });
    if (moves.length === 0) {
        return [];
    }
    return moves;
}
async function CreateMoveForPokemon(idPokemon) {
    const movesForPokemon = await (0, pokeapi_1.getFromPokeAPIMoveByMoveId)(idPokemon);
    // console.log("[CreateMoveForPokemon] - movesForPokemon : ", movesForPokemon);
    const move = await db_1.default.move.create({
        data: {
            id: movesForPokemon.id,
            name: movesForPokemon.name,
            accuracy: movesForPokemon.accuracy,
            power: movesForPokemon.power,
            pp: movesForPokemon.pp,
            priority: movesForPokemon.priority,
            damageClass: movesForPokemon.damageClass,
            type: movesForPokemon.type
        }
    });
    return movesForPokemon;
}
async function GetAllMovesForPokemon(pokedexId, level) {
    const moves = await GetMovesIfExists(pokedexId);
    if (moves.length === 0) {
        const movesFromPokeAPI = await (0, pokeapi_1.getFromPokeAPIMoves)(pokedexId);
        movesFromPokeAPI.map(async (movePokeAPI) => {
            const move = await db_1.default.move.findUnique({ where: { id: movePokeAPI.moveId } });
            if (!move) {
                console.log("[GetAllMovesForPokemon] - move not found in db, creating... : ", movePokeAPI.moveId);
                await CreateMoveForPokemon(movePokeAPI.moveId);
            }
            else {
                console.log("[GetAllMovesForPokemon] - move found in db : ", movePokeAPI.moveId);
            }
            const pokemonMove = await db_1.default.pokemonMove.create({
                data: {
                    pokemonId: pokedexId,
                    moveId: movePokeAPI.moveId,
                    level: movePokeAPI.level
                }
            });
        });
    }
    let movesWithLevel = moves.filter((move) => move.level <= level);
    //take 4 random moves if it possible
    if (movesWithLevel.length > 4) {
        const shuffled = [...movesWithLevel].sort(() => Math.random() - 0.5);
        console.log("[GetAllMovesForPokemon] - shuffled : ");
        movesWithLevel = shuffled.slice(0, 4);
        console.log("[GetAllMovesForPokemon] - randomMoves : ");
    }
    console.log("[GetAllMovesForPokemon] - return movesWithLevel.length : ", movesWithLevel.length);
    return movesWithLevel;
}
async function createMovesForPokemon(trainerId, pokemonId, pokemonOwnedId, level) {
    const moves = await GetAllMovesForPokemon(pokemonId, level);
    console.log("[CreateMovesForPokemon] - moves : ", moves);
    if (moves.length <= 0 || moves.length >= 5) {
        throw new Error("Moves not found");
    }
    console.log("[createMovesForPokemon] - moves : ", moves);
    console.log("[createMovesForPokemon] - trainerId : ", trainerId);
    console.log("[createMovesForPokemon] - pokemonId : ", pokemonId);
    console.log("[createMovesForPokemon] - pokemonOwnedId : ", pokemonOwnedId);
    const createdMoves = await Promise.all(moves.map(async (move) => {
        const pokemonOwnedMove = await db_1.default.pokemonOwnedMove.create({
            data: {
                trainerId: trainerId,
                ownedPokemonId: pokemonOwnedId,
                moveId: move.moveId
            }
        });
        console.log("[createMovesForPokemon] - created move : ", pokemonOwnedMove);
        return pokemonOwnedMove;
    }));
    return createdMoves;
}
