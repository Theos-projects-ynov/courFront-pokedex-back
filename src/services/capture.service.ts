import prisma from '../config/db';
import axios from 'axios';
import { createMovesForPokemon } from './move.service';
import { GetAllMovesForPokemon } from './move.service';

export async function getOrCreateWildPokemon(trainerId: string, zone: number) {
  const exist = await prisma.captureAttempt.findUnique({ where: { trainerId } });
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

export async function releaseWildPokemon(trainerId: string, zone: number) {
  // Efface la tentative existante si elle existe (peu importe la zone)
  await prisma.captureAttempt.deleteMany({ where: { trainerId } });

  const { data: pokedexList } = await axios.get(`https://tyradex.app/api/v1/gen/${zone}`);
  if (!Array.isArray(pokedexList) || pokedexList.length === 0)
    throw { status: 404, message: "Aucun pokémon trouvé pour cette zone" };

  const pokedex = pokedexList[Math.floor(Math.random() * pokedexList.length)];
  const level = randomLevel();
  const isShiny = (level >= 10 && Math.floor(Math.random() * 300) === 0);
  const genre = randomGender(pokedex.sexe);

  const capture = await prisma.captureAttempt.create({
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

export async function attemptCapture(trainerId: string, zone: number) {
  const attempt = await prisma.captureAttempt.findUnique({ where: { trainerId, zone } });
  if (!attempt) {
    throw { status: 400, message: "Pas de Pokémon à capturer dans cette zone." };
  }

  const baseRate = (attempt.data as any)?.catch_rate ?? 35;
  const success = Math.random() < baseRate / 255;


  if (!success) {
    return { success: false };
  }

  const owned = await prisma.ownedPokemon.create({
    data: {
      pokedexId: attempt.pokedexId,
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
  
  const moves : object[] = await GetAllMovesForPokemon(attempt.pokedexId, attempt.level);

  // console.log("[capture] - moves 2 : ", moves);
  
  await createMovesForPokemon(trainerId, attempt.pokedexId, owned.id, attempt.level);
  
  // Supprimer l'ancienne tentative et générer un nouveau pokemon sauvage
  await prisma.captureAttempt.deleteMany({ where: { trainerId } });
  const newWildPokemon = await generateNewWildPokemon(trainerId, zone);
  
  return { 
    success: true, 
    ownedPokemon: owned,
    nextWildPokemon: newWildPokemon
  };
}

// Fonction helper pour générer un nouveau pokemon sauvage
async function generateNewWildPokemon(trainerId: string, zone: number) {
  const { data: pokedexList } = await axios.get(`https://tyradex.app/api/v1/gen/${zone}`);
  if (!Array.isArray(pokedexList) || pokedexList.length === 0)
    throw { status: 404, message: "Aucun pokémon trouvé pour cette zone" };

  const pokedex = pokedexList[Math.floor(Math.random() * pokedexList.length)];
  const level = randomLevel();
  const isShiny = (level >= 10 && Math.floor(Math.random() * 300) === 0);
  const genre = randomGender(pokedex.sexe);

  const capture = await prisma.captureAttempt.create({
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

// --- Utils ---
function randomLevel() {
  let lvl;
  do {
    lvl = Math.floor(Math.random() * 60) + 1;
  } while (
    lvl > 59 && Math.random() > 1/4000 ||
    lvl > 50 && Math.random() > 1/500 ||
    lvl > 40 && Math.random() > 1/200
  );
  return lvl;
}


function randomGender(sexeObj: { male?: number; female?: number }) {
  if (!sexeObj || (sexeObj.male === 0 && sexeObj.female === 0))
    return "unknown";
  if (sexeObj.male == null || sexeObj.female == null)
    return "unknown";
  const total = sexeObj.male + sexeObj.female;
  if (total === 0) return "unknown";
  const roll = Math.random() * total;
  return roll < sexeObj.male ? "male" : "female";
}
