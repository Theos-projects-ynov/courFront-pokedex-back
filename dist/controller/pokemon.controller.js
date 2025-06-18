"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPokemon = addPokemon;
exports.listMyPokemons = listMyPokemons;
exports.getPokemon = getPokemon;
exports.getPokemonWithMoves = getPokemonWithMoves;
exports.updatePokemon = updatePokemon;
exports.deletePokemon = deletePokemon;
const pokemonService = __importStar(require("../services/pokemon.service"));
// Ajouter un Pokémon possédé (capture)
async function addPokemon(req, res) {
    try {
        const trainerId = req.trainer.id;
        const { pokedexId, boostAtk, boostDef, boostRes, boostPv, level, genre } = req.body;
        const pokemon = await pokemonService.addOwnedPokemon({
            pokedexId,
            trainerId,
            boostAtk,
            boostDef,
            boostRes,
            boostPv,
            level,
            genre
        });
        return res.status(201).json(pokemon);
    }
    catch (e) {
        return res.status(400).json({ message: e.message });
    }
}
// Liste tous les Pokémon du trainer connecté
async function listMyPokemons(req, res) {
    try {
        const trainerId = req.trainer.id;
        const pokemons = await pokemonService.listOwnedPokemonsByTrainer(trainerId);
        return res.json(pokemons);
    }
    catch (e) {
        return res.status(400).json({ message: e.message });
    }
}
// Voir un Pokémon précis
async function getPokemon(req, res) {
    try {
        const trainerId = req.trainer.id;
        const { id } = req.params;
        const pokemon = await pokemonService.getOwnedPokemonById(id, trainerId);
        if (!pokemon)
            return res.status(404).json({ message: 'Non trouvé' });
        return res.json(pokemon);
    }
    catch (e) {
        return res.status(400).json({ message: e.message });
    }
}
// Voir les moves d'un Pokémon possédé
async function getPokemonWithMoves(req, res) {
    try {
        const { id } = req.params;
        const result = await pokemonService.getOwnedPokemonWithMoves(id);
        return res.json(result);
    }
    catch (e) {
        return res.status(e.status || 500).json({ message: e.message || 'Erreur serveur' });
    }
}
// Modifier un Pokémon
async function updatePokemon(req, res) {
    try {
        const trainerId = req.trainer.id;
        const { id } = req.params;
        const updates = req.body;
        const result = await pokemonService.updateOwnedPokemon(id, trainerId, updates);
        if (result.count === 0)
            return res.status(404).json({ message: 'Non trouvé ou pas autorisé' });
        return res.json({ success: true });
    }
    catch (e) {
        return res.status(400).json({ message: e.message });
    }
}
// Supprimer un Pokémon
async function deletePokemon(req, res) {
    try {
        const trainerId = req.trainer.id;
        const { id } = req.params;
        const result = await pokemonService.deleteOwnedPokemon(id, trainerId);
        if (result.count === 0)
            return res.status(404).json({ message: 'Non trouvé ou pas autorisé' });
        return res.json({ success: true });
    }
    catch (e) {
        return res.status(400).json({ message: e.message });
    }
}
