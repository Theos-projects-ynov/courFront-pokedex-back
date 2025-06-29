"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const pokemon_controller_1 = require("../controller/pokemon.controller");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticateJWT, pokemon_controller_1.addPokemon); // Attraper/ajouter un pokémon
router.get('/', auth_1.authenticateJWT, pokemon_controller_1.listMyPokemons); // Voir tous ses pokémon
router.get('/:id', auth_1.authenticateJWT, pokemon_controller_1.getPokemon); // Détail d'un Pokémon possédé
router.put('/:id', auth_1.authenticateJWT, pokemon_controller_1.updatePokemon); // Modifier boosts/level...
router.delete('/:id', auth_1.authenticateJWT, pokemon_controller_1.deletePokemon); // Supprimer
router.get('/:id/moves', auth_1.authenticateJWT, pokemon_controller_1.getPokemonWithMoves);
exports.default = router;
