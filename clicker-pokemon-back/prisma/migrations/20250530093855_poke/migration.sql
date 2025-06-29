-- CreateTable
CREATE TABLE "Trainer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "region" TEXT NOT NULL,
    "money" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "gender" TEXT NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "badge" JSONB,
    "pokemonStarter" JSONB,
    "teamPokemon" JSONB,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnedPokemon" (
    "id" TEXT NOT NULL,
    "pokedexId" INTEGER NOT NULL,
    "trainerId" TEXT NOT NULL,
    "boostAtk" INTEGER NOT NULL DEFAULT 0,
    "boostDef" INTEGER NOT NULL DEFAULT 0,
    "boostRes" INTEGER NOT NULL DEFAULT 0,
    "boostPv" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "genre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OwnedPokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaptureAttempt" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "zone" INTEGER NOT NULL,
    "pokedexId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "isShiny" BOOLEAN NOT NULL,
    "genre" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaptureAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Move" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "power" INTEGER,
    "accuracy" INTEGER,
    "pp" INTEGER,
    "priority" INTEGER,
    "damageClass" TEXT NOT NULL,

    CONSTRAINT "Move_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PokemonMove" (
    "id" TEXT NOT NULL,
    "pokemonId" INTEGER NOT NULL,
    "moveId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "PokemonMove_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PokemonOwnedMove" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "ownedPokemonId" TEXT NOT NULL,
    "moveId" INTEGER NOT NULL,

    CONSTRAINT "PokemonOwnedMove_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_email_key" ON "Trainer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CaptureAttempt_trainerId_key" ON "CaptureAttempt"("trainerId");

-- CreateIndex
CREATE UNIQUE INDEX "PokemonMove_pokemonId_moveId_level_key" ON "PokemonMove"("pokemonId", "moveId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "PokemonOwnedMove_trainerId_ownedPokemonId_moveId_key" ON "PokemonOwnedMove"("trainerId", "ownedPokemonId", "moveId");

-- AddForeignKey
ALTER TABLE "OwnedPokemon" ADD CONSTRAINT "OwnedPokemon_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaptureAttempt" ADD CONSTRAINT "CaptureAttempt_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PokemonMove" ADD CONSTRAINT "PokemonMove_moveId_fkey" FOREIGN KEY ("moveId") REFERENCES "Move"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PokemonOwnedMove" ADD CONSTRAINT "PokemonOwnedMove_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PokemonOwnedMove" ADD CONSTRAINT "PokemonOwnedMove_ownedPokemonId_fkey" FOREIGN KEY ("ownedPokemonId") REFERENCES "OwnedPokemon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PokemonOwnedMove" ADD CONSTRAINT "PokemonOwnedMove_moveId_fkey" FOREIGN KEY ("moveId") REFERENCES "Move"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
