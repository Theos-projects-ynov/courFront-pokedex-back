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
  // Augmentation du taux de capture de 50%
  const captureRate = Math.min((baseRate / 255) * 1.5, 0.95); // Cap à 95% max
  const capturePercentage = (captureRate * 100).toFixed(1);
  
  console.log(`[CAPTURE] Taux de capture: ${capturePercentage}% (base: ${baseRate}/255)`);
  
  const success = Math.random() < captureRate;


  if (!success) {
    return { 
      success: false,
      pokemon: {
        name: (attempt.data as any)?.name?.fr || (attempt.data as any)?.name?.en || 'Pokémon inconnu',
        level: attempt.level,
        image: (attempt.data as any)?.sprites?.regular || null,
        isShiny: attempt.isShiny,
        genre: attempt.genre,
        pokedexId: attempt.pokedexId
      }
    };
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
  console.log("[capture] - attempt.pokedexId : ", attempt.pokedexId);
  console.log("[capture] - attempt.data : ", attempt.data);
  
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
