import prisma from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // <--- manquait ici !
import { ITrainer } from '../models/ITrainer';

const JWT_SECRET = process.env.JWT_SECRET || 'ultrasecret';

export async function registerTrainer(data: ITrainer & { email: string; password: string }) {
  const { email, password, ...trainerData } = data;

  if (!email || !password || !trainerData.name) {
    throw { status: 400, message: 'Champs obligatoires manquants' };
  }

  const exists = await prisma.trainer.findUnique({ where: { email } });
  if (exists) throw { status: 409, message: 'Email déjà utilisé' };

  const hash = await bcrypt.hash(password, 10);

  const trainer = await prisma.trainer.create({
    data: {
      ...trainerData,
      email,
      password: hash,
      badge: trainerData.badge || [],
      pokemonStarter: trainerData.pokemonStarter || null,
      pokemons: trainerData.pokemons || [],
      teamPokemon: trainerData.teamPokemon || [],
    }
  });

  return {
    id: trainer.id,
    email: trainer.email,
    name: trainer.name,
    region: trainer.region,
    image: trainer.image,
  };
}

// AJOUTE CETTE FONCTION :
export async function loginTrainer({ email, password }: { email: string; password: string }) {
  const trainer = await prisma.trainer.findUnique({ where: { email } });
  if (!trainer) throw { status: 401, message: 'Trainer non trouvé' };

  const ok = await bcrypt.compare(password, trainer.password);
  if (!ok) throw { status: 401, message: 'Mot de passe incorrect' };

  const token = jwt.sign(
    { id: trainer.id, email: trainer.email, name: trainer.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    trainer: {
      id: trainer.id,
      name: trainer.name,
      email: trainer.email,
      region: trainer.region,
      image: trainer.image
    }
  };
}
