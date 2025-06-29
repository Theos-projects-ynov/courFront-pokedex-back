"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateWildPokemon = getOrCreateWildPokemon;
exports.releaseWildPokemon = releaseWildPokemon;
exports.attemptCapture = attemptCapture;
const db_1 = __importDefault(require("../config/db"));
const axios_1 = __importDefault(require("axios"));
const move_service_1 = require("./move.service");
const move_service_2 = require("./move.service");
async function getOrCreateWildPokemon(trainerId, zone) {
    const exist = await db_1.default.captureAttempt.findUnique({ where: { trainerId } });
    if (exist && exist.zone === zone) {
        return {
            zone: exist.zone,
            pokedexId: exist.pokedexId,
            level: exist.level,
            isShiny: exist.isShiny,
            genre: exist.genre,
            pokemon: exist.data
        };
    }
    // Si exist mais dans une autre zone, on peut décider de le release automatiquement ou d'envoyer une erreur
    return await releaseWildPokemon(trainerId, zone);
}
async function releaseWildPokemon(trainerId, zone) {
    // Efface la tentative existante si elle existe (peu importe la zone)
    await db_1.default.captureAttempt.deleteMany({ where: { trainerId } });
    const { data: pokedexList } = await axios_1.default.get(`https://tyradex.app/api/v1/gen/${zone}`);
    if (!Array.isArray(pokedexList) || pokedexList.length === 0)
        throw { status: 404, message: "Aucun pokémon trouvé pour cette zone" };
    const pokedex = pokedexList[Math.floor(Math.random() * pokedexList.length)];
    const level = randomLevel();
    const isShiny = (level >= 10 && Math.floor(Math.random() * 300) === 0);
    const genre = randomGender(pokedex.sexe);
    const capture = await db_1.default.captureAttempt.create({
        data: {
            trainerId,
            zone,
            pokedexId: pokedex.pokedex_id,
            level,
            isShiny,
            genre,
            data: pokedex
        }
    });
    return {
        zone,
        pokedexId: pokedex.pokedex_id,
        level,
        isShiny,
        genre,
        pokemon: pokedex
    };
}
async function attemptCapture(trainerId, zone) {
    const attempt = await db_1.default.captureAttempt.findUnique({ where: { trainerId, zone } });
    if (!attempt) {
        throw { status: 400, message: "Pas de Pokémon à capturer dans cette zone." };
    }
    const baseRate = attempt.data?.catch_rate ?? 35;
    const success = Math.random() < baseRate / 255;
    if (!success) {
        return { success: false };
    }
    const owned = await db_1.default.ownedPokemon.create({
        data: {
            pokedexId: 1,
            trainerId,
            boostAtk: 0,
            boostDef: 0,
            boostRes: 0,
            boostPv: 0,
            level: attempt.level,
            genre: attempt.genre
        }
    });
    console.log("[capture] - owned : ", owned);
    const moves = await (0, move_service_2.GetAllMovesForPokemon)(1, attempt.level);
    // console.log("[capture] - moves 2 : ", moves);
    (0, move_service_1.createMovesForPokemon)(trainerId, 1, owned.id, attempt.level);
    return { success: true, ownedPokemon: owned };
}
// --- Utils ---
function randomLevel() {
    let lvl;
    do {
        lvl = Math.floor(Math.random() * 60) + 1;
    } while (lvl > 59 && Math.random() > 1 / 4000 ||
        lvl > 50 && Math.random() > 1 / 500 ||
        lvl > 40 && Math.random() > 1 / 200);
    return lvl;
}
function randomGender(sexeObj) {
    if (!sexeObj || (sexeObj.male === 0 && sexeObj.female === 0))
        return "unknown";
    if (sexeObj.male == null || sexeObj.female == null)
        return "unknown";
    const total = sexeObj.male + sexeObj.female;
    if (total === 0)
        return "unknown";
    const roll = Math.random() * total;
    return roll < sexeObj.male ? "male" : "female";
}
