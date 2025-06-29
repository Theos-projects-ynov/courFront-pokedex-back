import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import {
  addPokemon, // <- c'est addPokemon dans le controller, pas addOwnedPokemon !
  listMyPokemons, // idem
  getPokemon,
  updatePokemon,
  deletePokemon,
  getPokemonWithMoves
} from '../controller/pokemon.controller';

const router = Router();

router.post('/', authenticateJWT, addPokemon); // Attraper/ajouter un pokémon
router.get('/', authenticateJWT, listMyPokemons); // Voir tous ses pokémon
router.get('/:id', authenticateJWT, getPokemon); // Détail d'un Pokémon possédé
router.put('/:id', authenticateJWT, updatePokemon); // Modifier boosts/level...
router.delete('/:id', authenticateJWT, deletePokemon); // Supprimer
router.get('/:id/moves', authenticateJWT, getPokemonWithMoves);

export default router;
