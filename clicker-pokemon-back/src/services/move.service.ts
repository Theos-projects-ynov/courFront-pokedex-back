import { getFromPokeAPIMoveByMoveId, getFromPokeAPIMoves } from '../api/pokeapi';
import prisma from '../config/db';

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


export async function GetMovesIfExists(pokedexId: number) {
  console.log(`\x1b[35m[CACHE]\x1b[0m - GetMovesIfExists - Getting all moves for pokedexId: ${pokedexId}`);
  const moves = await prisma.pokemonMove.findMany({ where: { pokemonId: pokedexId } });

  if (moves.length === 0) {
    return [];
  }
  
  return moves;
}


export async function CreateMoveForPokemon(idPokemon: number) {
  const movesForPokemon = await getFromPokeAPIMoveByMoveId(idPokemon);
  // console.log("[CreateMoveForPokemon] - movesForPokemon : ", movesForPokemon);

  const move = await prisma.move.create({
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

export async function GetAllMovesForPokemon(pokedexId: number, level: number) {
  console.log(`[GetAllMovesForPokemon] Starting for pokedexId: ${pokedexId}, level: ${level}`);
  
  let moves = await GetMovesIfExists(pokedexId);

  if (moves.length === 0) {
    console.log(`[GetAllMovesForPokemon] No moves cached, fetching from PokeAPI...`);
    const movesFromPokeAPI = await getFromPokeAPIMoves(pokedexId);
    
    // Traiter les moves séquentiellement pour éviter les conflits
    for (const movePokeAPI of movesFromPokeAPI) {
      try {
        // Vérifier/créer le move dans la table Move
        const move = await prisma.move.findUnique({ where: { id: (movePokeAPI as any).moveId } });
      if (!move) {
          console.log("[GetAllMovesForPokemon] - move not found in db, creating... : ", (movePokeAPI as any).moveId);
          await CreateMoveForPokemon((movePokeAPI as any).moveId);
      } else {
          console.log("[GetAllMovesForPokemon] - move found in db : ", (movePokeAPI as any).moveId);
      }

        // Utiliser upsert pour éviter les doublons
        await prisma.pokemonMove.upsert({
          where: {
            pokemonId_moveId_level: {
              pokemonId: pokedexId,
              moveId: (movePokeAPI as any).moveId,
              level: (movePokeAPI as any).level
            }
          },
          update: {}, // Ne rien mettre à jour si existe déjà
          create: {
          pokemonId: pokedexId,
            moveId: (movePokeAPI as any).moveId,
            level: (movePokeAPI as any).level
        }
      });
      } catch (error) {
        console.error(`[GetAllMovesForPokemon] Error processing move ${(movePokeAPI as any).moveId}:`, error);
      }
    }
    
    // Récupérer les moves maintenant qu'ils sont créés
    moves = await GetMovesIfExists(pokedexId);
  }

  // Filtrer par level (inclure les moves de level 0 qui sont des TM/TR)
  let movesWithLevel = moves.filter((move) => move.level === 0 || move.level <= level);

  // Prendre 4 moves aléatoires si plus de 4
  if (movesWithLevel.length > 4) {
    const shuffled = [...movesWithLevel].sort(() => Math.random() - 0.5);
    console.log("[GetAllMovesForPokemon] - shuffled moves, taking 4 random");
    movesWithLevel = shuffled.slice(0, 4);
  }

  console.log("[GetAllMovesForPokemon] - return movesWithLevel.length : ", movesWithLevel.length);

  return movesWithLevel;
}

export async function createMovesForPokemon(trainerId: string, pokemonId: number, pokemonOwnedId: string, level: number) {
  const moves = await GetAllMovesForPokemon(pokemonId, level);
  console.log("[CreateMovesForPokemon] - moves : ", moves);

  if (moves.length <= 0 || moves.length >= 5) {
    throw new Error("Moves not found");    
  } 

  console.log("[createMovesForPokemon] - moves : ", moves);
  console.log("[createMovesForPokemon] - trainerId : ", trainerId);
  console.log("[createMovesForPokemon] - pokemonId : ", pokemonId);
  console.log("[createMovesForPokemon] - pokemonOwnedId : ", pokemonOwnedId);
  
  const createdMoves = [];
  
  for (const move of moves) {
    console.log("[createMovesForPokemon] - creating move : ", move);

      const pokemonOwnedMove = await prisma.pokemonOwnedMove.create({
        data: {
          trainerId: trainerId,
          ownedPokemonId: pokemonOwnedId,
          moveId: move.moveId
        } 
      });
      console.log("[createMovesForPokemon] - created move : ", pokemonOwnedMove);
    createdMoves.push(pokemonOwnedMove);
  }

  return createdMoves;
}
