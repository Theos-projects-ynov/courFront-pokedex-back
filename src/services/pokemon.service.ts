import prisma from '../config/db';
import axios from 'axios';
import { getTyradexPokemonById } from '../api/tyradex';

export async function cacheMovesForPokemon(pokedexId: number) {
  console.log(`[CACHE] Called for pokedexId: ${pokedexId}`);
  const exists = await prisma.pokemonMove.findFirst({ where: { pokemonId: pokedexId } });
  if (exists) {
    console.log(`[CACHE] Moveset already cached for pokedexId: ${pokedexId}`);
    return;
  }

  try {
    const { data } = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokedexId}/`);
    console.log(`[CACHE] PokéAPI response OK for pokedexId: ${pokedexId}`);

    const movesByMoveId = new Map<number, { move: any, level: number }>();

    data.moves.forEach((moveObj: any) => {
      const levelUpDetails = moveObj.version_group_details.filter((v: any) =>
        v.move_learn_method.name === "level-up"
      );
      if (levelUpDetails.length === 0) return;
      const best = levelUpDetails.reduce((a: any, b: any) =>
        a.level_learned_at > b.level_learned_at ? a : b
      );
      if (best.level_learned_at === 0) return;
      const moveId = parseInt(moveObj.move.url.split('/').filter(Boolean).pop());
      movesByMoveId.set(moveId, { move: moveObj.move, level: best.level_learned_at });
    });

    for (const [moveId, { move, level }] of movesByMoveId.entries()) {
      let moveEntry = await prisma.move.findUnique({ where: { id: moveId } });
      if (!moveEntry) {
        const { data: moveData } = await axios.get(move.url);
        moveEntry = await prisma.move.create({
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
      await prisma.pokemonMove.upsert({
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
  } catch (e) {
    console.error(`[CACHE] ERROR fetching PokéAPI for pokedexId ${pokedexId}:`, e);
    throw e;
  }
}

// Ajouter un Pokémon possédé
export async function addOwnedPokemon(data: {
  pokedexId: number;
  trainerId: string;
  boostAtk: number;
  boostDef: number;
  boostRes: number;
  boostPv: number;
  level: number;
  genre: string;
}) {
  return await prisma.ownedPokemon.create({
    data
  });
}

// Lister les Pokémon possédés par un trainer
export async function listOwnedPokemonsByTrainer(trainerId: string) {
  const pokemons = await prisma.ownedPokemon.findMany({
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
  const pokemonsWithData = await Promise.all(
    pokemons.map(async (pokemon) => {
      try {
        const tyradexData = await getTyradexPokemonById(pokemon.pokedexId);
        return {
          ...pokemon,
          name: tyradexData.name,
          types: tyradexData.types,
          sprites: tyradexData.sprites,
          stats: tyradexData.stats
        };
      } catch (error) {
        console.error(`[listOwnedPokemonsByTrainer] Erreur Tyradex pour pokémon ${pokemon.pokedexId}:`, error);
        return {
          ...pokemon,
          name: { fr: "Inconnu", en: "Unknown", jp: "不明" },
          types: [],
          sprites: { regular: "", shiny: "", gmax: null },
          stats: {}
        };
      }
    })
  );

  return pokemonsWithData;
}

// Obtenir un Pokémon possédé par ID
export async function getOwnedPokemonById(id: string, trainerId: string) {
  const pokemon = await prisma.ownedPokemon.findFirst({
    where: { id, trainerId },
    include: {
      pokemonOwnedMoves: {
        include: {
          move: true
        }
      }
    }
  });

  if (!pokemon) return null;

  try {
    const tyradexData = await getTyradexPokemonById(pokemon.pokedexId);
    return {
      ...pokemon,
      name: tyradexData.name,
      types: tyradexData.types,
      sprites: tyradexData.sprites,
      stats: tyradexData.stats
    };
  } catch (error) {
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
export async function getOwnedPokemonWithMoves(id: string) {
  const pokemon = await prisma.ownedPokemon.findUnique({
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
    const tyradexData = await getTyradexPokemonById(pokemon.pokedexId);
    return {
      ...pokemon,
      name: tyradexData.name,
      types: tyradexData.types,
      sprites: tyradexData.sprites,
      stats: tyradexData.stats
    };
  } catch (error) {
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
export async function updateOwnedPokemon(id: string, trainerId: string, updates: any) {
  return await prisma.ownedPokemon.updateMany({
    where: { id, trainerId },
    data: updates
  });
}

// Supprimer un Pokémon possédé
export async function deleteOwnedPokemon(id: string, trainerId: string) {
  return await prisma.ownedPokemon.deleteMany({
    where: { id, trainerId }
  });
}

