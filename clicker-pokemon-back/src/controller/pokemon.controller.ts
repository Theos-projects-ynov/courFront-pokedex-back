import { Request, Response } from 'express';
import * as pokemonService from '../services/pokemon.service';

// Ajouter un Pokémon possédé (capture)
export async function addPokemon(req: Request, res: Response) {
  try {
    const trainerId = (req as any).trainer.id;
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
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
}

// Liste tous les Pokémon du trainer connecté
export async function listMyPokemons(req: Request, res: Response) {
  try {
    const trainerId = (req as any).trainer.id;
    const pokemons = await pokemonService.listOwnedPokemonsByTrainer(trainerId);
    return res.json(pokemons);
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
}

// Voir un Pokémon précis
export async function getPokemon(req: Request, res: Response) {
  try {
    const trainerId = (req as any).trainer.id;
    const { id } = req.params;
    const pokemon = await pokemonService.getOwnedPokemonById(id, trainerId);
    if (!pokemon) return res.status(404).json({ message: 'Non trouvé' });
    return res.json(pokemon);
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
}

// Voir les moves d'un Pokémon possédé
export async function getPokemonWithMoves(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await pokemonService.getOwnedPokemonWithMoves(id);
    return res.json(result);
  } catch (e: any) {
    return res.status(e.status || 500).json({ message: e.message || 'Erreur serveur' });
  }
}

// Modifier un Pokémon
export async function updatePokemon(req: Request, res: Response) {
  try {
    const trainerId = (req as any).trainer.id;
    const { id } = req.params;
    const updates = req.body;
    const result = await pokemonService.updateOwnedPokemon(id, trainerId, updates);
    if (result.count === 0) return res.status(404).json({ message: 'Non trouvé ou pas autorisé' });
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
}

// Supprimer un Pokémon
export async function deletePokemon(req: Request, res: Response) {
  try {
    const trainerId = (req as any).trainer.id;
    const { id } = req.params;
    const result = await pokemonService.deleteOwnedPokemon(id, trainerId);
    if (result.count === 0) return res.status(404).json({ message: 'Non trouvé ou pas autorisé' });
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
}
