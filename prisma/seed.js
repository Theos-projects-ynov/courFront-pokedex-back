const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding dungeons...');

  // Créer les donjons de base
  const dungeons = [
    {
      id: 1,
      name: "Donjon de mew",
      description: "Une forêt mystérieuse où les Pokémon de type Plante prospèrent.",
      rewards: "Potion x3, Super Ball x2, 500 Gold",
      bossPokemonId: 151, // Mew
      bossLevel: 25,
      spawnLevels: [15, 17, 20],
      isActive: true
    },
    {
      id: 2,
      name: "Caverne de Glace",
      description: "Une caverne glacée peuplée de Pokémon de type Glace.",
      rewards: "Hyper Potion x2, Ultra Ball x1, Pierre Glace, 750 Gold",
      bossPokemonId: 144, // Articuno
      bossLevel: 35,
      spawnLevels: [20, 25, 30],
      isActive: true
    },
    {
      id: 3,
      name: "Volcan Ardent",
      description: "Un volcan actif où vivent les Pokémon de type Feu les plus puissants.",
      rewards: "Max Potion x1, Master Ball x1, Pierre Feu, 1000 Gold",
      bossPokemonId: 146, // Moltres
      bossLevel: 45,
      spawnLevels: [25, 30, 35],
      isActive: true
    }
  ];

  for (const dungeonData of dungeons) {
    const dungeon = await prisma.dungeon.upsert({
      where: { id: dungeonData.id },
      update: dungeonData,
      create: dungeonData
    });
    console.log(`✅ Donjon créé/mis à jour: ${dungeon.name}`);
  }

  console.log('🎉 Seeding terminé !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 