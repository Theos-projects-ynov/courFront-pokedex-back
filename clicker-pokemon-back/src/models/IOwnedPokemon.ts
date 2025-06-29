export type IOwnedPokemon = {
  id: string;           // UUID généré par Prisma
  pokedexId: number;    // ID du Pokédex (pour fetch sur Tyradex)
  trainerId: string;    // UUID du dresseur
  boostAtk: number;
  boostDef: number;
  boostRes: number;
  boostPv: number;
  level: number;
  genre: "male" | "female" | "unknown";
  createdAt?: Date;
};
