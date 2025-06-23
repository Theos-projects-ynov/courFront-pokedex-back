-- CreateTable
CREATE TABLE "Dungeon" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rewards" TEXT NOT NULL,
    "bossPokemonId" INTEGER NOT NULL,
    "bossLevel" INTEGER NOT NULL,
    "spawnLevels" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dungeon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DungeonSession" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "dungeonId" INTEGER NOT NULL,
    "selectedPokemon" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "defeatedEnemies" INTEGER NOT NULL DEFAULT 0,
    "enemyPokemons" JSONB,
    "currentBattleId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DungeonSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DungeonSession_trainerId_key" ON "DungeonSession"("trainerId");

-- AddForeignKey
ALTER TABLE "DungeonSession" ADD CONSTRAINT "DungeonSession_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DungeonSession" ADD CONSTRAINT "DungeonSession_dungeonId_fkey" FOREIGN KEY ("dungeonId") REFERENCES "Dungeon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
