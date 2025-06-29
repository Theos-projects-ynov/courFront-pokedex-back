"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTrainer = registerTrainer;
exports.loginTrainer = loginTrainer;
exports.getTrainerProfile = getTrainerProfile;
const db_1 = __importDefault(require("../config/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tyradex_1 = require("../api/tyradex");
const JWT_SECRET = process.env.JWT_SECRET || 'ultrasecret';
async function registerTrainer(data) {
    const { email, password, isAdmin = false, pokemonStarter, teamPokemon, pokemons, badge, ...trainerData } = data;
    if (!email || !password || !trainerData.name) {
        throw { status: 400, message: 'Champs obligatoires manquants' };
    }
    const exists = await db_1.default.trainer.findUnique({ where: { email } });
    if (exists)
        throw { status: 409, message: 'Email déjà utilisé' };
    const hash = await bcrypt_1.default.hash(password, 10);
    const trainer = await db_1.default.trainer.create({
        data: {
            ...trainerData,
            email,
            password: hash,
            isAdmin,
            badge: badge || [],
            pokemonStarter: pokemonStarter || undefined,
            teamPokemon: teamPokemon || undefined,
        }
    });
    // Par sécurité, ne retourne jamais le hash !
    return {
        id: trainer.id,
        email: trainer.email,
        name: trainer.name,
        region: trainer.region,
        level: trainer.level,
        image: trainer.image,
        isAdmin: trainer.isAdmin
    };
}
async function loginTrainer({ email, password }) {
    const trainer = await db_1.default.trainer.findUnique({ where: { email } });
    if (!trainer)
        throw { status: 401, message: 'Trainer non trouvé' };
    const ok = await bcrypt_1.default.compare(password, trainer.password);
    if (!ok)
        throw { status: 401, message: 'Mot de passe incorrect' };
    const token = jsonwebtoken_1.default.sign({
        id: trainer.id,
        email: trainer.email,
        name: trainer.name,
        level: trainer.level,
        isAdmin: trainer.isAdmin
    }, JWT_SECRET, { expiresIn: '7d' });
    return {
        token,
        trainer: {
            id: trainer.id,
            name: trainer.name,
            email: trainer.email,
            level: trainer.level,
            region: trainer.region,
            image: trainer.image,
            isAdmin: trainer.isAdmin
        }
    };
}
// Optionnel : obtenir le profil du trainer connecté
async function getTrainerProfile(id) {
    // id doit être une string UUID (ex: "c870abcf-cd4a-4a28-a366-0f14e7ef6ec0")
    try {
        const trainer = await db_1.default.trainer.findUnique({
            where: { id }, // surtout pas id: 1 (number) !
            select: {
                id: true,
                name: true,
                email: true,
                region: true,
                level: true,
                exp: true,
                gender: true,
                height: true,
                weight: true,
                description: true,
                image: true,
                badge: true,
                pokemonStarter: true,
                teamPokemon: true,
                isAdmin: true,
                createdAt: true,
                pokemons: {
                    select: {
                        id: true,
                        pokedexId: true,
                        boostAtk: true,
                        boostDef: true,
                        boostRes: true,
                        boostPv: true,
                        level: true,
                        genre: true,
                        createdAt: true,
                        pokemonOwnedMoves: {
                            select: {
                                id: true,
                                moveId: true,
                                move: {
                                    select: {
                                        name: true,
                                        type: true,
                                        power: true,
                                        accuracy: true,
                                        pp: true,
                                        damageClass: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!trainer)
            throw { status: 404, message: "Trainer non trouvé" };
        // Enrichir les pokémons avec leurs noms depuis Tyradex
        const pokemonsWithNames = await Promise.all(trainer.pokemons.map(async (pokemon) => {
            try {
                const tyradexData = await (0, tyradex_1.getTyradexPokemonById)(pokemon.pokedexId);
                return {
                    ...pokemon,
                    name: tyradexData.name,
                    types: tyradexData.types,
                    sprites: tyradexData.sprites
                };
            }
            catch (error) {
                console.error(`[getTrainerProfile] Erreur Tyradex pour pokémon ${pokemon.pokedexId}:`, error);
                return {
                    ...pokemon,
                    name: { fr: "Inconnu", en: "Unknown", jp: "不明" },
                    types: [],
                    sprites: { regular: "", shiny: "", gmax: null }
                };
            }
        }));
        return {
            ...trainer,
            pokemons: pokemonsWithNames
        };
    }
    catch (e) {
        console.log("[getTrainerProfile] - error : ", e);
        throw { status: 500, message: 'Erreur serveur' };
    }
}
