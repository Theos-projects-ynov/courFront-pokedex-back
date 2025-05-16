-- CreateTable
CREATE TABLE "Trainer" (
    "id" SERIAL NOT NULL,
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
    "pokemons" JSONB,
    "teamPokemon" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trainer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_email_key" ON "Trainer"("email");
