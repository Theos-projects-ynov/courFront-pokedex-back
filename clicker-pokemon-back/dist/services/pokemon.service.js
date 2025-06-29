"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheMovesForPokemon = cacheMovesForPokemon;
exports.addOwnedPokemon = addOwnedPokemon;
exports.listOwnedPokemonsByTrainer = listOwnedPokemonsByTrainer;
exports.getOwnedPokemonById = getOwnedPokemonById;
exports.getOwnedPokemonWithMoves = getOwnedPokemonWithMoves;
exports.updateOwnedPokemon = updateOwnedPokemon;
exports.deleteOwnedPokemon = deleteOwnedPokemon;
const db_1 = __importDefault(require("../config/db"));
const axios_1 = __importDefault(require("axios"));
const tyradex_1 = require("../api/tyradex");
async function cacheMovesForPokemon(pokedexId) {
    console.log(`[CACHE] Called for pokedexId: ${pokedexId}`);
    const exists = await db_1.default.pokemonMove.findFirst({ where: { pokemonId: pokedexId } });
    if (exists) {
        console.log(`[CACHE] Moveset already cached for pokedexId: ${pokedexId}`);
        return;
    }
    try {
        const { data } = await axios_1.default.get(`https://pokeapi.co/api/v2/pokemon/${pokedexId}/`);
        console.log(`[CACHE] PokéAPI response OK for pokedexId: ${pokedexId}`);
        const movesByMoveId = new Map();
        data.moves.forEach((moveObj) => {
            const levelUpDetails = moveObj.version_group_details.filter((v) => v.move_learn_method.name === "level-up");
            if (levelUpDetails.length === 0)
                return;
            const best = levelUpDetails.reduce((a, b) => a.level_learned_at > b.level_learned_at ? a : b);
            if (best.level_learned_at === 0)
                return;
            const moveId = parseInt(moveObj.move.url.split('/').filter(Boolean).pop());
            movesByMoveId.set(moveId, { move: moveObj.move, level: best.level_learned_at });
        });
        for (const [moveId, { move, level }] of movesByMoveId.entries()) {
            let moveEntry = await db_1.default.move.findUnique({ where: { id: moveId } });
            if (!moveEntry) {
                const { data: moveData } = await axios_1.default.get(move.url);
                moveEntry = await db_1.default.move.create({
                    data: {
                        id: moveId,
                        name: moveData.name,
                        type: moveData.type.name,
                        power: moveData.power,
                        accuracy: moveData.accuracy,
                        pp: moveData.pp,
                        priority: moveData.priority,
                        damageClass: moveData.damage_class.name
                    }
                });
                console.log(`[CACHE] Move ${moveData.name} (${moveId}) created`);
            }
            await db_1.default.pokemonMove.upsert({
                where: {
                    pokemonId_moveId_level: { pokemonId: pokedexId, moveId, level }
                },
                update: {},
                create: {
                    pokemonId: pokedexId,
                    moveId,
                    level
                }
            });
            console.log(`[CACHE] PokemonMove mapping pokedexId ${pokedexId}, moveId ${moveId}, level ${level} upserted`);
        }
        console.log(`[CACHE] All moves cached for pokedexId: ${pokedexId}`);
    }
    catch (e) {
        console.error(`[CACHE] ERROR fetching PokéAPI for pokedexId ${pokedexId}:`, e);
        throw e;
    }
}
// Ajouter un Pokémon possédé
async function addOwnedPokemon(data) {
    return await db_1.default.ownedPokemon.create({
        data
    });
}
// Lister les Pokémon possédés par un trainer
async function listOwnedPokemonsByTrainer(trainerId) {
    const pokemons = await db_1.default.ownedPokemon.findMany({
        where: { trainerId },
        include: {
            pokemonOwnedMoves: {
                include: {
                    move: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    // Enrichir avec les données Tyradex
    const pokemonsWithData = await Promise.all(pokemons.map(async (pokemon) => {
        try {
            const tyradexData = await (0, tyradex_1.getTyradexPokemonById)(pokemon.pokedexId);
            return {
                ...pokemon,
                name: tyradexData.name,
                types: tyradexData.types,
                sprites: tyradexData.sprites,
                stats: tyradexData.stats
            };
        }
        catch (error) {
            console.error(`[listOwnedPokemonsByTrainer] Erreur Tyradex pour pokémon ${pokemon.pokedexId}:`, error);
            return {
                ...pokemon,
                name: { fr: "Inconnu", en: "Unknown", jp: "不明" },
                types: [],
                sprites: { regular: "", shiny: "", gmax: null },
                stats: {}
            };
        }
    }));
    return pokemonsWithData;
}
// Obtenir un Pokémon possédé par ID
async function getOwnedPokemonById(id, trainerId) {
    const pokemon = await db_1.default.ownedPokemon.findFirst({
        where: { id, trainerId },
        include: {
            pokemonOwnedMoves: {
                include: {
                    move: true
                }
            }
        }
    });
    if (!pokemon)
        return null;
    try {
        const tyradexData = await (0, tyradex_1.getTyradexPokemonById)(pokemon.pokedexId);
        return {
            ...pokemon,
            name: tyradexData.name,
            types: tyradexData.types,
            sprites: tyradexData.sprites,
            stats: tyradexData.stats
        };
    }
    catch (error) {
        console.error(`[getOwnedPokemonById] Erreur Tyradex pour pokémon ${pokemon.pokedexId}:`, error);
        return {
            ...pokemon,
            name: { fr: "Inconnu", en: "Unknown", jp: "不明" },
            types: [],
            sprites: { regular: "", shiny: "", gmax: null },
            stats: {}
        };
    }
}
// Obtenir un Pokémon possédé avec ses attaques
async function getOwnedPokemonWithMoves(id) {
    const pokemon = await db_1.default.ownedPokemon.findUnique({
        where: { id },
        include: {
            pokemonOwnedMoves: {
                include: {
                    move: true
                }
            }
        }
    });
    if (!pokemon) {
        throw { status: 404, message: 'Pokémon non trouvé' };
    }
    try {
        const tyradexData = await (0, tyradex_1.getTyradexPokemonById)(pokemon.pokedexId);
        return {
            ...pokemon,
            name: tyradexData.name,
            types: tyradexData.types,
            sprites: tyradexData.sprites,
            stats: tyradexData.stats
        };
    }
    catch (error) {
        console.error(`[getOwnedPokemonWithMoves] Erreur Tyradex pour pokémon ${pokemon.pokedexId}:`, error);
        return {
            ...pokemon,
            name: { fr: "Inconnu", en: "Unknown", jp: "不明" },
            types: [],
            sprites: { regular: "", shiny: "", gmax: null },
            stats: {}
        };
    }
}
// Modifier un Pokémon possédé
async function updateOwnedPokemon(id, trainerId, updates) {
    return await db_1.default.ownedPokemon.updateMany({
        where: { id, trainerId },
        data: updates
    });
}
// Supprimer un Pokémon possédé
async function deleteOwnedPokemon(id, trainerId) {
    return await db_1.default.ownedPokemon.deleteMany({
        where: { id, trainerId }
    });
}
